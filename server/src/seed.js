// Auto-seed: inserts categories + 25 realistic listings if DB is empty
import { getDb, insertListing, activateListing, recalculateRanks, insertActivity, insertUser } from './repository.js'
import { hashPassword } from './auth.js'
import { randomUUID } from 'node:crypto'

const CATEGORIES = [
  { id: 'cat-ai', name: 'AI & Automation', slug: 'ai-automation', icon: '🤖', description: 'AI tools, LLMs, and automation platforms.' },
  { id: 'cat-dev', name: 'Developer Tools', slug: 'developer-tools', icon: '🛠', description: 'Tools for engineers and developers.' },
  { id: 'cat-prod', name: 'Productivity', slug: 'productivity', icon: '⚡', description: 'Apps that help you get more done.' },
  { id: 'cat-mkt', name: 'Marketing', slug: 'marketing', icon: '📢', description: 'Marketing, SEO, and growth tools.' },
  { id: 'cat-design', name: 'Design & Creative', slug: 'design-creative', icon: '🎨', description: 'Design tools and creative platforms.' },
  { id: 'cat-saas', name: 'SaaS & Business', slug: 'saas-business', icon: '💼', description: 'B2B software and business tools.' },
  { id: 'cat-launch', name: 'Startups & Launches', slug: 'startups-launches', icon: '🚀', description: 'New products and startups.' },
  { id: 'cat-games', name: 'Games & Entertainment', slug: 'games-entertainment', icon: '🎮', description: 'Games and entertainment products.' },
  { id: 'cat-edu', name: 'Education', slug: 'education', icon: '📚', description: 'Learning and educational platforms.' },
  { id: 'cat-health', name: 'Health & Fitness', slug: 'health-fitness', icon: '💪', description: 'Health, fitness, and wellness apps.' },
  { id: 'cat-social', name: 'Social & Creator', slug: 'social-creator', icon: '✨', description: 'Creator tools and social platforms.' },
  { id: 'cat-crypto', name: 'Crypto & Web3', slug: 'crypto-web3', icon: '⛓', description: 'Blockchain, DeFi, and Web3 products.' },
  { id: 'cat-fin', name: 'Finance & Fintech', slug: 'finance-fintech', icon: '💰', description: 'Finance and fintech tools.' },
  { id: 'cat-ecom', name: 'Ecommerce', slug: 'ecommerce', icon: '🛒', description: 'Ecommerce and retail tools.' },
  { id: 'cat-other', name: 'Other', slug: 'other', icon: '📌', description: 'Everything else.' },
]

const SEED_LISTINGS = [
  { url: 'https://linear.app', title: 'Linear', desc: 'The issue tracker built for high-performance teams.', cat: 'cat-dev', bid: 1500000 },
  { url: 'https://vercel.com', title: 'Vercel', desc: 'Deploy web projects with the best frontend developer experience.', cat: 'cat-dev', bid: 1200000 },
  { url: 'https://raycast.com', title: 'Raycast', desc: 'A blazingly fast, totally extendable launcher for macOS.', cat: 'cat-prod', bid: 980000 },
  { url: 'https://stripe.com', title: 'Stripe', desc: 'Payment infrastructure for the internet. Powering millions of businesses.', cat: 'cat-fin', bid: 850000 },
  { url: 'https://notion.so', title: 'Notion', desc: 'The all-in-one workspace for notes, projects, and collaboration.', cat: 'cat-prod', bid: 720000 },
  { url: 'https://figma.com', title: 'Figma', desc: 'Collaborative design tool for teams who want to build great products.', cat: 'cat-design', bid: 650000 },
  { url: 'https://openai.com', title: 'OpenAI', desc: 'AI research and deployment company. Building safe AGI for the benefit of humanity.', cat: 'cat-ai', bid: 580000 },
  { url: 'https://github.com', title: 'GitHub', desc: 'The complete developer platform to build, scale, and deliver secure software.', cat: 'cat-dev', bid: 510000 },
  { url: 'https://framer.com', title: 'Framer', desc: 'Ship sites that look handcrafted. The web builder for creative teams.', cat: 'cat-design', bid: 440000 },
  { url: 'https://arc.net', title: 'Arc Browser', desc: 'The browser that works for you. Built by The Browser Company.', cat: 'cat-prod', bid: 390000 },
  { url: 'https://supabase.com', title: 'Supabase', desc: 'Build in a weekend. Scale to millions. The open-source Firebase alternative.', cat: 'cat-dev', bid: 340000 },
  { url: 'https://clerk.com', title: 'Clerk', desc: 'The most comprehensive User Management Platform. Ship auth in minutes.', cat: 'cat-dev', bid: 295000 },
  { url: 'https://anthropic.com', title: 'Anthropic', desc: 'AI safety company and maker of Claude, the frontier AI assistant.', cat: 'cat-ai', bid: 255000 },
  { url: 'https://resend.com', title: 'Resend', desc: 'Email for developers. The best way to reach humans instead of spam folders.', cat: 'cat-dev', bid: 210000 },
  { url: 'https://cursor.sh', title: 'Cursor', desc: 'The AI-first code editor. Built to make you extraordinarily productive.', cat: 'cat-ai', bid: 175000 },
  { url: 'https://planetscale.com', title: 'PlanetScale', desc: 'The database for developers. Unlimited scale, zero downtime deploys.', cat: 'cat-dev', bid: 145000 },
  { url: 'https://loom.com', title: 'Loom', desc: 'Record and share videos instantly. The async video messaging tool.', cat: 'cat-prod', bid: 120000 },
  { url: 'https://beehiiv.com', title: 'Beehiiv', desc: 'The newsletter platform built for growth. Used by the world\'s best newsletters.', cat: 'cat-mkt', bid: 98000 },
  { url: 'https://perplexity.ai', title: 'Perplexity AI', desc: 'The AI answer engine. Find answers with sources, not just links.', cat: 'cat-ai', bid: 82000 },
  { url: 'https://cal.com', title: 'Cal.com', desc: 'Scheduling infrastructure for everyone. Open-source Calendly alternative.', cat: 'cat-prod', bid: 67000 },
  { url: 'https://dub.co', title: 'Dub.co', desc: 'Open-source link management infrastructure for modern marketing teams.', cat: 'cat-mkt', bid: 54000 },
  { url: 'https://posthog.com', title: 'PostHog', desc: 'The open source product analytics platform. All tools in one.', cat: 'cat-saas', bid: 42000 },
  { url: 'https://retool.com', title: 'Retool', desc: 'Build internal tools, remarkably fast. The fastest way to build custom business software.', cat: 'cat-dev', bid: 31000 },
  { url: 'https://render.com', title: 'Render', desc: 'Cloud hosting for developers. Deploy anything — from simple static sites to complex apps.', cat: 'cat-dev', bid: 22000 },
  { url: 'https://uploadthing.com', title: 'UploadThing', desc: 'The easiest way to add file uploads to your full stack TypeScript application.', cat: 'cat-dev', bid: 14000 },
]

