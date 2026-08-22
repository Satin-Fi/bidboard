export type ListingFormat =
  | 'Static Bulk'
  | 'Digital Large'
  | 'Digital Small'
  | 'Transit'
  | 'Street Furniture'

export interface Listing {
  id: string
  owner: string
  title: string
  city: string
  address: string
  /** Tailwind-ish gradient used as the slot artwork placeholder */
  gradient: string
  format: ListingFormat
  /** Estimated weekly impressions */
  weeklyImpressions: number
  /** Reserve / starting price in USD */
  reserve: number
  description: string
  /** Epoch ms when the auction closes */
  endsAt: number
  /** Highest bid so far (0 = no bids yet) */
  currentBid: number
  bidCount: number
  topBidder: string | null
  status: 'live' | 'ended'
  // --- enrichment ---
  /** Epoch ms when the listing was created (for "New" + sorting) */
  createdAt: number
  /** Physical size, e.g. "14×48 ft" */
  size: string
  /** Illumination / build type */
  illumination: string
  /** Target audience description */
  audience: string
  /** Dayparted / scheduled buying available */
  dayparting: boolean
}

export interface Bid {
  id: string
  listingId: string
  amount: number
  bidder: string
  at: number
}

export const FORMATS: ListingFormat[] = [
  'Static Bulk',
  'Digital Large',
  'Digital Small',
  'Transit',
  'Street Furniture',
]
