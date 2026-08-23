// Local harness: exercises the /api/checkout + /api/verify + /api/webhook handlers
// with a mocked Vercel req/res, so we can prove the logic runs without deploying.
import checkout from '../api/checkout'
import verify from '../api/verify'
import webhook from '../api/webhook'

function mockRes() {
  const res: any = {}
  res._status = 200
  res._json = null
  res.status = (s: number) => { res._status = s; return res }
  res.json = (d: any) => { res._json = d; return res }
  return res
}
const enc = (o: any) => ({ method: 'POST', body: o, headers: {} })
const get = () => ({ method: 'GET', headers: {}, query: {} })

async function main() {
  let pass = 0, fail = 0
  const ok = (c: boolean, m: string) => { if (c) { pass++; console.log('  ✓', m) } else { fail++; console.log('  ✗', m) } }

  console.log('GET /api/checkout (status):')
  let r = mockRes(); await checkout(get() as any, r as any)
  ok(r._status === 200 && r._json.live === false, `returns live:false with no token (demo) -> ${JSON.stringify(r._json)}`)

  console.log('POST /api/checkout (demo path, no gateway):')
  r = mockRes(); await checkout(enc({ url: 'https://x.com', amount: 42, email: 'a@b.com', title: 'X', categorySlug: 'ai' }) as any, r as any)
  ok(r._status === 200 && r._json.status === 'demo', `returns status:'demo' (no charge) -> ${JSON.stringify(r._json)}`)

  console.log('GET /api/verify (unknown session):')
  r = mockRes(); await verify({ query: { session_id: 'nope' } } as any, r as any)
  ok(r._status === 404 && r._json.valid === false, `unknown session -> 404 valid:false`)

  console.log('POST /api/webhook (simulated Polar order.paid):')
  r = mockRes(); await webhook(enc({ type: 'order.paid', data: { id: 'sess_test1', metadata: { url: 'https://paid.com', title: 'Paid', categorySlug: 'ai', bidderName: 'Bob', targetRank: '3', amount: '5000' } } }) as any, r as any)
  ok(r._status === 200 && r._json.received === true, 'webhook records paid bid')

  console.log('GET /api/verify (after webhook):')
  r = mockRes(); await verify({ query: { session_id: 'sess_test1' } } as any, r as any)
  ok(r._status === 200 && r._json.valid === true && r._json.rank === 3, `verifies paid session -> ${JSON.stringify(r._json)}`)

  console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILURES'}: ${pass} passed, ${fail} failed`)
  process.exit(fail === 0 ? 0 : 1)
}
main()
