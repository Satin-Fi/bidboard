import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useBidStore } from '../store/useBidStore'
import { formatImpressions, formatMoney, timeRemaining } from '../lib/format'

export default function ListingPage() {
  const { id } = useParams<{ id: string }>()
  const listing = useBidStore((s) => s.listings.find((l) => l.id === id))
  const bids = useBidStore((s) => s.bids.filter((b) => b.listingId === id))
  const placeBid = useBidStore((s) => s.placeBid)

  const [, force] = useState(0)
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const [amount, setAmount] = useState('')
  const [bidder, setBidder] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

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
      setMsg({ ok: true, text: `Bid placed at ${formatMoney(amt)}.` })
      setAmount('')
    } else {
      setMsg({ ok: false, text: res.error ?? 'Bid failed.' })
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/" className="text-sm text-muted hover:text-white">
        ← Back to marketplace
      </Link>

      <div className="mt-4 grid lg:grid-cols-5 gap-6">
        {/* Left: artwork + details */}
        <div className="lg:col-span-3">
          <div
            className={`relative h-56 sm:h-72 rounded-2xl bg-gradient-to-br ${listing.gradient}`}
          >
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute top-4 left-4 chip bg-black/40 text-white">
              {listing.format}
            </div>
            {!ended ? (
              <div className="absolute bottom-4 left-4 chip bg-black/50 text-accent-2 font-display">
                ⏱ {remaining} left
              </div>
            ) : (
              <div className="absolute bottom-4 left-4 chip bg-black/50 text-white">
                Auction ended
              </div>
            )}
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl mt-5">
            {listing.title}
          </h1>
          <p className="text-muted mt-1">
            {listing.address} · {listing.city} · owned by {listing.owner}
          </p>
          <p className="mt-4 text-white/80 leading-relaxed">{listing.description}</p>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <Metric label="Weekly impressions" value={formatImpressions(listing.weeklyImpressions)} />
            <Metric label="Reserve" value={formatMoney(listing.reserve)} />
            <Metric label="Total bids" value={String(listing.bidCount)} />
          </div>
        </div>

        {/* Right: bid panel */}
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
              {listing.topBidder && (
                <span className="chip">Top: {listing.topBidder}</span>
              )}
            </div>

            {!ended ? (
              <form onSubmit={submit} className="mt-5 space-y-3">
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
                  <input
                    className="input"
                    placeholder="Anonymous"
                    value={bidder}
                    onChange={(e) => setBidder(e.target.value)}
                  />
                </div>
                <button className="btn-accent w-full" type="submit" disabled={ended}>
                  Place bid
                </button>
                {msg && (
                  <p
                    className={
                      'text-sm ' + (msg.ok ? 'text-accent-2' : 'text-rose-400')
                    }
                  >
                    {msg.text}
                  </p>
                )}
              </form>
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
                    <span className="text-muted">
                      {formatMoney(b.amount)}
                    </span>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3 text-center">
      <div className="font-display font-bold text-lg">{value}</div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </div>
  )
}
