import express from 'express'
import cors from 'cors'
import { randomUUID } from 'node:crypto'
import { loadDb, saveDb, findListing, allLiveListings, insertBid, bidsForListing, findUserByEmail, findUserById, insertUser, setWatch, watchedIds, insertSavedSearch, removeSavedSearch, savedSearchesForUser } from './repository.js'
import { hashPassword, verifyPassword, signToken, requireAuth } from './auth.js'
import { minNextBid, reversePrice, validateTimedBid, maybeExtend, displayPrice } from './rules.js'
import { createHub } from './hub.js'

const app = express()
app.use(cors({ origin: (process.env.CORS_ORIGIN || '*').split(',').map((s) => s.trim()) }))
app.use(express.json())

// Shared hub reference; real implementation attached in startServer().
const hub = { broadcast() {}, listingUpdated() {}, bidPlaced() {}, auctionEnded() {}, snapshot() {} }

app.post('/api/auth/register', async (req, res) => {
  const { email, name, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' })
  const db = loadDb()
  if (findUserByEmail(db, email)) return res.status(409).json({ error: 'Email already registered.' })
  const user = {
    id: 'u-' + randomUUID().slice(0, 8),
    email, name: name || email.split('@')[0],
    passwordHash: await hashPassword(password), verified: false, createdAt: Date.now(),
  }
  insertUser(db, user)
  saveDb(db)
  res.json({ token: signToken(user), user: publicUser(user) })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {}
  const db = loadDb()
  const user = findUserByEmail(db, email || '')
  if (!user || !(await verifyPassword(password || '', user.passwordHash)))
    return res.status(401).json({ error: 'Invalid credentials.' })
  res.json({ token: signToken(user), user: publicUser(user) })
})

function publicUser(u) {
  return { id: u.id, email: u.email, name: u.name, verified: u.verified }
}

// ---------- Listings ----------
app.get('/api/listings', (req, res) => {
  const db = loadDb()
  const live = allLiveListings(db)
  res.json(live.map(decorate(db)))
})

app.get('/api/listings/:id', (req, res) => {
  const db = loadDb()
  const listing = findListing(db, req.params.id)
  if (!listing) return res.status(404).json({ error: 'Not found.' })
  const bids = bidsForListing(db, req.params.id).slice(0, 50)
  res.json({ listing: decorate(db)(listing), bids })
})

function decorate(db) {
  return (l) => ({
    ...l,
    displayPrice: displayPrice(l),
    watched: false, // per-user watch set on the client after auth
  })
}

// ---------- Bidding ----------
app.post('/api/listings/:id/bid', requireAuth, (req, res) => {
  const { amount, bidder } = req.body || {}
  const db = loadDb()
  const listing = findListing(db, req.params.id)
  if (!listing) return res.status(404).json({ error: 'Not found.' })
  // a bidder name is the auth name, unless provided
  const bidderName = bidder || req.user.name
  if (listing.auctionType === 'timed') {
    const v = validateTimedBid(listing, Number(amount))
    if (!v.ok) return res.status(400).json({ error: v.error })
    const bid = {
      id: 'b-' + randomUUID().slice(0, 8), listingId: listing.id,
      amount: Number(amount), bidder: bidderName, at: Date.now(),
    }
    insertBid(db, bid)
    listing.currentBid = Number(amount)
    listing.bidCount += 1
    listing.topBidder = bidderName
    listing.endsAt = maybeExtend(listing)
    saveDb(db)
    hub.bidPlaced(bid, decorate(db)(listing))
    return res.json({ ok: true, bid, listing: decorate(db)(listing) })
  }
  return res.status(400).json({ error: 'Use /accept for Dutch auctions.' })
})

// Dutch auction: accept current declining price
app.post('/api/listings/:id/accept', requireAuth, (req, res) => {
  const db = loadDb()
  const listing = findListing(db, req.params.id)
  if (!listing) return res.status(404).json({ error: 'Not found.' })
  if (listing.status !== 'live' || listing.auctionType !== 'reverse')
    return res.status(400).json({ error: 'Not open for acceptance.' })
  const price = reversePrice(listing)
  const bidderName = (req.body && req.body.bidder) || req.user.name
  const bid = { id: 'b-' + randomUUID().slice(0, 8), listingId: listing.id, amount: price, bidder: bidderName, at: Date.now(), winning: true }
  insertBid(db, bid)
  listing.currentBid = price
  listing.bidCount += 1
  listing.topBidder = bidderName
  listing.status = 'ended'
  saveDb(db)
  hub.bidPlaced(bid, decorate(db)(listing))
  hub.auctionEnded(decorate(db)(listing))
  return res.json({ ok: true, bid, listing: decorate(db)(listing) })
})

// Seller closes early
app.post('/api/listings/:id/close', requireAuth, (req, res) => {
  const db = loadDb()
  const listing = findListing(db, req.params.id)
  if (!listing) return res.status(404).json({ error: 'Not found.' })
  if (listing.status !== 'live') return res.status(400).json({ error: 'Auction already ended.' })
  listing.status = 'ended'
  listing.endsAt = Date.now()
  saveDb(db)
  hub.auctionEnded(decorate(db)(listing))
  res.json({ ok: true, listing: decorate(db)(listing) })
})

// ---------- Create listing (seller) ----------
app.post('/api/listings', requireAuth, (req, res) => {
  const b = req.body || {}
  const required = ['title', 'owner', 'city', 'category', 'format', 'auctionType']
  for (const k of required) if (!b[k]) return res.status(400).json({ error: `Missing ${k}.` })
  if (!b.reserve || Number(b.reserve) <= 0) return res.status(400).json({ error: 'Reserve must be positive.' })
  if (b.auctionType === 'reverse' && (!b.startPrice || Number(b.startPrice) <= Number(b.reserve)))
    return res.status(400).json({ error: 'Dutch start price must exceed reserve.' })
  const db = loadDb()
  const listing = {
    id: 'bb-' + randomUUID().slice(0, 8),
    ownerId: req.userId, owner: b.owner, verified: !!b.verified,
    title: b.title, city: b.city, address: b.address || b.city,
    category: b.category, format: b.format, gradient: b.gradient || 'from-sky-500 via-cyan-500 to-emerald-400',
    weeklyImpressions: Number(b.weeklyImpressions) || 0, viewsPerDay: Number(b.viewsPerDay) || 0,
    reserve: Number(b.reserve), startPrice: b.startPrice ? Number(b.startPrice) : undefined,
    declinePerHour: b.auctionType === 'reverse' ? (Number(b.declinePerHour) || 0) : undefined,
    ratePerWeek: b.ratePerWeek ? Number(b.ratePerWeek) : undefined,
    lat: Number(b.lat) || 39.8, lng: Number(b.lng) || -98.5,
    description: b.description || '', endsAt: Date.now() + (Number(b.hours) || 48) * 60 * 60 * 1000,
    createdAt: Date.now(), auctionType: b.auctionType, status: 'live',
    currentBid: 0, bidCount: 0, topBidder: null,
    size: b.size || '—', illumination: b.illumination || '', audience: b.audience || 'General public',
    dayparting: !!b.dayparting,
  }
  db.listings.unshift(listing)
  saveDb(db)
  hub.listingUpdated(decorate(db)(listing))
  res.json({ ok: true, listing: decorate(db)(listing) })
})

// ---------- Watchlist ----------
app.get('/api/watch', requireAuth, (req, res) => {
  const db = loadDb()
  res.json({ watched: watchedIds(db, req.userId) })
})
app.post('/api/watch', requireAuth, (req, res) => {
  const { listingId, on } = req.body || {}
  const db = loadDb()
  setWatch(db, req.userId, listingId, !!on)
  saveDb(db)
  res.json({ ok: true, watched: watchedIds(db, req.userId) })
})

// ---------- Saved searches ----------
app.get('/api/saved-searches', requireAuth, (req, res) => {
  const db = loadDb()
  res.json({ savedSearches: savedSearchesForUser(db, req.userId) })
})
app.post('/api/saved-searches', requireAuth, (req, res) => {
  const b = req.body || {}
  const db = loadDb()
  const s = { id: 's-' + randomUUID().slice(0, 8), userId: req.userId, q: b.q || '', format: b.format || 'All', category: b.category || 'All' }
  insertSavedSearch(db, s)
  saveDb(db)
  res.json({ ok: true, savedSearch: s })
})
app.delete('/api/saved-searches/:id', requireAuth, (req, res) => {
  const db = loadDb()
  removeSavedSearch(db, req.userId, req.params.id)
  saveDb(db)
  res.json({ ok: true })
})

// ---------- Health ----------
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }))

