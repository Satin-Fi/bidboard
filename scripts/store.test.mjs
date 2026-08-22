// Logic smoke test for the Bidboard store. Runs under vite-node-style SSR
// via `npx vite-node`. We import the real store module and assert behavior.
import { useBidStore } from '../src/store/useBidStore.ts'

let failures = 0
const assert = (cond, msg) => {
  if (!cond) {
    console.error('  ✗ ' + msg)
    failures++
  } else {
    console.log('  ✓ ' + msg)
  }
}

const api = useBidStore.getState()

// 1. seed present
assert(api.listings.length === 6, `seed has 6 listings (got ${api.listings.length})`)

// 2. bid below min rejected
const fresh = useBidStore.getState().listings.find((l) => l.id === 'bb-004')
const min = fresh.currentBid > 0 ? fresh.currentBid + 100 : fresh.reserve
const tooLow = useBidStore.getState().placeBid('bb-004', 1, 'Tester')
assert(!tooLow.ok, 'bid below reserve is rejected')

// 3. valid bid accepted
const ok = useBidStore.getState().placeBid('bb-004', min, 'Tester')
assert(ok.ok, 'valid bid accepted at reserve')
const after = useBidStore.getState().listings.find((l) => l.id === 'bb-004')
assert(after.currentBid === min, `currentBid updated to ${min}`)
assert(after.bidCount === 1, 'bidCount incremented')
assert(after.topBidder === 'Tester', 'topBidder set')
assert(useBidStore.getState().bids.length === 1, 'bid recorded')

// 4. anti-snipe: setting endsAt within 3 min then bidding extends it
const now = Date.now()
useBidStore.setState((s) => ({
  listings: s.listings.map((l) =>
    l.id === 'bb-004' ? { ...l, endsAt: now + 60 * 1000 } : l,
  ),
}))
const before = useBidStore.getState().listings.find((l) => l.id === 'bb-004').endsAt
const bump = useBidStore.getState().placeBid('bb-004', after.currentBid + 100, 'Tester2')
const afterBid = useBidStore.getState().listings.find((l) => l.id === 'bb-004')
assert(bump.ok && afterBid.endsAt > before, 'anti-snipe extended the auction')

// 5. ended auction rejects bids
useBidStore.setState((s) => ({
  listings: s.listings.map((l) =>
    l.id === 'bb-004' ? { ...l, status: 'ended', endsAt: Date.now() - 1000 } : l,
  ),
}))
const late = useBidStore.getState().placeBid('bb-004', 999999, 'Tester3')
assert(!late.ok && /ended/i.test(late.error), 'bids on ended auction rejected')

// 6. watchlist toggle
useBidStore.getState().toggleWatch('bb-001')
assert(useBidStore.getState().watched.includes('bb-001'), 'watch added')
useBidStore.getState().toggleWatch('bb-001')
assert(!useBidStore.getState().watched.includes('bb-001'), 'watch removed')

// 7. rival bid raises price
const before7 = useBidStore.getState().listings.find((l) => l.id === 'bb-001')
useBidStore.getState().rivalBid('bb-001')
const after7 = useBidStore.getState().listings.find((l) => l.id === 'bb-001')
assert(after7.currentBid >= before7.currentBid, 'rival bid did not lower price')

// 8. sorting helper exists on store
assert(typeof useBidStore.getState().setSort === 'function', 'setSort available')

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`)
process.exit(failures === 0 ? 0 : 1)
