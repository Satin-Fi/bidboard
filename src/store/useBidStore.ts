import { create } from 'zustand'
import type { Listing, ListingFormat, Category, AuctionType } from '../types'
import { displayPrice } from '../lib/rules'
import { seedListings } from '../data/seed'

export type SortKey = 'ending' | 'bid' | 'new' | 'impr' | 'cpm'

interface MarketState {
  listings: Listing[]
  bids: Record<string, any[]>
  watched: string[]
  savedSearches: { id: string; q: string; format: string; category: string }[]
  sort: SortKey
  loaded: boolean
  hydrate: (listings: Listing[], watched: string[], savedSearches?: MarketState['savedSearches']) => void
  applyListing: (listing: Listing) => void
  applyBid: (bid: any, listing: Listing) => void
  upsert: (listing: Listing, bids?: any[]) => void
  setBids: (listingId: string, bids: any[]) => void
  setWatched: (ids: string[]) => void
  setSavedSearches: (s: MarketState['savedSearches']) => void
  toggleWatchLocal: (id: string) => void
  setSort: (s: SortKey) => void
  reset: () => void
}

export const useBidStore = create<MarketState>((set) => ({
  listings: seedListings,
  bids: {},
  watched: [],
  savedSearches: [],
  sort: 'ending',
  loaded: true,

  hydrate: (listings, watched, savedSearches = []) =>
    set({
      listings: Array.isArray(listings) && listings.length > 0 ? listings : seedListings,
      watched,
      savedSearches,
      loaded: true,
    }),

  applyListing: (listing) =>
    set((s) => ({
      listings: s.listings.some((l) => l.id === listing.id)
        ? s.listings.map((l) => (l.id === listing.id ? { ...l, ...listing } : l))
        : [listing, ...s.listings],
    })),

  applyBid: (bid, listing) =>
    set((s) => ({
      listings: s.listings.map((l) => (l.id === listing.id ? { ...l, ...listing } : l)),
      bids: { ...s.bids, [listing.id]: [bid, ...(s.bids[listing.id] || [])] },
    })),

  upsert: (listing, bids) =>
    set((s) => ({
      listings: s.listings.some((l) => l.id === listing.id)
        ? s.listings.map((l) => (l.id === listing.id ? { ...l, ...listing } : l))
        : [listing, ...s.listings],
      bids: bids ? { ...s.bids, [listing.id]: bids } : s.bids,
    })),

  setBids: (listingId, bids) => set((s) => ({ bids: { ...s.bids, [listingId]: bids } })),

  setWatched: (ids) => set({ watched: ids }),

  setSavedSearches: (s) => set({ savedSearches: s }),

  toggleWatchLocal: (id) =>
    set((s) => ({
      watched: s.watched.includes(id) ? s.watched.filter((w) => w !== id) : [...s.watched, id],
    })),

  setSort: (s) => set({ sort: s }),

  reset: () => set({ listings: [], bids: {}, watched: [], loaded: false }),
}))

/** selector helper: current displayed price for a listing */
export function priceOf(l: Listing): number {
  return displayPrice(l)
}

export type { ListingFormat, Category, AuctionType }
