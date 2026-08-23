// Auto-seed: inserts categories + starter listings if DB is empty
import { getDb, recalculateRanks } from './repository.js'
import { hashPassword } from './auth.js'

const CATEGORIES = [
  { id: 'cat-ai', name: 'AI & Automation', slug: 'ai-automation', icon: 'ai-automation', description: 'AI tools, LLMs, and automation platforms.' },
  { id: 'cat-dev', name: 'Developer Tools', slug: 'developer-tools', icon: 'developer-tools', description: 'Tools for engineers and developers.' },
  { id: 'cat-prod', name: 'Productivity & SaaS', slug: 'productivity', icon: 'productivity', description: 'Apps that help you get more done.' },
  { id: 'cat-mkt', name: 'Marketing & SEO', slug: 'marketing', icon: 'marketing', description: 'Marketing, SEO, and growth tools.' },
  { id: 'cat-design', name: 'Design & Creative', slug: 'design-creative', icon: 'design-creative', description: 'Design tools and creative platforms.' },
  { id: 'cat-launch', name: 'Startups & Launches', slug: 'startups-launches', icon: 'startups-launches', description: 'New products and startups.' },
  { id: 'cat-crypto', name: 'Crypto & Web3', slug: 'crypto-web3', icon: 'crypto-web3', description: 'Blockchain, DeFi, and Web3 products.' },
  { id: 'cat-sec', name: 'Security & Privacy', slug: 'security-privacy', icon: 'security-privacy', description: 'Security and privacy tools.' },
  { id: 'cat-fin', name: 'Finance & Fintech', slug: 'finance-fintech', icon: 'finance-fintech', description: 'Finance and fintech tools.' },
  { id: 'cat-ecom', name: 'Ecommerce', slug: 'ecommerce', icon: 'ecommerce', description: 'Ecommerce and retail tools.' },
  { id: 'cat-social', name: 'Social & Creator', slug: 'social-creator', icon: 'social-creator', description: 'Creator tools and social platforms.' },
  { id: 'cat-health', name: 'Health & Fitness', slug: 'health-fitness', icon: 'health-fitness', description: 'Health, fitness, and wellness apps.' },
  { id: 'cat-edu', name: 'Education', slug: 'education', icon: 'education', description: 'Learning and educational platforms.' },
  { id: 'cat-games', name: 'Games & Entertainment', slug: 'games-entertainment', icon: 'games-entertainment', description: 'Games and entertainment products.' },
  { id: 'cat-other', name: 'Other', slug: 'other', icon: 'other', description: 'Everything else.' },
]

const SEED_LISTINGS = [
  { url: 'https://bidboard.app', title: 'Bidboard', desc: 'The public attention market where anyone can buy their way to the top. Rank is determined by bid amount.', cat: 'cat-launch', bid: 1000 },
  { url: 'https://indiehackers.com', title: 'Indie Hacker Hub', desc: 'Community for founders building profitable online businesses and side projects.', cat: 'cat-dev', bid: 500 },
  { url: 'https://producthunt.com', title: 'Product Launch Radar', desc: 'The place to discover your next favorite tech product and launch your own.', cat: 'cat-launch', bid: 300 },
  { url: 'https://github.com', title: 'Vibe Coder', desc: 'AI-assisted modern rapid development tools and repositories.', cat: 'cat-dev', bid: 200 },
  { url: 'https://opensource.org', title: 'Open Source Spotlight', desc: 'Highlighting top open source projects and developer utilities.', cat: 'cat-dev', bid: 100 },
]

export async function runSeed(force = false) {
  const db = getDb()

  if (force) {
    db.prepare('DELETE FROM clicks').run()
    db.prepare('DELETE FROM bids').run()
    db.prepare('DELETE FROM payments').run()
    db.prepare('DELETE FROM activity').run()
    db.prepare('DELETE FROM listings').run()
  }

  // Insert categories
  const catStmt = db.prepare('INSERT OR REPLACE INTO categories (id, name, slug, icon, description) VALUES (?, ?, ?, ?, ?)')
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

  const count = db.prepare('SELECT COUNT(*) as n FROM listings').get()
  if (count?.n === 0) {
    for (let i = 0; i < SEED_LISTINGS.length; i++) {
      const s = SEED_LISTINGS[i]
      const display = s.url.replace(/^https?:\/\/(www\.)?/, '')
      const id = 'lst-seed-' + String(i).padStart(2, '0')
      db.prepare(`
        INSERT OR IGNORE INTO listings (id, owner_id, canonical_url, display_url, title, description, category_id, current_bid_cents, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
      `).run(id, 'u-owner', s.url, display, s.title, s.desc, s.cat, s.bid, Date.now() - (i * 3600000))

      db.prepare('UPDATE listings SET click_count = ? WHERE id = ?').run(
        Math.floor(s.bid / 100 * 20 + 5),
        id
      )
    }

    recalculateRanks()

    const listings = db.prepare("SELECT * FROM listings WHERE status = 'active' ORDER BY rank ASC").all()
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
        Date.now() - Math.floor(Math.random() * 3600000)
      )
    }
  }

  console.log('✅ Clean database seed applied.')
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed(true).catch(console.error)
}
