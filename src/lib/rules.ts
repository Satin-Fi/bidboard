// Auction domain rules (TS port of server/src/rules.js).
// Single source of truth for pricing/validation on the client too.

export const ANTISNIPE_MS = 3 * 60 * 1000

export function minNextBid(listing: any): number {
  return listing.currentBid > 0 ? listing.currentBid + 100 : listing.reserve
}

export function reversePrice(listing: any, nowMs = Date.now()): number {
  if (listing.auctionType !== 'reverse' || !listing.startPrice) return listing.currentBid
  const elapsedH = Math.max(0, (nowMs - listing.createdAt) / (60 * 60 * 1000))
  const dropped = (listing.declinePerHour || 0) * elapsedH
  return Math.max(listing.reserve, Math.round(listing.startPrice - dropped))
}

export function displayPrice(listing: any, nowMs = Date.now()): number {
  if (listing.auctionType === 'reverse') return reversePrice(listing, nowMs)
  return listing.currentBid > 0 ? listing.currentBid : listing.reserve
}

export function cpm(price: number, weeklyImpressions: number): number {
  if (!weeklyImpressions || weeklyImpressions <= 0) return 0
  return price / (weeklyImpressions / 1000)
}

export function validateTimedBid(listing: any, amount: number): { ok: boolean; error?: string } {
  if (listing.status !== 'live') return { ok: false, error: 'This auction has ended.' }
  if (amount < minNextBid(listing))
    return { ok: false, error: `Bid must be at least ${fmt(minNextBid(listing))}.` }
  return { ok: true }
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}
