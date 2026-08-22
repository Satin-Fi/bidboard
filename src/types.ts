export type ListingFormat =
  | 'Static Bulk'
  | 'Digital Large'
  | 'Digital Small'
  | 'Transit'
  | 'Street Furniture'

export type Category =
  | 'Billboard'
  | 'Transit'
  | 'Street Furniture'
  | 'Retail'
  | 'Airport'
  | 'Stadium'

export type AuctionType = 'timed' | 'reverse'

export interface Listing {
  id: string
  owner: string
  /** owner has passed verification (simulated) */
  verified: boolean
  title: string
  city: string
  address: string
  category: Category
  format: ListingFormat
  /** Tailwind-ish gradient used as the slot artwork placeholder */
  gradient: string
  /** estimated weekly impressions */
  weeklyImpressions: number
  /** estimated daily views */
  viewsPerDay: number
  /** Reserve / floor price in USD (timed = reserve, reverse = floor) */
  reserve: number
  /** reverse auctions only: price declines from this toward reserve */
  startPrice?: number
  /** reverse auctions only: how much the price drops per hour */
  declinePerHour?: number
  /** Suggested rate if bought outright (per week), USD */
  ratePerWeek?: number
  /** Geo for the map pin */
  lat: number
  lng: number
  description: string
  endsAt: number
  createdAt: number
  auctionType: AuctionType
  status: 'live' | 'ended'
  // --- runtime / mutable ---
  currentBid: number
  bidCount: number
  topBidder: string | null
  // --- enrichment ---
  size: string
  illumination: string
  audience: string
  dayparting: boolean
}

export interface Bid {
  id: string
  listingId: string
  amount: number
  bidder: string
  at: number
  /** for reverse auctions this bid won immediately */
  winning?: boolean
}

export const FORMATS: ListingFormat[] = [
  'Static Bulk',
  'Digital Large',
  'Digital Small',
  'Transit',
  'Street Furniture',
]

export const CATEGORIES: Category[] = [
  'Billboard',
  'Transit',
  'Street Furniture',
  'Retail',
  'Airport',
  'Stadium',
]
