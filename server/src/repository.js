// SQLite repository for Bidboard Pay-to-Rank Leaderboard
import { createRequire } from 'module'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { randomUUID } from 'node:crypto'

const require = createRequire(import.meta.url)
const Database = require('better-sqlite3')

const DATA_FILE = process.env.DATA_FILE || './data/bidboard.db'

function ensureDir() {
  const dir = dirname(DATA_FILE)
  if (dir && dir !== '.' && !existsSync(dir)) mkdirSync(dir, { recursive: true })
}

let _db = null

export function getDb() {
  if (_db) return _db
  ensureDir()
  _db = new Database(DATA_FILE)
  _db.pragma('journal_mode = WAL')
  _db.pragma('foreign_keys = ON')
  initSchema(_db)
  return _db
}

function initSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      icon TEXT DEFAULT '📌',
      active INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );

    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY,
      owner_id TEXT REFERENCES users(id),
      canonical_url TEXT UNIQUE NOT NULL,
      display_url TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      logo_url TEXT,
      category_id TEXT REFERENCES categories(id),
      current_bid_cents INTEGER NOT NULL DEFAULT 0,
      rank INTEGER NOT NULL DEFAULT 9999,
      click_count INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );

    CREATE INDEX IF NOT EXISTS idx_listings_bid ON listings(current_bid_cents DESC);
    CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
    CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
    CREATE INDEX IF NOT EXISTS idx_listings_url ON listings(canonical_url);

    CREATE TABLE IF NOT EXISTS bids (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL REFERENCES listings(id),
      user_id TEXT REFERENCES users(id),
      previous_bid_cents INTEGER NOT NULL DEFAULT 0,
      new_bid_cents INTEGER NOT NULL,
      amount_paid_cents INTEGER NOT NULL,
      old_rank INTEGER,
      new_rank INTEGER,
      stripe_session_id TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );

    CREATE INDEX IF NOT EXISTS idx_bids_listing ON bids(listing_id);
    CREATE INDEX IF NOT EXISTS idx_bids_session ON bids(stripe_session_id);

    CREATE TABLE IF NOT EXISTS clicks (
      id TEXT PRIMARY KEY,
      listing_id TEXT NOT NULL REFERENCES listings(id),
      ip_hash TEXT,
      user_agent_hash TEXT,
      referrer TEXT,
      device_type TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );

    CREATE INDEX IF NOT EXISTS idx_clicks_listing ON clicks(listing_id);

    CREATE TABLE IF NOT EXISTS activity (
      id TEXT PRIMARY KEY,
      listing_id TEXT REFERENCES listings(id),
      listing_title TEXT NOT NULL,
      display_url TEXT NOT NULL,
      type TEXT NOT NULL,
      bid_amount_cents INTEGER NOT NULL DEFAULT 0,
      old_rank INTEGER,
      new_rank INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );

    CREATE INDEX IF NOT EXISTS idx_activity_created ON activity(created_at DESC);

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      listing_id TEXT REFERENCES listings(id),
      bid_id TEXT REFERENCES bids(id),
      stripe_session_id TEXT UNIQUE,
      amount_cents INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );

    CREATE INDEX IF NOT EXISTS idx_payments_session ON payments(stripe_session_id);
    CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
  `)
}

// ─── Users ───────────────────────────────────────────────────────────────────
export function findUserByEmail(email) {
  return getDb().prepare('SELECT * FROM users WHERE lower(email) = lower(?)').get(email)
}
export function findUserById(id) {
  return getDb().prepare('SELECT * FROM users WHERE id = ?').get(id)
}
export function insertUser(user) {
  getDb().prepare('INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)').run(
    user.id, user.email, user.name, user.password_hash
  )
  return user
}

// ─── Categories ──────────────────────────────────────────────────────────────
export function allCategories() {
  return getDb().prepare(`
    SELECT c.*, COUNT(l.id) as listing_count
    FROM categories c
    LEFT JOIN listings l ON l.category_id = c.id AND l.status = 'active'
    GROUP BY c.id
    ORDER BY listing_count DESC, c.name ASC
  `).all()
}
export function findCategoryBySlug(slug) {
  return getDb().prepare('SELECT * FROM categories WHERE slug = ?').get(slug)
}
export function findCategoryById(id) {
  return getDb().prepare('SELECT * FROM categories WHERE id = ?').get(id)
}

// ─── Listings ─────────────────────────────────────────────────────────────────
export function findListingById(id) {
  return getDb().prepare(`
    SELECT l.*, c.name as category_name, c.slug as category_slug
    FROM listings l
    LEFT JOIN categories c ON c.id = l.category_id
    WHERE l.id = ?
  `).get(id)
}
export function findListingByUrl(canonicalUrl) {
  return getDb().prepare(`
    SELECT l.*, c.name as category_name, c.slug as category_slug
    FROM listings l
    LEFT JOIN categories c ON c.id = l.category_id
    WHERE l.canonical_url = ?
  `).get(canonicalUrl)
}

export function getLeaderboard({ categorySlug, sort = 'bid', q = '', page = 1, limit = 50 } = {}) {
  let where = ["l.status = 'active'"]
  const params = []

  if (categorySlug) {
    where.push('c.slug = ?')
    params.push(categorySlug)
  }
  if (q) {
    where.push("(lower(l.title) LIKE lower(?) OR lower(l.canonical_url) LIKE lower(?))")
    params.push(`%${q}%`, `%${q}%`)
  }

  const whereClause = 'WHERE ' + where.join(' AND ')

  const orderMap = {
    bid: 'l.current_bid_cents DESC, l.created_at ASC',
    clicks: 'l.click_count DESC, l.current_bid_cents DESC',
    newest: 'l.created_at DESC',
    movers: 'l.click_count DESC, l.current_bid_cents DESC',
  }
  const orderClause = `ORDER BY ${orderMap[sort] || orderMap.bid}`

  const countRow = getDb().prepare(`SELECT COUNT(*) as total FROM listings l LEFT JOIN categories c ON c.id = l.category_id ${whereClause}`).get(...params)
  const total = countRow?.total || 0

  const offset = (page - 1) * limit
  const rows = getDb().prepare(`
    SELECT l.*, c.name as category_name, c.slug as category_slug
    FROM listings l
    LEFT JOIN categories c ON c.id = l.category_id
    ${whereClause}
    ${orderClause}
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset)

  return { rows, total }
}

