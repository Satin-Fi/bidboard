// Bidboard Pay-to-Rank — Express API Server
import express from 'express'
import cors from 'cors'
import { createHash, randomUUID } from 'node:crypto'
import {
  findUserByEmail, findUserById, insertUser,
  allCategories, findCategoryBySlug, findCategoryById,
  findListingById, findListingByUrl, getLeaderboard, insertListing,
  updateListingBid, activateListing, recalculateRanks, estimateRankForBid,
  insertBid, confirmBid, bidsForListing, findBidBySession,
  insertClick, insertActivity, recentActivity,
  insertPayment, confirmPayment, paymentsForUser, listingsForUser,
  getGlobalStats,
} from './repository.js'
import { hashPassword, verifyPassword, signToken, requireAuth } from './auth.js'
import { createHub } from './hub.js'
import { normalizeUrl, isUrlAllowed } from './urlutils.js'
import { runSeed } from './seed.js'

const app = express()

app.use(cors({ origin: (process.env.CORS_ORIGIN || '*').split(',').map((s) => s.trim()) }))

// Stripe webhook needs raw body
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }))
app.use(express.json())

// ─── Shared hub (wired in startServer) ───────────────────────────────────────
const hub = {
  broadcast() {}, broadcastRankUpdate() {}, broadcastActivity() {},
  broadcastStats() {}, getConnectionCount: () => 0,
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  const { email, name, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' })
  if (findUserByEmail(email)) return res.status(409).json({ error: 'Email already registered.' })
  const user = {
    id: 'u-' + randomUUID().slice(0, 8),
    email: email.trim().toLowerCase(),
    name: (name || email.split('@')[0]).trim(),
    password_hash: await hashPassword(password),
  }
  insertUser(user)
  res.json({ token: signToken(user), user: publicUser(user) })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {}
  const user = findUserByEmail(email || '')
  if (!user || !(await verifyPassword(password || '', user.password_hash)))
    return res.status(401).json({ error: 'Invalid credentials.' })
  res.json({ token: signToken(user), user: publicUser(user) })
})

function publicUser(u) {
  return { id: u.id, email: u.email, name: u.name }
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────
app.get('/api/leaderboard', (req, res) => {
  const { category, sort, q, page = '1', limit = '50' } = req.query
  const { rows, total } = getLeaderboard({
    categorySlug: category,
    sort,
    q,
    page: Math.max(1, parseInt(page)),
    limit: Math.min(100, Math.max(1, parseInt(limit))),
  })
  const listings = rows.map(decorateListing)
  const pageNum = parseInt(page)
  const limitNum = parseInt(limit)
  res.json({
    listings,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
  })
})

function decorateListing(l) {
  if (!l) return null
  return {
    id: l.id,
    rank: l.rank,
    canonicalUrl: l.canonical_url,
    displayUrl: l.display_url,
    title: l.title,
    description: l.description,
    logoUrl: l.logo_url,
    categoryId: l.category_id,
    categoryName: l.category_name || '',
    categorySlug: l.category_slug || '',
    currentBidCents: l.current_bid_cents,
    currentBid: l.current_bid_cents / 100,
    clickCount: l.click_count,
    status: l.status,
    createdAt: l.created_at,
    updatedAt: l.updated_at,
    ownerId: l.owner_id,
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────
app.get('/api/categories', (req, res) => {
  const cats = allCategories()
  res.json({
    categories: cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      icon: c.icon,
      listingCount: c.listing_count || 0,
    })),
  })
})

// ─── Listing preview (URL fetch) ──────────────────────────────────────────────
app.post('/api/listings/preview', async (req, res) => {
  const { url } = req.body || {}
  if (!url) return res.status(400).json({ error: 'URL required.' })

  // Normalize + validate
  let canonical
  try {
    canonical = normalizeUrl(url)
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }
  if (!isUrlAllowed(canonical)) {
    return res.status(400).json({ error: 'This URL type is not allowed on Bidboard.' })
  }

  // Check if already listed
  const existing = findListingByUrl(canonical)

  // Fetch metadata
  let title = '', description = '', logoUrl = null
  try {
    const { fetchMetadata } = await import('./metadata.js')
    const meta = await fetchMetadata(canonical)
    title = meta.title || ''
    description = meta.description || ''
    logoUrl = meta.logoUrl || null
  } catch {}

  res.json({
    title,
    description,
    logoUrl,
    canonicalUrl: canonical,
    existingListing: existing ? decorateListing(existing) : null,
  })
})

