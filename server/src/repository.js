// JSON-file repository. The interface mirrors what a SQL/Prisma repo would
// expose, so swapping to Postgres/Supabase later is a drop-in change.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const DATA_FILE = process.env.DATA_FILE || './data/db.json'

function ensureDir() {
  const dir = dirname(DATA_FILE)
  if (dir && dir !== '.' && !existsSync(dir)) mkdirSync(dir, { recursive: true })
}

export function loadDb() {
  ensureDir()
  if (!existsSync(DATA_FILE)) return { users: [], listings: [], bids: [], watches: [], savedSearches: [] }
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf8'))
  } catch {
    return { users: [], listings: [], bids: [], watches: [], savedSearches: [] }
  }
}

export function saveDb(db) {
  ensureDir()
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2))
}

// --- Users ---
export function findUserByEmail(db, email) {
  return db.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase())
}
export function findUserById(db, id) {
  return db.users.find((u) => u.id === id)
}
export function insertUser(db, user) {
  db.users.push(user)
  return user
}

// --- Listings ---
export function findListing(db, id) {
  return db.listings.find((l) => l.id === id)
}
export function allLiveListings(db) {
  return db.listings.filter((l) => l.status === 'live')
}

// --- Bids ---
export function insertBid(db, bid) {
  db.bids.unshift(bid)
  return bid
}
export function bidsForListing(db, id) {
  return db.bids.filter((b) => b.listingId === id)
}

// --- Watches ---
export function setWatch(db, userId, listingId, on) {
  db.watches = db.watches.filter((w) => !(w.userId === userId && w.listingId === listingId))
  if (on) db.watches.push({ userId, listingId })
}
export function watchedIds(db, userId) {
  return db.watches.filter((w) => w.userId === userId).map((w) => w.listingId)
}

// --- Saved searches ---
export function insertSavedSearch(db, s) {
  db.savedSearches.push(s)
  return s
}
export function removeSavedSearch(db, userId, id) {
  db.savedSearches = db.savedSearches.filter((s) => !(s.id === id && s.userId === userId))
}
export function savedSearchesForUser(db, userId) {
  return db.savedSearches.filter((s) => s.userId === userId)
}
