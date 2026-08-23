import fs from 'node:fs'
import path from 'node:path'

export interface DbListing {
  id: string
  rank: number
  title: string
  url: string
  displayUrl: string
  description: string
  logoUrl?: string
  logoText?: string
  logoBg?: string
  category: string
  categorySlug: string
  currentBidCents: number
  currentBid: number
  clickCount: number
  createdAt: number
  updatedAt?: number
  owner?: string
  status: 'active' | 'pending'
}

export interface DbActivity {
  id: string
  type: 'outbid' | 'claim_top' | 'new_spot' | 'rank_up'
  listingId: string
  listingTitle: string
  displayUrl: string
  amount: number
  oldRank?: number
  newRank: number
  createdAt: number
}

export interface DbPayment {
  sessionId: string
  amountCents: number
  email: string
  url: string
  status: string
  verifiedAt: number
}

interface DatabaseSchema {
  listings: DbListing[]
  activities: DbActivity[]
  payments: DbPayment[]
  stats: {
    totalVisitors: number
    totalClicks: number
  }
}

const DB_FILE = path.join(process.cwd(), '.db_store.json')

// In-memory cache
let memDb: DatabaseSchema | null = null

function getInitialData(): DatabaseSchema {
  // 50 authentic products
  const rawListings = [
    { title: 'Linear', url: 'https://linear.app', desc: 'The issue tracking tool you will actually enjoy using. Built for high-performance software teams.', cat: 'Productivity & SaaS', slug: 'productivity', bid: 15000 },
    { title: 'Supabase', url: 'https://supabase.com', desc: 'The open source Firebase alternative with Postgres, Auth, Realtime subscriptions, Storage, and Edge Functions.', cat: 'Developer Tools', slug: 'developer-tools', bid: 12500 },
    { title: 'Cursor', url: 'https://cursor.com', desc: 'The AI-first code editor designed for pair programming with frontier models. Built on VS Code.', cat: 'Developer Tools', slug: 'developer-tools', bid: 10800 },
    { title: 'Raycast', url: 'https://raycast.com', desc: 'Supercharged productivity tool for Mac. Replace Spotlight with blazing-fast commands and extensions.', cat: 'Productivity & SaaS', slug: 'productivity', bid: 9200 },
    { title: 'Vercel', url: 'https://vercel.com', desc: 'The Frontend Cloud. Build, preview, and ship delightful user experiences at scale with Next.js.', cat: 'Developer Tools', slug: 'developer-tools', bid: 8400 },
    { title: 'Resend', url: 'https://resend.com', desc: 'Email API built for developers. First-class React email templates and modern delivery infrastructure.', cat: 'Developer Tools', slug: 'developer-tools', bid: 7100 },
    { title: 'v0 by Vercel', url: 'https://v0.dev', desc: 'Generative UI system powered by AI. Generate beautiful React components with Tailwind CSS in seconds.', cat: 'AI & Automation', slug: 'ai-automation', bid: 6500 },
    { title: 'Perplexity AI', url: 'https://perplexity.ai', desc: 'Where knowledge begins. An AI-powered conversational answer engine with verified real-time sources.', cat: 'AI & Automation', slug: 'ai-automation', bid: 5900 },
    { title: 'Midjourney', url: 'https://midjourney.com', desc: 'An independent research lab exploring new mediums of thought and expanding the imaginative powers.', cat: 'Design & Creative', slug: 'design-creative', bid: 5200 },
    { title: 'Framer', url: 'https://framer.com', desc: 'Design and ship beautiful responsive websites with zero code. Interactive canvas with animations.', cat: 'Design & Creative', slug: 'design-creative', bid: 4800 },
    { title: 'Cal.com', url: 'https://cal.com', desc: 'Open source scheduling infrastructure for everyone. Self-hostable, API-first calendar booking.', cat: 'Productivity & SaaS', slug: 'productivity', bid: 4300 },
    { title: 'Dub.co', url: 'https://dub.co', desc: 'Open-source link management platform for modern marketing teams with analytics and custom domains.', cat: 'Marketing & SEO', slug: 'marketing', bid: 3900 },
    { title: 'PostHog', url: 'https://posthog.com', desc: 'The all-in-one developer platform for product analytics, session replay, feature flags, and surveys.', cat: 'Developer Tools', slug: 'developer-tools', bid: 3500 },
    { title: 'Clerk', url: 'https://clerk.com', desc: 'Complete user management and authentication for React, Next.js, and modern full-stack web frameworks.', cat: 'Developer Tools', slug: 'developer-tools', bid: 3100 },
    { title: 'Stripe', url: 'https://stripe.com', desc: 'Financial infrastructure for the internet. Millions of companies use Stripe to accept payments online.', cat: 'Finance & Fintech', slug: 'finance-fintech', bid: 2800 },
  ]

  const listings: DbListing[] = rawListings.map((p, idx) => ({
    id: 'prod_' + (idx + 1),
    rank: idx + 1,
    title: p.title,
    url: p.url,
    displayUrl: p.url.replace(/^https?:\/\/(www\.)?/, ''),
    description: p.desc,
    category: p.cat,
    categorySlug: p.slug,
    currentBidCents: p.bid * 100,
    currentBid: p.bid,
    clickCount: Math.floor(Math.random() * 2000) + 150,
    createdAt: Date.now() - (idx + 1) * 3600000,
    status: 'active',
  }))

  const activities: DbActivity[] = [
    { id: 'act_1', type: 'claim_top', listingId: 'prod_1', listingTitle: 'Linear', displayUrl: 'linear.app', amount: 15000, newRank: 1, createdAt: Date.now() - 300000 },
    { id: 'act_2', type: 'outbid', listingId: 'prod_2', listingTitle: 'Supabase', displayUrl: 'supabase.com', amount: 12500, oldRank: 3, newRank: 2, createdAt: Date.now() - 900000 },
    { id: 'act_3', type: 'rank_up', listingId: 'prod_3', listingTitle: 'Cursor', displayUrl: 'cursor.com', amount: 10800, oldRank: 5, newRank: 3, createdAt: Date.now() - 1800000 },
  ]

  return {
    listings,
    activities,
    payments: [],
    stats: { totalVisitors: 14280, totalClicks: 9420 },
  }
}

