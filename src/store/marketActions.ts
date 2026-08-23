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
    ui().push('Could not reach the auction server.', 'warn')
  }
}

export async function loadListingDetail(id: string) {
  try {
    const { listing, bids } = await api.listing(id)
    const store = useBidStore.getState()
    store.upsert(listing, bids)
    return listing
  } catch {
    return null
  }
}

export async function placeBid(listingId: string, amount: number, bidder: string) {
  try {
    const { listing, bid } = await api.bid(listingId, amount, bidder)
    useBidStore.getState().applyBid(bid, listing)
    ui().push(`Bid placed at ${fmt(amount)}.`, 'ok')
    return true
  } catch (e: any) {
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
    ui().push(e.message || 'Could not publish.', 'warn')
    return null
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
