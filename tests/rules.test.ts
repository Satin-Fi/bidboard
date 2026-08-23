import { describe, it, expect } from 'vitest'
import { minNextBid, reversePrice, displayPrice, cpm, validateTimedBid, ANTISNIPE_MS } from '../src/lib/rules'

const timed = {
  auctionType: 'timed', currentBid: 1000, reserve: 500, status: 'live',
  weeklyImpressions: 100000, startPrice: undefined, declinePerHour: undefined, createdAt: 0,
} as any

const reverse = {
  auctionType: 'reverse', currentBid: 0, reserve: 9800, status: 'live',
  weeklyImpressions: 540000, startPrice: 16000, declinePerHour: 900, createdAt: 0,
} as any

describe('auction rules', () => {
  it('minNextBid for timed', () => {
    expect(minNextBid(timed)).toBe(1100)
    expect(minNextBid({ ...timed, currentBid: 0 })).toBe(500)
  })

  it('reverse price declines over time and clamps to reserve', () => {
    const t0 = { ...reverse, createdAt: Date.now() - 2 * 3600_000 }
    const t1 = { ...reverse, createdAt: Date.now() - 3 * 3600_000 }
    const p0 = reversePrice(t0)
    const p1 = reversePrice(t1)
    expect(p1).toBeLessThan(p0)
    expect(p1).toBeGreaterThanOrEqual(reverse.reserve)
  })

  it('displayPrice routes by type', () => {
    expect(displayPrice(timed)).toBe(1000)
    const r = { ...reverse, createdAt: Date.now() - 2 * 3600_000 }
    expect(displayPrice(r)).toBe(reversePrice(r))
  })

  it('cpm lower with more impressions', () => {
    expect(cpm(10000, 200000)).toBeLessThan(cpm(10000, 100000))
  })

  it('validateTimedBid enforces min', () => {
    expect(validateTimedBid(timed, 100).ok).toBe(false)
    expect(validateTimedBid(timed, 1100).ok).toBe(true)
    expect(validateTimedBid({ ...timed, status: 'ended' }, 5000).ok).toBe(false)
  })

  it('ANTISNIPE_MS is 3 minutes', () => {
    expect(ANTISNIPE_MS).toBe(3 * 60 * 1000)
  })
})
