// End-to-end backend test: starts the server, hits REST + WS over real sockets.
import { startServer } from './index.js'
import WebSocket from 'ws'

const PORT = 4055
process.env.PORT = String(PORT)
const BASE = `http://127.0.0.1:${PORT}`

let failures = 0
const ok = (cond, msg) => { if (!cond) { console.error('  ✗ ' + msg); failures++ } else console.log('  ✓ ' + msg) }
const j = (r) => r.json()

async function main() {
  const server = startServer()
  await new Promise((r) => setTimeout(r, 600)) // let auto-seed finish

  // health
  let r = await fetch(BASE + '/api/health'); ok(r.ok, 'health ok')
  // listings
  r = await fetch(BASE + '/api/listings'); let data = await j(r)
  ok(Array.isArray(data) && data.length >= 6, `listings returned (${data.length})`)
  const live = data.find((l) => l.auctionType === 'timed')
  const rev = data.find((l) => l.auctionType === 'reverse')
  ok(!!live && !!rev, 'has timed + reverse listings')
  ok(typeof live.displayPrice === 'number' && live.displayPrice > 0, 'displayPrice decorated')

  // register
  const email = 'tester' + Date.now() + '@bidboard.app'
  r = await fetch(BASE + '/api/auth/register', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, name: 'Tester', password: 'pw12345' }) })
  ok(r.ok, 'register ok')
  let { token } = await j(r)
  ok(!!token, 'received JWT')

  // unauth bid rejected
  r = await fetch(BASE + `/api/listings/${live.id}/bid`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ amount: 1 }) })
  ok(r.status === 401, 'unauth bid -> 401')

  // bid below min rejected
  const min = live.currentBid > 0 ? live.currentBid + 100 : live.reserve
  r = await fetch(BASE + `/api/listings/${live.id}/bid`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token }, body: JSON.stringify({ amount: 1 }) })
  ok(r.status === 400, 'low bid -> 400')

  // valid bid accepted
  r = await fetch(BASE + `/api/listings/${live.id}/bid`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token }, body: JSON.stringify({ amount: min, bidder: 'Tester' }) })
  ok(r.ok, 'valid bid accepted')
  let bidRes = await j(r)
  ok(bidRes.listing.currentBid === min && bidRes.listing.topBidder === 'Tester', 'bid recorded server-side')

  // accept reverse
  r = await fetch(BASE + `/api/listings/${rev.id}/accept`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token }, body: JSON.stringify({ bidder: 'Tester' }) })
  ok(r.ok, 'reverse accept ok')
  let acc = await j(r)
  ok(acc.listing.status === 'ended' && acc.listing.topBidder === 'Tester', 'reverse closed & won')

  // watch
  r = await fetch(BASE + '/api/watch', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token }, body: JSON.stringify({ listingId: live.id, on: true }) })
  ok(r.ok, 'watch set')
  r = await fetch(BASE + '/api/watch', { headers: { authorization: 'Bearer ' + token } }); let w = await j(r)
  ok(w.watched.includes(live.id), 'watch persisted for user')

  // saved search
  r = await fetch(BASE + '/api/saved-searches', { method: 'POST', headers: { 'content-type': 'application/json', authorization: 'Bearer ' + token }, body: JSON.stringify({ q: 'Transit', category: 'Transit' }) })
  ok(r.ok, 'saved search created')
  r = await fetch(BASE + '/api/saved-searches', { headers: { authorization: 'Bearer ' + token } }); let ss = await j(r)
  ok(ss.savedSearches.length >= 1, 'saved search listed')

  // WS: connect, expect a broadcast within a few seconds (market-maker fires every 7s)
  const ws = new WebSocket(`ws://127.0.0.1:${PORT}/ws`)
  let got = false
  await new Promise((resolve) => {
    ws.on('message', (m) => { const evt = JSON.parse(m.toString()); if (evt.type === 'bid.placed' || evt.type === 'auction.ended') { got = true; resolve() } })
    ws.on('open', () => {})
    setTimeout(resolve, 9000)
  })
  ok(got, 'WS broadcast received (live market activity)')
  ws.close()

  server.close()
  console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILURE(S)`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((e) => { console.error(e); process.exit(1) })