export function insertListing(data) {
  const id = 'lst-' + randomUUID().slice(0, 8)
  getDb().prepare(`
    INSERT INTO listings (id, owner_id, canonical_url, display_url, title, description, logo_url, category_id, current_bid_cents, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(id, data.owner_id || null, data.canonical_url, data.display_url, data.title, data.description || '', data.logo_url || null, data.category_id || null, 0)
  return findListingById(id)
}

export function updateListingBid(db_or_unused, listingId, bidCents) {
  getDb().prepare('UPDATE listings SET current_bid_cents = ?, updated_at = ?, status = ? WHERE id = ?')
    .run(bidCents, Date.now(), 'active', listingId)
}

export function activateListing(listingId) {
  getDb().prepare("UPDATE listings SET status = 'active', updated_at = ? WHERE id = ?").run(Date.now(), listingId)
}

// Recalculate all ranks — atomic update
export function recalculateRanks() {
  const db = getDb()
  const listings = db.prepare("SELECT id FROM listings WHERE status = 'active' ORDER BY current_bid_cents DESC, created_at ASC").all()
  const stmt = db.prepare('UPDATE listings SET rank = ? WHERE id = ?')
  const updateMany = db.transaction((items) => {
    for (let i = 0; i < items.length; i++) {
      stmt.run(i + 1, items[i].id)
    }
  })
  updateMany(listings)
}

// Estimate rank for a given bid amount
export function estimateRankForBid(bidCents, excludeId = null) {
  let query = "SELECT COUNT(*) as cnt FROM listings WHERE status = 'active' AND current_bid_cents > ?"
  const params = [bidCents]
  if (excludeId) {
    query += ' AND id != ?'
    params.push(excludeId)
  }
  const row = getDb().prepare(query).get(...params)
  const total = getDb().prepare("SELECT COUNT(*) as cnt FROM listings WHERE status = 'active'").get()
  return {
    rank: (row?.cnt || 0) + 1,
    total: total?.cnt || 0,
  }
}

// ─── Bids ─────────────────────────────────────────────────────────────────────
export function insertBid(data) {
  const id = 'bid-' + randomUUID().slice(0, 8)
  getDb().prepare(`
    INSERT INTO bids (id, listing_id, user_id, previous_bid_cents, new_bid_cents, amount_paid_cents, old_rank, stripe_session_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(id, data.listing_id, data.user_id || null, data.previous_bid_cents, data.new_bid_cents, data.amount_paid_cents, data.old_rank || null, data.stripe_session_id || null)
  return getDb().prepare('SELECT * FROM bids WHERE id = ?').get(id)
}

export function confirmBid(bidId, newRank) {
  getDb().prepare("UPDATE bids SET status = 'confirmed', new_rank = ? WHERE id = ?").run(newRank, bidId)
}

export function bidsForListing(listingId) {
  return getDb().prepare(`
    SELECT * FROM bids WHERE listing_id = ? AND status = 'confirmed' ORDER BY created_at DESC LIMIT 20
  `).all(listingId)
}

export function findBidBySession(sessionId) {
  return getDb().prepare('SELECT * FROM bids WHERE stripe_session_id = ?').get(sessionId)
}

// ─── Clicks ───────────────────────────────────────────────────────────────────
export function insertClick(data) {
  const id = 'clk-' + randomUUID().slice(0, 8)
  // Duplicate prevention: one click per ip_hash + listing per hour
  const recent = getDb().prepare(
    'SELECT id FROM clicks WHERE listing_id = ? AND ip_hash = ? AND created_at > ?'
  ).get(data.listing_id, data.ip_hash, Date.now() - 3600000)
  if (recent) return false
  getDb().prepare('INSERT INTO clicks (id, listing_id, ip_hash, user_agent_hash, referrer, device_type) VALUES (?, ?, ?, ?, ?, ?)').run(
    id, data.listing_id, data.ip_hash, data.user_agent_hash, data.referrer || '', data.device_type || 'unknown'
  )
  getDb().prepare('UPDATE listings SET click_count = click_count + 1 WHERE id = ?').run(data.listing_id)
  return true
}

// ─── Activity ─────────────────────────────────────────────────────────────────
export function insertActivity(data) {
  const id = 'act-' + randomUUID().slice(0, 8)
  getDb().prepare(`
    INSERT INTO activity (id, listing_id, listing_title, display_url, type, bid_amount_cents, old_rank, new_rank)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, data.listing_id, data.listing_title, data.display_url, data.type, data.bid_amount_cents, data.old_rank || null, data.new_rank)
  return getDb().prepare('SELECT * FROM activity WHERE id = ?').get(id)
}

export function recentActivity(limit = 30) {
  return getDb().prepare('SELECT * FROM activity ORDER BY created_at DESC LIMIT ?').all(limit)
}

// ─── Payments ─────────────────────────────────────────────────────────────────
export function insertPayment(data) {
  const id = 'pay-' + randomUUID().slice(0, 8)
  getDb().prepare(`
    INSERT INTO payments (id, user_id, listing_id, bid_id, stripe_session_id, amount_cents, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `).run(id, data.user_id || null, data.listing_id, data.bid_id, data.stripe_session_id, data.amount_cents)
  return id
}

export function confirmPayment(sessionId) {
  getDb().prepare("UPDATE payments SET status = 'succeeded' WHERE stripe_session_id = ?").run(sessionId)
}

export function paymentsForUser(userId) {
  return getDb().prepare(`
    SELECT p.*, l.title as listing_title
    FROM payments p
    LEFT JOIN listings l ON l.id = p.listing_id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
    LIMIT 50
  `).all(userId)
}

export function listingsForUser(userId) {
  return getDb().prepare(`
    SELECT l.*, c.name as category_name, c.slug as category_slug
    FROM listings l
    LEFT JOIN categories c ON c.id = l.category_id
    WHERE l.owner_id = ? AND l.status != 'deleted'
    ORDER BY l.rank ASC
  `).all(userId)
}

// ─── Stats ────────────────────────────────────────────────────────────────────
export function getGlobalStats() {
  const db = getDb()
  const total = db.prepare("SELECT COUNT(*) as n FROM listings WHERE status = 'active'").get()
  const bids = db.prepare("SELECT SUM(current_bid_cents) as s FROM listings WHERE status = 'active'").get()
  const clicks = db.prepare("SELECT SUM(click_count) as s FROM listings WHERE status = 'active'").get()
  const top = db.prepare("SELECT MAX(current_bid_cents) as m FROM listings WHERE status = 'active'").get()
  const today = db.prepare("SELECT COUNT(*) as n FROM listings WHERE status = 'active' AND created_at > ?").get(Date.now() - 86400000)
  return {
    totalListings: total?.n || 0,
    totalBidsCents: bids?.s || 0,
    totalBids: (bids?.s || 0) / 100,
    totalClicks: clicks?.s || 0,
    topBidCents: top?.m || 0,
    topBid: (top?.m || 0) / 100,
    listingsToday: today?.n || 0,
    activeViewers: 0, // set dynamically from WS connection count
  }
}