// ─── Rank estimation ──────────────────────────────────────────────────────────
app.post('/api/listings/estimate-rank', (req, res) => {
  const { bidCents, excludeId } = req.body || {}
  if (!bidCents || bidCents < 0) return res.status(400).json({ error: 'bidCents required.' })
  const result = estimateRankForBid(Number(bidCents), excludeId)
  res.json(result)
})

// ─── Listing detail ───────────────────────────────────────────────────────────
app.get('/api/listings/:id', (req, res) => {
  const listing = findListingById(req.params.id)
  if (!listing || listing.status === 'deleted') return res.status(404).json({ error: 'Not found.' })
  const bids = bidsForListing(req.params.id)
  // Simple rank history from bid records
  const rankHistory = bids
    .filter((b) => b.new_rank)
    .map((b) => ({ rank: b.new_rank, date: b.created_at }))
    .reverse()
  res.json({
    listing: decorateListing(listing),
    bids: bids.map((b) => ({
      id: b.id,
      newBidCents: b.new_bid_cents,
      newBid: b.new_bid_cents / 100,
      previousBidCents: b.previous_bid_cents,
      previousBid: b.previous_bid_cents / 100,
      amountPaidCents: b.amount_paid_cents,
      amountPaid: b.amount_paid_cents / 100,
      oldRank: b.old_rank,
      newRank: b.new_rank,
      createdAt: b.created_at,
    })),
    rankHistory,
  })
})

// ─── Click tracking ───────────────────────────────────────────────────────────
app.post('/api/listings/:id/click', (req, res) => {
  const listing = findListingById(req.params.id)
  if (!listing || listing.status !== 'active') return res.status(404).json({ error: 'Not found.' })
  const ip = req.ip || req.socket?.remoteAddress || ''
  const ua = req.get('user-agent') || ''
  insertClick({
    listing_id: req.params.id,
    ip_hash: createHash('sha256').update(ip).digest('hex').slice(0, 16),
    user_agent_hash: createHash('sha256').update(ua).digest('hex').slice(0, 16),
    referrer: req.get('referer') || '',
    device_type: /mobile/i.test(ua) ? 'mobile' : 'desktop',
  })
  res.json({ ok: true })
})

// ─── Create checkout (listing + bid) ─────────────────────────────────────────
app.post('/api/checkout', requireAuth, async (req, res) => {
  const { url, title, description, logoUrl, categoryId, bidCents, existingListingId } = req.body || {}

  if (!url || !title || !bidCents || !categoryId) {
    return res.status(400).json({ error: 'url, title, categoryId, and bidCents are required.' })
  }
  if (Number(bidCents) < 500) {
    return res.status(400).json({ error: 'Minimum bid is $5.' })
  }

  // Normalize URL
  let canonical
  try {
    canonical = normalizeUrl(url)
  } catch (e) {
    return res.status(400).json({ error: e.message })
  }

  // Find or create listing
  let listing = existingListingId
    ? findListingById(existingListingId)
    : findListingByUrl(canonical)

  if (!listing) {
    // Create new pending listing
    listing = insertListing({
      owner_id: req.userId,
      canonical_url: canonical,
      display_url: canonical.replace(/^https?:\/\/(www\.)?/, ''),
      title: title.trim().slice(0, 80),
      description: (description || '').trim().slice(0, 160),
      logo_url: logoUrl || null,
      category_id: categoryId,
    })
  }

  const previousBid = listing.current_bid_cents || 0

  // Server-side minimum bid validation
  const minimumBid = previousBid + 100 // at least $1 more
  if (Number(bidCents) < minimumBid && previousBid > 0) {
    return res.status(400).json({
      error: `Minimum bid is $${minimumBid / 100}. Someone may have just outbid you.`,
      currentMinimum: minimumBid,
    })
  }

  const amountPaid = previousBid > 0
    ? Math.max(Number(bidCents) - previousBid, 100) // pay difference
    : Number(bidCents)

  // Create pending bid record
  const bid = insertBid({
    listing_id: listing.id,
    user_id: req.userId,
    previous_bid_cents: previousBid,
    new_bid_cents: Number(bidCents),
    amount_paid_cents: amountPaid,
    old_rank: listing.rank,
    stripe_session_id: null,
  })

  // Create checkout (mock or real Stripe)
  const sessionId = 'sess_' + randomUUID().slice(0, 12)
  const baseUrl = process.env.APP_URL || 'http://localhost:5173'

  // Mock checkout URL — in production this would be Stripe Checkout session URL
  const checkoutUrl = `${baseUrl}/payment/success?session=${sessionId}&listing=${encodeURIComponent(title)}&rank=${estimateRankForBid(Number(bidCents), listing.id).rank}&bid=${amountPaid}`

  // Update bid record with session
  const { getDb } = await import('./repository.js')
  const db = getDb()
  db.prepare('UPDATE bids SET stripe_session_id = ? WHERE id = ?').run(sessionId, bid.id)

  // Store payment record
  insertPayment({
    user_id: req.userId,
    listing_id: listing.id,
    bid_id: bid.id,
    stripe_session_id: sessionId,
    amount_cents: amountPaid,
  })

  // Auto-confirm for demo/mock checkout
  setTimeout(() => confirmPaymentAndUpdate(sessionId, listing.id, Number(bidCents), bid.id), 50)

  res.json({ checkoutUrl, sessionId })
})