export async function runSeed() {
  const db = getDb()

  // Check if already seeded
  const existing = db.prepare('SELECT COUNT(*) as n FROM listings').get()
  if (existing?.n > 0) return

  console.log('🌱 Seeding database…')

  // Insert categories
  const catStmt = db.prepare('INSERT OR IGNORE INTO categories (id, name, slug, icon, description) VALUES (?, ?, ?, ?, ?)')
  const seedCats = db.transaction(() => {
    for (const c of CATEGORIES) {
      catStmt.run(c.id, c.name, c.slug, c.icon, c.description)
    }
  })
  seedCats()

  // Create demo users
  const ownerHash = await hashPassword('password123')
  db.prepare('INSERT OR IGNORE INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)').run('u-owner', 'owner@bidboard.app', 'Demo Owner', ownerHash)
  db.prepare('INSERT OR IGNORE INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)').run('u-buyer', 'buyer@bidboard.app', 'Demo Buyer', ownerHash)

  // Insert listings with varied bids
  for (let i = 0; i < SEED_LISTINGS.length; i++) {
    const s = SEED_LISTINGS[i]
    const display = s.url.replace(/^https?:\/\/(www\.)?/, '')
    const id = 'lst-seed-' + String(i).padStart(2, '0')
    db.prepare(`
      INSERT OR IGNORE INTO listings (id, owner_id, canonical_url, display_url, title, description, category_id, current_bid_cents, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `).run(id, 'u-owner', s.url, display, s.title, s.desc, s.cat, s.bid, Date.now() - (i * 3600000 * 2))

    // Add click counts proportional to rank
    db.prepare('UPDATE listings SET click_count = ? WHERE id = ?').run(
      Math.floor(s.bid / 100 * 0.8 + Math.random() * 500),
      id
    )
  }

  // Recalculate ranks
  recalculateRanks()

  // Seed some activity events
  const listings = db.prepare("SELECT * FROM listings WHERE status = 'active' ORDER BY rank ASC LIMIT 10").all()
  for (const l of listings) {
    db.prepare(`
      INSERT INTO activity (id, listing_id, listing_title, display_url, type, bid_amount_cents, new_rank, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'act-seed-' + l.id,
      l.id,
      l.title,
      l.display_url,
      l.rank === 1 ? 'claimed_top' : 'rank_up',
      l.current_bid_cents,
      l.rank,
      Date.now() - Math.floor(Math.random() * 86400000)
    )
  }

  console.log(`✅ Seeded ${SEED_LISTINGS.length} listings and ${CATEGORIES.length} categories.`)
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed().catch(console.error)
}
