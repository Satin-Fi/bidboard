import { Link } from 'react-router-dom'
import { useBidStore } from '../store/useBidStore'
import { closeEarly } from '../store/marketActions'
import { displayPrice } from '../lib/rules'
import { formatMoney, formatImpressions, timeRemaining } from '../lib/format'

export default function DashboardPage() {
  const listings = useBidStore((s) => s.listings)
  const watched = useBidStore((s) => s.watched)

  const mine = listings // in a real app this filters by the logged-in owner; demo shows all
  const live = mine.filter((l) => l.status === 'live')
  const ended = mine.filter((l) => l.status === 'ended')
  const totalValue = live.reduce((a, l) => a + displayPrice(l), 0)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-3xl">Seller dashboard</h1>
          <p className="text-muted mt-1">Manage your inventory, watch activity and close auctions.</p>
        </div>
        <Link to="/sell" className="btn-accent">+ New listing</Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <Kpi label="Live slots" value={String(live.length)} />
        <Kpi label="Ended" value={String(ended.length)} />
        <Kpi label="Watched" value={String(watched.length)} />
        <Kpi label="Live value" value={formatMoney(totalValue)} />
      </div>

      <h2 className="font-display text-xl font-semibold mt-10 mb-3">Your live inventory</h2>
      {live.length === 0 ? (
        <div className="card p-10 text-center text-muted">No live slots. <Link to="/sell" className="text-accent hover:underline">List one</Link>.</div>
      ) : (
        <div className="space-y-3">
          {live.map((l) => {
            const remaining = timeRemaining(l.endsAt, Date.now())
            return (
              <div key={l.id} className="card p-4 flex flex-wrap items-center gap-4">
                <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${l.gradient}`} />
                <div className="min-w-[180px]">
                  <Link to={`/listing/${l.id}`} className="font-display font-semibold hover:text-accent">{l.title}</Link>
                  <p className="text-xs text-muted">{l.city} · {l.auctionType === 'reverse' ? 'Dutch' : 'Timed'}</p>
                </div>
                <div className="text-sm">
                  <span className="text-muted">Price </span>
                  <span className="font-display font-bold">{formatMoney(displayPrice(l))}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted">Bids </span>
                  <span className="font-display">{l.bidCount}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted">Impr/wk </span>
                  <span>{formatImpressions(l.weeklyImpressions)}</span>
                </div>
                <div className="text-sm text-accent-2 ml-auto">{remaining ? `⏱ ${remaining}` : 'Ended'}</div>
                <button onClick={() => closeEarly(l.id)} className="btn-ghost !py-1.5 text-xs">Close early</button>
              </div>
            )
          })}
        </div>
      )}

      {ended.length > 0 && (
        <>
          <h2 className="font-display text-xl font-semibold mt-10 mb-3 text-muted">Ended</h2>
          <div className="space-y-3 opacity-70">
            {ended.map((l) => (
              <div key={l.id} className="card p-4 flex items-center gap-4">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${l.gradient}`} />
                <Link to={`/listing/${l.id}`} className="font-display font-semibold">{l.title}</Link>
                <span className="text-sm text-muted ml-auto">
                  {l.topBidder ? `Won by ${l.topBidder} at ${formatMoney(l.currentBid)}` : 'Passed in'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 text-center">
      <div className="font-display text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </div>
  )
}
