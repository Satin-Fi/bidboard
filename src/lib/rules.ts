// Auction and Pay-to-Rank domain rules.
export const ANTISNIPE_MS = 3 * 60 * 1000

export function minNextBid(listing: any): number {
  return listing.currentBid > 0 ? listing.currentBid + 100 : (listing.reserve || 5)
}

export function reversePrice(listing: any, nowMs = Date.now()): number {
  if (listing.auctionType !== 'reverse' || !listing.startPrice) return listing.currentBid || 0
  const elapsedH = Math.max(0, (nowMs - listing.createdAt) / (60 * 60 * 1000))
  const dropped = (listing.declinePerHour || 0) * elapsedH
  return Math.max(listing.reserve || 0, Math.round(listing.startPrice - dropped))
}

export function displayPrice(listing: any, nowMs = Date.now()): number {
  if (listing.auctionType === 'reverse') return reversePrice(listing, nowMs)
  if (typeof listing.currentBid === 'number' && listing.currentBid > 0) return listing.currentBid
  return listing.reserve || 0
}

export function cpm(price: number, weeklyImpressions: number): number {
  if (!weeklyImpressions || weeklyImpressions <= 0) return 0
  return price / (weeklyImpressions / 1000)
}

export function validateTimedBid(listing: any, amount: number): { ok: boolean; error?: string } {
  if (listing.status === 'ended') return { ok: false, error: 'This auction has ended.' }
  if (amount < minNextBid(listing))
    return { ok: false, error: `Bid must be at least ${fmt(minNextBid(listing))}.` }
  return { ok: true }
}

/** Calculate what rank a given bid amount will achieve against current listings */
export function calculateRank(listings: { currentBid: number }[], amount: number): number {
  const higherCount = listings.filter((l) => l.currentBid >= amount).length
  return higherCount + 1
}

/** Default increment to outbid a position */
export function outbidAmount(currentBid: number): number {
  if (currentBid >= 10000) return currentBid + 5
  if (currentBid >= 1000) return currentBid + 5
  if (currentBid >= 100) return currentBid + 5
  return currentBid + 1
}

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
}

