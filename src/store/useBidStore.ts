import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Bid, Listing, ListingFormat, Category, AuctionType } from '../types'
import { seedListings } from '../data/seed'

export type SortKey = 'ending' | 'bid' | 'new' | 'impr' | 'cpm'

interface SavedSearch {
  id: string
  q: string
  format: ListingFormat | 'All'
  category: Category | 'All'
}

interface BidState {
  listings: Listing[]
  bids: Bid[]
  watched: string[]
  sort: SortKey
  savedSearches: SavedSearch[]
  /** advance auction clocks — flips live->ended when past endsAt */
  tick: () => void
  /** current displayed price for a listing (handles reverse decline) */
  displayPrice: (l: Listing) => number
  placeBid: (listingId: string, amount: number, bidder: string) => { ok: boolean; error?: string; winning?: boolean }
  /** automated rival bid (timed) */
  rivalBid: (listingId: string) => void
  /** accept the current (declining) price of a reverse auction */
  acceptReverse: (listingId: string, bidder: string) => { ok: boolean; error?: string }
  createListing: (l: Omit<Listing, 'id' | 'currentBid' | 'bidCount' | 'topBidder' | 'status' | 'createdAt'>) => string
  /** seller closes an auction early */
  closeEarly: (listingId: string) => void
  toggleWatch: (id: string) => void
  setSort: (s: SortKey) => void
  saveSearch: (s: Omit<SavedSearch, 'id'>) => void
  removeSearch: (id: string) => void
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

/** current price for a reverse (Dutch) auction, declining from startPrice. */
function reversePrice(l: Listing, nowMs = Date.now()): number {
  if (l.auctionType !== 'reverse' || !l.startPrice) return l.currentBid
  const elapsedH = Math.max(0, (nowMs - l.createdAt) / (60 * 60 * 1000))
  const dropped = (l.declinePerHour ?? 0) * elapsedH
  const price = Math.max(l.reserve, l.startPrice - dropped)
  return Math.round(price)
}

export const useBidStore = create<BidState>()(
  persist(
    (set, get) => ({
      listings: seedListings,
      bids: [],
      watched: [],
      sort: 'ending',
      savedSearches: [],

      tick: () =>
        set((state) => ({
          listings: state.listings.map((l) =>
            l.status === 'live' && Date.now() >= l.endsAt
              ? { ...l, status: 'ended' }
              : l,
          ),
        })),

      displayPrice: (l) =>
        l.auctionType === 'reverse'
          ? reversePrice(l)
          : l.currentBid > 0
            ? l.currentBid
            : l.reserve,

      placeBid: (listingId, amount, bidder) => {
        const listing = get().listings.find((l) => l.id === listingId)
        if (!listing) return { ok: false, error: 'Listing not found.' }
        if (listing.status !== 'live') return { ok: false, error: 'This auction has ended.' }
        const minNext =
          listing.currentBid > 0 ? listing.currentBid + 100 : listing.reserve
        if (amount < minNext)
          return { ok: false, error: `Bid must be at least ${formatFloor(minNext)}.` }

        const bid: Bid = { id: newId(), listingId, amount, bidder, at: Date.now() }
        set((state) => {
          const listings = state.listings.map((l) =>
            l.id === listingId
              ? {
                  ...l,
                  currentBid: amount,
                  bidCount: l.bidCount + 1,
                  topBidder: bidder,
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
        if (!listing || listing.status !== 'live' || listing.auctionType !== 'timed') return
        const minNext =
          listing.currentBid > 0 ? listing.currentBid + 100 : listing.reserve
        const bump = Math.max(100, Math.round((minNext * 0.08) / 100) * 100)
        const amount = minNext + Math.floor(Math.random() * (bump / 100 + 1)) * 100
        const bidder = RIVALS[Math.floor(Math.random() * RIVALS.length)]
        get().placeBid(listingId, amount, bidder)
      },

      acceptReverse: (listingId, bidder) => {
        const listing = get().listings.find((l) => l.id === listingId)
        if (!listing) return { ok: false, error: 'Listing not found.' }
        if (listing.status !== 'live' || listing.auctionType !== 'reverse')
          return { ok: false, error: 'This auction is not open.' }
        const price = reversePrice(listing)
        const bid: Bid = { id: newId(), listingId, amount: price, bidder, at: Date.now(), winning: true }
        set((state) => ({
          bids: [bid, ...state.bids],
          listings: state.listings.map((l) =>
            l.id === listingId
              ? { ...l, currentBid: price, bidCount: l.bidCount + 1, topBidder: bidder, status: 'ended' }
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
          createdAt: Date.now(),
        }
        set((state) => ({ listings: [listing, ...state.listings] }))
        return id
      },

      closeEarly: (listingId) =>
        set((state) => ({
          listings: state.listings.map((l) =>
            l.id === listingId && l.status === 'live'
              ? { ...l, status: 'ended', endsAt: Date.now() }
              : l,
          ),
        })),

      toggleWatch: (id) =>
        set((state) => ({
          watched: state.watched.includes(id)
            ? state.watched.filter((w) => w !== id)
            : [...state.watched, id],
        })),

      setSort: (s) => set({ sort: s }),

      saveSearch: (s) =>
        set((state) => ({
          savedSearches: [...state.savedSearches, { ...s, id: newId() }],
        })),

      removeSearch: (id) =>
        set((state) => ({
          savedSearches: state.savedSearches.filter((x) => x.id !== id),
        })),

      resetDemo: () =>
        set({ listings: seedListings, bids: [], watched: [], sort: 'ending', savedSearches: [] }),
    }),
    {
      name: 'bidboard-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        listings: s.listings,
        bids: s.bids,
        watched: s.watched,
        sort: s.sort,
        savedSearches: s.savedSearches,
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
export type { ListingFormat, Category, AuctionType }