function loadDb(): DatabaseSchema {
  if (memDb) return memDb
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8')
      memDb = JSON.parse(content)
      return memDb!
    }
  } catch (err) {
    console.warn('Could not read persistent DB file, using memory:', err)
  }
  memDb = getInitialData()
  saveDb()
  return memDb
}

function saveDb() {
  if (!memDb) return
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(memDb, null, 2), 'utf-8')
  } catch (err) {
    console.warn('Could not write persistent DB file:', err)
  }
}

export function getAllListings(categorySlug?: string, search?: string): DbListing[] {
  const db = loadDb()
  let list = [...db.listings]

  if (categorySlug && categorySlug !== 'all') {
    list = list.filter((l) => l.categorySlug === categorySlug)
  }
  if (search && search.trim()) {
    const q = search.toLowerCase()
    list = list.filter((l) => l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q) || l.description.toLowerCase().includes(q))
  }

  // Deterministic Pay-to-Rank sort: highest bid first, ties broken by earlier creation
  list.sort((a, b) => b.currentBidCents - a.currentBidCents || a.createdAt - b.createdAt)
  return list
}

export function getListingByUrl(url: string): DbListing | undefined {
  const db = loadDb()
  const clean = url.trim().toLowerCase().replace(/\/$/, '')
  return db.listings.find((l) => l.url.trim().toLowerCase().replace(/\/$/, '') === clean)
}

export function recordVerifiedPaymentAndRank(params: {
  sessionId: string
  url: string
  title: string
  description?: string
  categorySlug: string
  amountCents: number
  email: string
  bidderName?: string
}): { rank: number; listing: DbListing } {
  const db = loadDb()
  const amountDollars = params.amountCents / 100

  // 1. Check if payment already processed
  const existingPay = db.payments.find((p) => p.sessionId === params.sessionId)
  if (existingPay) {
    const existingListing = getListingByUrl(params.url)
    if (existingListing) return { rank: existingListing.rank, listing: existingListing }
  }

  // 2. Find or create listing
  let target = getListingByUrl(params.url)
  let oldRank = target?.rank

  if (target) {
    // Existing listing topped up
    target.currentBidCents = Math.max(target.currentBidCents, params.amountCents)
    target.currentBid = target.currentBidCents / 100
    if (params.title) target.title = params.title
    if (params.description) target.description = params.description
    if (params.categorySlug) target.categorySlug = params.categorySlug
    target.updatedAt = Date.now()
  } else {
    // New listing
    target = {
      id: 'prod_' + (db.listings.length + 1) + '_' + Date.now().toString(36),
      rank: 999,
      title: params.title || params.url.replace(/^https?:\/\/(www\.)?/, ''),
      url: params.url,
      displayUrl: params.url.replace(/^https?:\/\/(www\.)?/, ''),
      description: params.description || '',
      category: params.categorySlug || 'AI & Automation',
      categorySlug: params.categorySlug || 'ai-automation',
      currentBidCents: params.amountCents,
      currentBid: amountDollars,
      clickCount: 1,
      createdAt: Date.now(),
      status: 'active',
    }
    db.listings.push(target)
  }

  // 3. Recalculate deterministic ranks across all listings
  db.listings.sort((a, b) => b.currentBidCents - a.currentBidCents || a.createdAt - b.createdAt)
  db.listings.forEach((l, idx) => {
    l.rank = idx + 1
  })

  const newRank = target.rank

  // 4. Record Activity Event
  const actType = newRank === 1 ? 'claim_top' : oldRank ? 'outbid' : 'new_spot'
  db.activities.unshift({
    id: 'act_' + Date.now(),
    type: actType,
    listingId: target.id,
    listingTitle: target.title,
    displayUrl: target.displayUrl,
    amount: amountDollars,
    oldRank,
    newRank,
    createdAt: Date.now(),
  })

  // Keep max 50 activities
  if (db.activities.length > 50) db.activities.length = 50

  // 5. Record verified payment
  db.payments.push({
    sessionId: params.sessionId,
    amountCents: params.amountCents,
    email: params.email,
    url: params.url,
    status: 'succeeded',
    verifiedAt: Date.now(),
  })

  saveDb()
  return { rank: newRank, listing: target }
}

export function getDbActivities(): DbActivity[] {
  const db = loadDb()
  return db.activities
}

export function getDbStats() {
  const db = loadDb()
  const totalRevenue = db.listings.reduce((acc, l) => acc + l.currentBid, 0)
  const totalClicks = db.listings.reduce((acc, l) => acc + l.clickCount, 0)
  return {
    onlineCount: 42,
    totalVisitors: db.stats.totalVisitors,
    totalRevenue,
    launchHoursAgo: 72,
    totalListings: db.listings.length,
    totalClicks,
  }
}
