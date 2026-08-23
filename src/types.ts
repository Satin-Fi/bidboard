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
  { name: 'All', slug: 'all', icon: 'all' },
  { name: 'AI & Automation', slug: 'ai-automation', icon: 'ai-automation' },
  { name: 'Developer Tools', slug: 'developer-tools', icon: 'developer-tools' },
  { name: 'Productivity & SaaS', slug: 'productivity', icon: 'productivity' },
  { name: 'Marketing & SEO', slug: 'marketing', icon: 'marketing' },
  { name: 'Design & Creative', slug: 'design-creative', icon: 'design-creative' },
  { name: 'Startups & Launches', slug: 'startups-launches', icon: 'startups-launches' },
  { name: 'Crypto & Web3', slug: 'crypto-web3', icon: 'crypto-web3' },
  { name: 'Security & Privacy', slug: 'security-privacy', icon: 'security-privacy' },
  { name: 'Finance & Fintech', slug: 'finance-fintech', icon: 'finance-fintech' },
  { name: 'Ecommerce', slug: 'ecommerce', icon: 'ecommerce' },
  { name: 'Social & Creator', slug: 'social-creator', icon: 'social-creator' },
  { name: 'Health & Fitness', slug: 'health-fitness', icon: 'health-fitness' },
  { name: 'Education', slug: 'education', icon: 'education' },
  { name: 'Games & Entertainment', slug: 'games-entertainment', icon: 'games-entertainment' },
  { name: 'Other', slug: 'other', icon: 'other' },
]

export type CategorySlug = typeof CATEGORIES_LIST[number]['slug']

export interface CheckoutSessionRequest {
  url: string
  title: string
  description?: string
  categorySlug: string
  amount: number
  email: string
  bidderName?: string
  isBusiness?: boolean
  listingId?: string
}

export interface CheckoutSessionResponse {
  sessionId: string
  checkoutUrl?: string
  status: 'pending' | 'completed' | 'redirect'
  amount: number
  estimatedRank: number
}

export interface CompletedOrder {
  id: string
  sessionId: string
  amount: number
  email: string
  url: string
  title: string
  description: string
  categorySlug: string
  rank: number
  createdAt: number
}

