// Logic smoke test for the upgraded Bidboard store.
import { useBidStore } from '../src/store/useBidStore.ts'
import { cpm } from '../src/lib/format.ts'

let failures = 0
const assert = (cond, msg) => {
  if (!cond) { console.error('  ✗ ' + msg); failures++ } else console.log('  ✓ ' + msg)
}

const api = useBidStore.getState()
assert(api.listings.length === 7, `seed has 7 listings (got ${api.listings.length})`)
assert(api.listings.some((l) => l.auctionType === 'reverse'), 'has a Dutch (reverse) auction')
assert(api.listings.some((l) => l.verified), 'has verified owners')

// --- reverse price declines over time (simulate the clock moving forward) ---
const rev = api.listings.find((l) => l.id === 'bb-004')
// pretend the auction just started 2h ago, so price is mid-decline
const started2hAgo = { ...rev, createdAt: Date.now() - 2 * 60 * 60 * 1000 }
const p0 = useBidStore.getState().displayPrice(started2hAgo)
// 1 hour LATER
const started3hAgo = { ...rev, createdAt: Date.now() - 3 * 60 * 60 * 1000 }
const p1 = useBidStore.getState().displayPrice(started3hAgo)
assert(p1 < p0 && p1 >= rev.reserve, `reverse price declines (${p0} -> ${p1}) and stays >= reserve`)

// --- acceptReverse wins immediately at current price ---
const before2 = useBidStore.getState().listings.find((l) => l.id === 'bb-004')
const acc = useBidStore.getState().acceptReverse('bb-004', 'BuyerX')
const after2 = useBidStore.getState().listings.find((l) => l.id === 'bb-004')
assert(acc.ok && after2.status === 'ended' && after2.topBidder === 'BuyerX', 'acceptReverse closes & assigns winner')

// --- timed bid validation still works ---
const min = (() => { const l = useBidStore.getState().listings.find((x) => x.id === 'bb-001'); return l.currentBid > 0 ? l.currentBid + 100 : l.reserve })()
const low = useBidStore.getState().placeBid('bb-001', 1, 'T')
assert(!low.ok, 'timed bid below min rejected')
const ok = useBidStore.getState().placeBid('bb-001', min, 'T')
assert(ok.ok, 'timed valid bid accepted')

// --- anti-snipe ---
useBidStore.setState((s) => ({ listings: s.listings.map((l) => l.id === 'bb-001' ? { ...l, endsAt: Date.now() + 60 * 1000 } : l) }))
const b = useBidStore.getState().listings.find((l) => l.id === 'bb-001').endsAt
useBidStore.getState().placeBid('bb-001', min + 100, 'T2')
const a = useBidStore.getState().listings.find((l) => l.id === 'bb-001').endsAt
assert(a > b, 'anti-snipe extended auction')

// --- ended auction rejects bids ---
useBidStore.setState((s) => ({ listings: s.listings.map((l) => l.id === 'bb-001' ? { ...l, status: 'ended', endsAt: Date.now() - 1000 } : l) }))
assert(!useBidStore.getState().placeBid('bb-001', 999999, 'T3').ok, 'ended auction rejects bids')

// --- closeEarly (seller) ---
useBidStore.setState((s) => ({ listings: s.listings.map((l) => l.id === 'bb-002' ? { ...l, status: 'live' } : l) }))
useBidStore.getState().closeEarly('bb-002')
assert(useBidStore.getState().listings.find((l) => l.id === 'bb-002').status === 'ended', 'closeEarly ends a live auction')

// --- watchlist ---
useBidStore.getState().toggleWatch('bb-005')
assert(useBidStore.getState().watched.includes('bb-005'), 'watch added')
useBidStore.getState().toggleWatch('bb-005')
assert(!useBidStore.getState().watched.includes('bb-005'), 'watch removed')

// --- saved searches ---
useBidStore.getState().saveSearch({ q: 'Transit', format: 'All', category: 'Transit' })
assert(useBidStore.getState().savedSearches.length === 1, 'saved search persisted')
const sid = useBidStore.getState().savedSearches[0].id
useBidStore.getState().removeSearch(sid)
assert(useBidStore.getState().savedSearches.length === 0, 'saved search removed')

// --- CPM ordering helper ---
const c1 = cpm(10000, 100000) // 100
const c2 = cpm(10000, 200000) // 50
assert(c2 < c1, 'cpm lower when more impressions')

// --- rival only touches timed auctions ---
const revBefore = useBidStore.getState().listings.find((l) => l.id === 'bb-007').currentBid
useBidStore.getState().rivalBid('bb-007')
assert(useBidStore.getState().listings.find((l) => l.id === 'bb-007').currentBid === revBefore, 'rivalBid ignores reverse auctions')

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`)
process.exit(failures === 0 ? 0 : 1)
