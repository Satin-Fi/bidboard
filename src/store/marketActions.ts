// Action helpers: wrap API calls + store updates + toasts in one place.
import { useBidStore } from '../store/useBidStore'
import { useUiStore } from '../store/useUiStore'
import { api } from '../lib/api'
import { formatBid } from '../lib/format'

const ui = () => useUiStore.getState()

export async function loadMarket() {
  try {
    const listings = await api.listings()
    useBidStore.getState().hydrate(listings)
  } catch {
    // Graceful offline fallback: keep preloaded seed data
  }
}

export async function placeBidAction(url: string, amount: number, bidder: string, title?: string, description?: string, categorySlug?: string) {
  try {
    const store = useBidStore.getState()
    const result = store.placeBid({
      url,
      amount,
      bidder,
      title,
      description,
      categorySlug,
    })
    ui().push(`Ranked at #${result.rank} with ${formatBid(amount)}.`, 'ok')
    return result
  } catch (e: any) {
    ui().push(e.message || 'Bid failed.', 'warn')
    return null
  }
}
