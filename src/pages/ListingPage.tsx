import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useBidStore } from '../store/useBidStore'
import { useUiStore } from '../store/useUiStore'
import { formatImpressions, formatMoney, timeRemaining } from '../lib/format'

export default function ListingPage() {
  const { id } = useParams<{ id: string }>()
  const listing = useBidStore((s) => s.listings.find((l) => l.id === id))
  const bids = useBidStore((s) => s.bids.filter((b) => b.listingId === id))
  const placeBid = useBidStore((s) => s.placeBid)
  const watched = useBidStore((s) => (id ? s.watched.includes(id) : false))
  const toggleWatch = useBidStore((s) => s.toggleWatch)
  const push = useUiStore((s) => s.push)

  const [, force] = useState(0)
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const [amount, setAmount] = useState('')
  const [bidder, setBidder] = useState('')

  if (!listing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-semibold">Listing not found</h1>
        <Link to="/" className="text-accent hover:underline mt-3 inline-block">
          ← Back to marketplace
        </Link>
      </div>
    )
  }

  const remaining = timeRemaining(listing.endsAt, Date.now())
  const ended = remaining === null
  const minNext =
    listing.currentBid > 0 ? listing.currentBid + 100 : listing.reserve

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const amt = Number(amount)
    const res = placeBid(listing.id, amt, bidder.trim() || 'Anonymous')
    if (res.ok) {
      push(`Bid placed at ${formatMoney(amt)}.`, 'ok')
      setAmount('')
    } else {
      push(res.error ?? 'Bid failed.', 'warn')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/" className="text-sm text-muted hover:text-white">
        ← Back to marketplace
      </Link>

      <div className="mt-4 grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <div className={`relative h-56 sm:h-72 rounded-2xl bg-gradient-to-br ${listing.gradient}`}>
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute top-4 left-4 chip bg-black/40 text-white">{listing.format}</div>
            {!ended ? (
              <div className="absolute bottom-4 left-4 chip bg-black/50 text-accent-2 font-display">
                ⏱ {remaining} left
              </div>
            ) : (
              <div className="absolute bottom-4 left-4 chip bg-black/50 text-white">Auction ended</div>
            )}
          </div>

          <div className="flex items-start justify-between gap-3 mt-5">
            <h1 className="font-display font-bold text-2xl sm:text-3xl">{listing.title}</h1>
            <button
              onClick={() => {
                if (!listing.id) return
                toggleWatch(listing.id)
                push(watched ? 'Removed from watchlist.' : 'Added to watchlist ★', 'info')
              }}
              className={'btn-ghost shrink-0 ' + (watched ? '!text-accent-2' : '')}
            >
              {watched ? '★ Watching' : '☆ Watch'}
            </button>
          </div>
          <p className="text-muted mt-1">
            {listing.address} · {listing.city} · owned by {listing.owner}
          </p>
          <p className="mt-4 text-white/80 leading-relaxed">{listing.description}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <Spec label="Size" value={listing.size} />
            <Spec label="Illumination" value={listing.illumination} />
            <Spec label="Audience" value={listing.audience} />
            <Spec label="Dayparting" value={listing.dayparting ? 'Yes' : 'No'} />
            <Spec label="Weekly impressions" value={formatImpressions(listing.weeklyImpressions)} />
            <Spec label="Reserve" value={formatMoney(listing.reserve)} />
            <Spec label="Total bids" value={String(listing.bidCount)} />
            <Spec label="Format" value={listing.format} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card p-5 lg:sticky lg:top-20">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted uppercase tracking-wide">
                  {listing.currentBid > 0 ? 'Current bid' : 'Reserve'}
                </p>
                <p className="font-display text-3xl font-bold">
                  {formatMoney(listing.currentBid > 0 ? listing.currentBid : listing.reserve)}
                </p>
              </div>
              {listing.topBidder && <span className="chip">Top: {listing.topBidder}</span>}
            </div>

            {!ended ? (
              <>
                <p className="text-xs text-amber-300/80 mt-2">
                  ⏱ Late bids in the final 3 minutes extend the auction by 3 minutes.
                </p>
                <form onSubmit={submit} className="mt-4 space-y-3">
                  <div>
                    <label className="label">Your bid (min {formatMoney(minNext)})</label>
                    <input
                      className="input"
                      type="number"
                      min={minNext}
                      step={100}
                      placeholder={String(minNext)}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Your name / brand</label>
                    <input className="input" placeholder="Anonymous" value={bidder} onChange={(e) => setBidder(e.target.value)} />
                  </div>
                  <button className="btn-accent w-full" type="submit">Place bid</button>
                </form>
              </>
            ) : (
              <div className="mt-5 p-4 rounded-xl bg-white/5 text-center">
                <p className="font-display font-semibold">
                  {listing.topBidder
                    ? `${listing.topBidder} won at ${formatMoney(listing.currentBid)}`
                    : 'No bids — passed in'}
                </p>
              </div>
            )}
          </div>

          {bids.length > 0 && (
            <div className="card p-5 mt-4">
              <h3 className="font-display font-semibold mb-3">Bid history</h3>
              <ul className="space-y-2 text-sm">
                {bids.map((b) => (
                  <li key={b.id} className="flex justify-between">
                    <span className="text-white">{b.bidder}</span>
                    <span className="text-muted">{formatMoney(b.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3 text-center">
      <div className="font-display font-bold text-base leading-tight">{value}</div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </div>
  )
}
