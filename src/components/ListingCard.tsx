import { Link } from 'react-router-dom'
import type { Listing } from '../types'
import { formatImpressions, formatMoney, timeRemaining } from '../lib/format'
import { useEffect, useState } from 'react'

export default function ListingCard({ listing }: { listing: Listing }) {
  const [, force] = useState(0)
  // re-render each second so the countdown stays live
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const remaining = timeRemaining(listing.endsAt, Date.now())
  const ended = remaining === null
  const price =
    listing.currentBid > 0 ? listing.currentBid : listing.reserve

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="card overflow-hidden group hover:border-accent/40 transition"
    >
      <div
        className={`relative h-40 bg-gradient-to-br ${listing.gradient}`}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-3 left-3 chip bg-black/40 text-white">
          {listing.format}
        </div>
        {!ended ? (
          <div className="absolute top-3 right-3 chip bg-black/40 text-accent-2">
            ⏱ {remaining}
          </div>
        ) : (
          <div className="absolute top-3 right-3 chip bg-black/40 text-white">
            Ended
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold leading-snug group-hover:text-accent transition">
          {listing.title}
        </h3>
        <p className="text-sm text-muted mt-0.5">{listing.city}</p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted uppercase tracking-wide">
              {listing.currentBid > 0 ? 'Current bid' : 'Reserve'}
            </p>
            <p className="font-display text-xl font-bold">
              {formatMoney(price)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">{formatImpressions(listing.weeklyImpressions)} wk impr.</p>
            <p className="text-xs text-muted">{listing.bidCount} bids</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
