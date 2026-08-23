// Auction domain rules — shared logic for validation and pricing.
// Kept framework-free so it can be imported by server, WS bot, and the
// frontend client (prevents bid/price divergence between tiers).

export const ANTISNIPE_MS = 3 * 60 * 1000

/** Minimum next bid for a timed listing. */
export function minNextBid(listing) {
  return listing.currentBid > 0 ? listing.currentBid + 100 : listing.reserve
}

/** Current displayed price for any auction type. */
export function displayPrice(listing, nowMs = Date.now()) {
  if (listing.auctionType === 'reverse') return reversePrice(listing, nowMs)
  return listing.currentBid > 0 ? listing.currentBid : listing.reserve
}

/** Declining price for a Dutch (reverse) auction. */
export function reversePrice(listing, nowMs = Date.now()) {
  if (listing.auctionType !== 'reverse' || !listing.startPrice) return listing.currentBid
  const elapsedH = Math.max(0, (nowMs - listing.createdAt) / (60 * 60 * 1000))
  const dropped = (listing.declinePerHour || 0) * elapsedH
  return Math.max(listing.reserve, Math.round(listing.startPrice - dropped))
}

/** Cost per mille (weekly basis). */
export function cpm(price, weeklyImpressions) {
  if (!weeklyImpressions || weeklyImpressions <= 0) return 0
  return price / (weeklyImpressions / 1000)
}

/** Whether a timed bid is valid (returns {ok,error?}). */
export function validateTimedBid(listing, amount) {
  if (listing.status !== 'live') return { ok: false, error: 'This auction has ended.' }
  if (amount < minNextBid(listing))
    return { ok: false, error: `Bid must be at least ${fmt(minNextBid(listing))}.` }
  return { ok: true }
}

/** Anti-snipe: extend the clock if a bid lands in the final window. */
export function maybeExtend(listing) {
  if (listing.endsAt - Date.now() < ANTISNIPE_MS) {
    return Date.now() + ANTISNIPE_MS
  }
  return listing.endsAt
}

function fmt(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
