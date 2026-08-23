// Auto-seed: inserts categories (0 fake listings so users can claim #1 organically from $1)
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

  recalculateRanks()
  console.log('✅ Clean database ready with 0 fake listings. Ready for real submissions!')
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  runSeed(true).catch(console.error)
}
