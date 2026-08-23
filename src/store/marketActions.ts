// Action helpers: wrap API calls + store updates + toasts in one place.
import { useBidStore } from '../store/useBidStore'
import { useUiStore } from '../store/useUiStore'
import { useAuthStore } from '../store/useAuthStore'
import { api } from '../lib/api'
import { displayPrice } from '../lib/rules'

const ui = () => useUiStore.getState()
const auth = () => useAuthStore.getState()

export async function loadMarket() {
  try {
    const listings = await api.listings()
    let watched: string[] = []
    let savedSearches: any[] = []
    if (auth().token) {
      ;({ watched } = await api.getWatch())
      ;({ savedSearches } = await api.savedSearches())
    }
    useBidStore.getState().hydrate(listings, watched, savedSearches)
  } catch {
    // Graceful offline fallback: keep preloaded seed data
    console.warn('Backend API currently unreachable, running in client demo mode.')
  }
}

export async function loadListingDetail(id: string) {
  try {
    const { listing, bids } = await api.listing(id)
    const store = useBidStore.getState()
    store.upsert(listing, bids)
    return listing
  } catch {
    const store = useBidStore.getState()
    return store.listings.find((l) => l.id === id) || null
  }
}

export async function placeBid(listingId: string, amount: number, bidder: string) {
  try {
    const { listing, bid } = await api.bid(listingId, amount, bidder)
    useBidStore.getState().applyBid(bid, listing)
    ui().push(`Bid placed at ${fmt(amount)}.`, 'ok')
    return true
  } catch (e: any) {
    const store = useBidStore.getState()
    const listing = store.listings.find((l) => l.id === listingId)
    if (listing) {
      const updatedListing = {
        ...listing,
        currentBid: amount,
        bidCount: (listing.bidCount || 0) + 1,
        topBidder: bidder,
      }
      const newBid = {
        id: 'bid-' + Date.now(),
        listingId,
        amount,
        bidder,
        at: Date.now(),
      }
      store.applyBid(newBid, updatedListing)
      ui().push(`Bid placed at ${fmt(amount)}.`, 'ok')
      return true
    }
    ui().push(e.message || 'Bid failed.', 'warn')
    return false
  }
}

export async function acceptReverse(listingId: string, bidder: string) {
  try {
    const { listing, bid } = await api.accept(listingId, bidder)
    useBidStore.getState().applyBid(bid, listing)
    ui().push(`Secured at ${fmt(displayPrice(listing))} — auction closed.`, 'ok')
    return true
  } catch (e: any) {
    const store = useBidStore.getState()
    const listing = store.listings.find((l) => l.id === listingId)
    if (listing) {
      const currentPrice = displayPrice(listing)
      const updatedListing = {
        ...listing,
        currentBid: currentPrice,
        bidCount: (listing.bidCount || 0) + 1,
        topBidder: bidder,
        status: 'ended' as const,
      }
      const newBid = {
        id: 'bid-' + Date.now(),
        listingId,
        amount: currentPrice,
        bidder,
        at: Date.now(),
        winning: true,
      }
      store.applyBid(newBid, updatedListing)
      ui().push(`Secured at ${fmt(currentPrice)} — auction closed.`, 'ok')
      return true
    }
    ui().push(e.message || 'Could not accept.', 'warn')
    return false
  }
}

export async function closeEarly(listingId: string) {
  try {
    const { listing } = await api.close(listingId)
    useBidStore.getState().applyListing(listing)
    ui().push('Auction closed early.', 'info')
    return true
  } catch (e: any) {
    const store = useBidStore.getState()
    const listing = store.listings.find((l) => l.id === listingId)
    if (listing) {
      const updated = { ...listing, status: 'ended' as const, endsAt: Date.now() }
      store.applyListing(updated)
      ui().push('Auction closed early.', 'info')
      return true
    }
    ui().push(e.message || 'Could not close.', 'warn')
    return false
  }
}

export async function createListing(payload: any) {
  try {
    const { listing } = await api.create(payload)
    useBidStore.getState().applyListing(listing)
    ui().push('Slot published to the open auction.', 'ok')
    return listing
  } catch (e: any) {
    const newListing = {
      ...payload,
      id: 'bb-' + Math.random().toString(36).substring(2, 7),
      currentBid: 0,
      bidCount: 0,
      topBidder: null,
      status: 'live',
      createdAt: Date.now(),
      endsAt: Date.now() + 24 * 60 * 60 * 1000,
      gradient: payload.gradient || 'from-emerald-500 via-teal-500 to-cyan-500',
    }
    useBidStore.getState().applyListing(newListing)
    ui().push('Slot published to the open auction.', 'ok')
    return newListing
  }
}

export async function toggleWatch(listingId: string, on: boolean) {
  const store = useBidStore.getState()
  store.toggleWatchLocal(listingId)
  if (auth().token) {
    try {
      const { watched } = await api.watch(listingId, on)
      store.setWatched(watched)
    } catch {
      // revert on failure
      store.toggleWatchLocal(listingId)
    }
  }
}

export async function saveSearch(q: string, format: string, category: string) {
  try {
    await api.saveSearch(q, format, category)
    ui().push('Search saved.', 'ok')
  } catch (e: any) {
    ui().push(e.message || 'Could not save search.', 'warn')
  }
}

export async function deleteSearch(id: string) {
  try {
    await api.deleteSearch(id)
  } catch { /* ignore */ }
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
