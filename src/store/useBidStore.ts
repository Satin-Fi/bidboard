import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Bid, Listing, ListingFormat } from '../types'
import { seedListings } from '../data/seed'

export type SortKey = 'ending' | 'bid' | 'new' | 'impr'

interface BidState {
  listings: Listing[]
  bids: Bid[]
  watched: string[]
  sort: SortKey
  /** advance auction clocks — flips live->ended when past endsAt */
  tick: () => void
  placeBid: (
    listingId: string,
    amount: number,
    bidder: string,
  ) => { ok: boolean; error?: string }
  /** automated rival bid (no toast) */
  rivalBid: (listingId: string) => void
  createListing: (
    l: Omit<
      Listing,
      'id' | 'currentBid' | 'bidCount' | 'topBidder' | 'status' | 'createdAt'
    >,
  ) => string
  toggleWatch: (id: string) => void
  setSort: (s: SortKey) => void
  resetDemo: () => void
}

let counter = 0
const newId = () => `bb-${Date.now().toString(36)}-${counter++}`

const RIVALS = [
  'Apex Beverages',
  'Coastline Realty',
  'North Branch Coffee',
  'Foundry Labs',
  'BBQ Nation',
  'Vertex Auto',
  'Lumen Cosmetics',
  'Harbor Sports',
]

const ANTISNIPE_MS = 3 * 60 * 1000

export const useBidStore = create<BidState>()(
  persist(
    (set, get) => ({
      listings: seedListings,
      bids: [],
      watched: [],
      sort: 'ending',

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
        const minNext =
          listing.currentBid > 0 ? listing.currentBid + 100 : listing.reserve
        if (amount < minNext)
          return { ok: false, error: `Bid must be at least ${formatFloor(minNext)}.` }

        const bid: Bid = {
          id: newId(),
          listingId,
          amount,
          bidder,
          at: Date.now(),
        }
        set((state) => {
          const listings = state.listings.map((l) =>
            l.id === listingId
              ? {
                  ...l,
                  currentBid: amount,
                  bidCount: l.bidCount + 1,
                  topBidder: bidder,
                  // anti-snipe: a late bid extends the auction by 3 minutes
                  endsAt:
                    l.endsAt - Date.now() < ANTISNIPE_MS
                      ? Date.now() + ANTISNIPE_MS
                      : l.endsAt,
                }
              : l,
          )
          return { bids: [bid, ...state.bids], listings }
        })
        return { ok: true }
      },

      rivalBid: (listingId) => {
        const listing = get().listings.find((l) => l.id === listingId)
        if (!listing || listing.status !== 'live') return
        const minNext =
          listing.currentBid > 0 ? listing.currentBid + 100 : listing.reserve
        // bid somewhere between min and min + 8% (capped to keep it believable)
        const bump = Math.max(100, Math.round((minNext * 0.08) / 100) * 100)
        const amount = minNext + Math.floor(Math.random() * (bump / 100 + 1)) * 100
        const bidder = RIVALS[Math.floor(Math.random() * RIVALS.length)]
        get().placeBid(listingId, amount, bidder)
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
          createdAt: Date.now(),
        }
        set((state) => ({ listings: [listing, ...state.listings] }))
        return id
      },

      toggleWatch: (id) =>
        set((state) => ({
          watched: state.watched.includes(id)
            ? state.watched.filter((w) => w !== id)
            : [...state.watched, id],
        })),

      setSort: (s) => set({ sort: s }),

      resetDemo: () =>
        set({ listings: seedListings, bids: [], watched: [], sort: 'ending' }),
    }),
    {
      name: 'bidboard-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        listings: s.listings,
        bids: s.bids,
        watched: s.watched,
        sort: s.sort,
      }),
    },
  ),
)

function formatFloor(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export { RIVALS }
export type { ListingFormat }
