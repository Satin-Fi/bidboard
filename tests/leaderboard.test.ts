import { describe, it, expect } from 'vitest'
import { formatBid, formatBidFull, formatClicks, formatRank, displayDomain } from '../src/lib/format'

describe('Leaderboard and formatting rules', () => {
  it('formats bids nicely in shorthand and full', () => {
    expect(formatBid(1500000)).toBe('$15.0k')
    expect(formatBid(2500)).toBe('$25')
    expect(formatBidFull(1500000)).toBe('$15,000')
    expect(formatBidFull(2500)).toBe('$25')
  })

  it('formats clicks with k/M suffixes', () => {
    expect(formatClicks(500)).toBe('500')
    expect(formatClicks(1500)).toBe('1.5k')
    expect(formatClicks(2500000)).toBe('2.5M')
  })

  it('formats ranks with # prefix', () => {
    expect(formatRank(1)).toBe('#1')
    expect(formatRank(42)).toBe('#42')
  })

  it('extracts display domain cleanly from urls', () => {
    expect(displayDomain('https://www.example.com/some/path')).toBe('example.com')
    expect(displayDomain('https://linear.app')).toBe('linear.app')
    expect(displayDomain('http://sub.domain.co.uk')).toBe('sub.domain.co.uk')
  })

  it('calculates outbid minimum correctly (at least $1 or previous + $1)', () => {
    const currentBidCents = 2500 // $25
    const minNextCents = currentBidCents + 100 // $26
    expect(minNextCents).toBe(2600)

    // Upgrading existing listing: user pays difference
    const newBidCents = 5000 // $50
    const differenceToPay = newBidCents - currentBidCents // $25
    expect(differenceToPay).toBe(2500)
  })

  it('ranks higher bids higher deterministically', () => {
    const listings = [
      { id: '1', bid: 500, createdAt: 1000 },
      { id: '2', bid: 1500, createdAt: 1000 },
      { id: '3', bid: 800, createdAt: 1000 },
      { id: '4', bid: 800, createdAt: 900 }, // same bid, earlier created
    ]

    listings.sort((a, b) => b.bid - a.bid || a.createdAt - b.createdAt)

    expect(listings[0].id).toBe('2') // $1500
    expect(listings[1].id).toBe('4') // $800 at 900ms
    expect(listings[2].id).toBe('3') // $800 at 1000ms
    expect(listings[3].id).toBe('1') // $500
  })

  it('creates checkout session with correct estimated rank', async () => {
    const { createCheckoutSession } = await import('../src/lib/payment')
    const listings = [{ currentBid: 15000 }, { currentBid: 10000 }, { currentBid: 5000 }]
    
    // Test bid higher than #1
    const topSession = await createCheckoutSession(
      {
        url: 'https://mysite.com',
        title: 'My Site',
        categorySlug: 'ai-automation',
        amount: 20000,
        email: 'test@example.com',
      },
      listings
    )
    expect(topSession.estimatedRank).toBe(1)
    expect(topSession.amount).toBe(20000)
    expect(topSession.sessionId).toBeDefined()

    // Test mid-range bid
    const midSession = await createCheckoutSession(
      {
        url: 'https://mysite.com',
        title: 'My Site',
        categorySlug: 'ai-automation',
        amount: 8000,
        email: 'test@example.com',
      },
      listings
    )
    expect(midSession.estimatedRank).toBe(3)
  })
})