// ─── Stripe webhook ───────────────────────────────────────────────────────────
app.post('/api/webhooks/stripe', async (req, res) => {
  let event
  try {
    event = JSON.parse(req.body.toString())
  } catch {
    return res.status(400).json({ error: 'Invalid payload.' })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const bid = findBidBySession(session.id)
    if (bid && bid.status !== 'confirmed') {
      await confirmPaymentAndUpdate(session.id, bid.listing_id, bid.new_bid_cents, bid.id)
    }
  }

  res.json({ received: true })
})

async function confirmPaymentAndUpdate(sessionId, listingId, newBidCents, bidId) {
  // Atomic: update listing bid + recalculate ranks
  updateListingBid(null, listingId, newBidCents)
  activateListing(listingId)
  recalculateRanks()
  confirmPayment(sessionId)

  const updatedListing = findListingById(listingId)
  if (!updatedListing) return

  const newRank = updatedListing.rank
  confirmBid(bidId, newRank)

  // Log activity
  const actType = newRank === 1 ? 'claimed_top' : 'rank_up'
  const actRecord = insertActivity({
    listing_id: listingId,
    listing_title: updatedListing.title,
    display_url: updatedListing.display_url,
    type: actType,
    bid_amount_cents: newBidCents,
    old_rank: updatedListing.rank,
    new_rank: newRank,
  })

  // Broadcast live updates
  const { rows } = getLeaderboard({ limit: 100 })
  hub.broadcastRankUpdate(rows.map(decorateListing))
  hub.broadcastActivity({
    id: actRecord.id,
    type: actType,
    listingId,
    listingTitle: updatedListing.title,
    displayUrl: updatedListing.display_url,
    bidAmount: newBidCents / 100,
    oldRank: updatedListing.rank,
    newRank,
    createdAt: Date.now(),
  })
}

// ─── Activity ─────────────────────────────────────────────────────────────────
app.get('/api/activity', (req, res) => {
  const limit = Math.min(50, parseInt(req.query.limit || '20'))
  const events = recentActivity(limit)
  res.json({
    events: events.map((e) => ({
      id: e.id,
      type: e.type,
      listingId: e.listing_id,
      listingTitle: e.listing_title,
      displayUrl: e.display_url,
      bidAmount: e.bid_amount_cents / 100,
      oldRank: e.old_rank,
      newRank: e.new_rank,
      createdAt: e.created_at,
    })),
  })
})

// ─── Stats ────────────────────────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  const stats = getGlobalStats()
  stats.activeViewers = hub.getConnectionCount()
  res.json(stats)
})

// ─── User dashboard ───────────────────────────────────────────────────────────
app.get('/api/me/listings', requireAuth, (req, res) => {
  const listings = listingsForUser(req.userId)
  res.json({ listings: listings.map(decorateListing) })
})

app.get('/api/me/payments', requireAuth, (req, res) => {
  const payments = paymentsForUser(req.userId)
  res.json({
    payments: payments.map((p) => ({
      id: p.id,
      listingId: p.listing_id,
      listingTitle: p.listing_title,
      amountCents: p.amount_cents,
      amount: p.amount_cents / 100,
      status: p.status,
      createdAt: p.created_at,
    })),
  })
})

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ ok: true, ts: Date.now() }))

// ─── Start ────────────────────────────────────────────────────────────────────
export function startServer() {
  const port = Number(process.env.PORT) || 4000
  const server = app.listen(port, () => {
    console.log(`Bidboard API listening on :${port}`)
  })

  const realHub = createHub(server)
  ;['broadcast', 'broadcastRankUpdate', 'broadcastActivity', 'broadcastStats', 'getConnectionCount'].forEach((k) => {
    hub[k] = realHub[k]
  })

  // Broadcast viewer count every 30s
  setInterval(() => {
    hub.broadcastStats({ activeViewers: hub.getConnectionCount() })
  }, 30000)

  return server
}

// Auto-seed on first run
if (process.env.AUTO_SEED !== 'false') {
  runSeed().catch(console.error)
}

if (process.argv[1] && process.argv[1].endsWith('index.js')) {
  startServer()
}
