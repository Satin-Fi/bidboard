import { Link } from 'react-router-dom'
import type { Listing } from '../types'
import { formatImpressions, formatMoney, timeRemaining } from '../lib/format'
import { useEffect, useState } from 'react'
import { useBidStore } from '../store/useBidStore'

export default function ListingCard({ listing }: { listing: Listing }) {
  const [, force] = useState(0)
  const watched = useBidStore((s) => s.watched.includes(listing.id))
  const toggleWatch = useBidStore((s) => s.toggleWatch)
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
      className="card overflow-hidden group hover:border-accent/40 transition relative"
    >
      {Date.now() - listing.createdAt < 24 * 60 * 60 * 1000 && (
        <span className="absolute top-3 left-3 z-10 chip bg-accent-2/20 text-accent-2 border border-accent-2/30">
          New
        </span>
      )}
      <button
        aria-label="Watch"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleWatch(listing.id)
          // toast handled by caller context when needed
        }}
        className="absolute top-2 right-2 z-10 grid place-items-center h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-lg"
      >
        {watched ? '★' : '☆'}
      </button>

      <div className={`relative h-40 bg-gradient-to-br ${listing.gradient}`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-3 left-3 chip bg-black/40 text-white">
          {listing.format}
        </div>
        <div className="absolute bottom-3 right-3 chip bg-black/40 text-accent-2">
          {!ended ? `⏱ ${remaining}` : 'Ended'}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold leading-snug group-hover:text-accent transition pr-6">
          {listing.title}
        </h3>
        <p className="text-sm text-muted mt-0.5">{listing.city}</p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted uppercase tracking-wide">
              {listing.currentBid > 0 ? 'Current bid' : 'Reserve'}
            </p>
            <p className="font-display text-xl font-bold">{formatMoney(price)}</p>
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
