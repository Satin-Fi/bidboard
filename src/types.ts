export interface Category {
  name: string
  slug: string
  icon: string
  description?: string
}

export interface LeaderboardListing {
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
  currentBid: number
  clickCount: number
  createdAt: number
  updatedAt?: number
  owner?: string
  gradient?: string
  status?: 'active' | 'pending'
}

// Compatibility alias
export type Listing = LeaderboardListing

export interface Bid {
  id: string
  listingId: string
  amount: number
  bidder: string
  at: number
  oldRank?: number
  newRank?: number
}

export interface ActivityEvent {
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

export interface GlobalStats {
  onlineCount: number
  totalVisitors: number
  totalRevenue: number
  launchHoursAgo: number
  totalListings: number
  totalClicks: number
}

export const CATEGORIES_LIST: Category[] = [
  { name: 'All', slug: 'all', icon: '🔥' },
  { name: 'SEO & AI Visibility', slug: 'seo-ai-visibility', icon: '🔍' },
  { name: 'AI Agents & Infrastructure', slug: 'ai-agents-infrastructure', icon: '🤖' },
  { name: 'AI Media Generation', slug: 'ai-media-generation', icon: '🎨' },
  { name: 'Marketing & Advertising', slug: 'marketing-advertising', icon: '📢' },
  { name: 'Developer Tools', slug: 'developer-tools', icon: '🛠️' },
  { name: 'Productivity & SaaS', slug: 'productivity-saas', icon: '⚡' },
  { name: 'Crypto, Web3 & Investing', slug: 'crypto-web3-investing', icon: '🪙' },
  { name: 'Security, Privacy & Compliance', slug: 'security-privacy-compliance', icon: '🛡️' },
  { name: 'Health, Fitness & Wellness', slug: 'health-fitness-wellness', icon: '🥗' },
  { name: 'Hiring, Jobs & Careers', slug: 'hiring-jobs-careers', icon: '💼' },
  { name: 'Social Media & Creator Tools', slug: 'social-media-creator-tools', icon: '📱' },
  { name: 'Ecommerce & Retail', slug: 'ecommerce-retail', icon: '🛒' },
  { name: 'Education & Learning', slug: 'education-learning', icon: '🎓' },
  { name: 'Other', slug: 'other', icon: '📌' },
]

export type CategorySlug = typeof CATEGORIES_LIST[number]['slug']

