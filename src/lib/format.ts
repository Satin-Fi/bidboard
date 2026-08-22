export function money(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export const formatMoney = money

export function formatImpressions(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return String(n)
}

/** Human-readable time remaining. Returns null when ended. */
export function timeRemaining(endsAt: number, nowMs: number): string | null {
  const diff = endsAt - nowMs
  if (diff <= 0) return null
  const h = Math.floor(diff / (60 * 60 * 1000))
  const m = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
  const s = Math.floor((diff % (60 * 1000)) / 1000)
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

/** Short relative time, e.g. "3h ago" / "2d ago". */
export function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

/** Cost per mille — price divided by impressions per 1000 (weekly basis). */
export function cpm(price: number, weeklyImpressions: number): number {
  if (weeklyImpressions <= 0) return 0
  return (price / (weeklyImpressions / 1000))
}

export function formatCpm(price: number, weeklyImpressions: number): string {
  return '$' + cpm(price, weeklyImpressions).toFixed(2)
}
