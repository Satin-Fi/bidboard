import { create } from 'zustand'
import type { Bid, Listing } from '../types'
import { seedListings } from '../data/seed'

interface BidState {
  listings: Listing[]
  bids: Bid[]
  /** advance auction clocks — flips live->ended when past endsAt */
  tick: () => void
  placeBid: (listingId: string, amount: number, bidder: string) => { ok: boolean; error?: string }
  createListing: (l: Omit<Listing, 'id' | 'currentBid' | 'bidCount' | 'topBidder' | 'status'>) => string
}

let counter = 0
const newId = () => `bb-${Date.now().toString(36)}-${counter++}`

export const useBidStore = create<BidState>((set, get) => ({
  listings: seedListings,
  bids: [],

  tick: () =>
    set((state) => ({
      listings: state.listings.map((l) =>
        l.status === 'live' && Date.now() >= l.endsAt
          ? { ...l, status: 'ended' }
          : l,
      ),
    })),

  placeBid: (listingId, amount, bidder) => {
    const listing = get().listings.find((l) => l.id === listingId)
    if (!listing) return { ok: false, error: 'Listing not found.' }
    if (listing.status !== 'live') return { ok: false, error: 'This auction has ended.' }
    const minNext = listing.currentBid > 0 ? listing.currentBid + 100 : listing.reserve
    if (amount < minNext)
      return { ok: false, error: `Bid must be at least ${formatBidFloor(minNext)}.` }

    const bid: Bid = { id: newId(), listingId, amount, bidder, at: Date.now() }
    set((state) => ({
      bids: [bid, ...state.bids],
      listings: state.listings.map((l) =>
        l.id === listingId
          ? {
              ...l,
              currentBid: amount,
              bidCount: l.bidCount + 1,
              topBidder: bidder,
            }
          : l,
      ),
    }))
    return { ok: true }
  },

  createListing: (input) => {
    const id = newId()
    const listing: Listing = {
      ...input,
      id,
      currentBid: 0,
      bidCount: 0,
      topBidder: null,
      status: 'live',
    }
    set((state) => ({ listings: [listing, ...state.listings] }))
    return id
  },
}))

function formatBidFloor(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}