// Re-wire the hub onto the actual HTTP server (createHub earlier used port 0).
export function startServer() {
  const port = Number(process.env.PORT) || 4000
  const server = app.listen(port, () => {
    console.log(`Bidboard API listening on :${port}`)
  })
  const realHub = createHub(server)
  // attach hub methods to the shared `hub` reference used by routes
  ;['broadcast', 'listingUpdated', 'bidPlaced', 'auctionEnded', 'snapshot'].forEach((k) => {
    hub[k] = realHub[k]
  })
  runMarketMaker(realHub)
  return server
}

// ---------- Market maker (simulated rival activity + clock) ----------
const RIVALS = ['Apex Beverages', 'Coastline Realty', 'North Branch Coffee', 'Foundry Labs', 'BBQ Nation', 'Vertex Auto', 'Lumen Cosmetics', 'Harbor Sports']

function runMarketMaker(h) {
  // every 7s: maybe a rival bids on a live TIMED auction; close expired auctions
  setInterval(() => {
    const db = loadDb()
    const now = Date.now()
    let changed = false
    for (const l of db.listings) {
      if (l.status !== 'live') continue
      if (now >= l.endsAt) {
        l.status = 'ended'
        changed = true
        h.auctionEnded(decorate(db)(l))
        continue
      }
      if (l.auctionType === 'timed' && Math.random() < 0.25) {
        const min = minNextBid(l)
        const bump = Math.max(100, Math.round((min * 0.08) / 100) * 100)
        const amount = min + Math.floor(Math.random() * (bump / 100 + 1)) * 100
        const bid = { id: 'b-' + randomUUID().slice(0, 8), listingId: l.id, amount, bidder: RIVALS[Math.floor(Math.random() * RIVALS.length)], at: now }
        db.bids.unshift(bid)
        l.currentBid = amount
        l.bidCount += 1
        l.topBidder = bid.bidder
        changed = true
        h.bidPlaced(bid, decorate(db)(l))
      }
    }
    if (changed) saveDb(db)
  }, 7000)
}

// Auto-seed on first run if empty
if (process.env.AUTO_SEED !== 'false') {
  const db = loadDb()
  if (db.listings.length === 0) {
    import('./seed.js').then(() => console.log('Auto-seeded repository.')).catch(() => {})
  }
}

if (process.argv[1] && process.argv[1].endsWith('index.js')) {
  startServer()
}
