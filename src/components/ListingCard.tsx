import { Link } from 'react-router-dom'
import type { Listing } from '../types'
import { formatImpressions, formatMoney, formatCpm, timeRemaining } from '../lib/format'
import { useEffect, useState } from 'react'
import { useBidStore } from '../store/useBidStore'

export default function ListingCard({ listing }: { listing: Listing }) {
  const [, force] = useState(0)
  const watched = useBidStore((s) => s.watched.includes(listing.id))
  const toggleWatch = useBidStore((s) => s.toggleWatch)
  const displayPrice = useBidStore((s) => s.displayPrice)

  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const remaining = timeRemaining(listing.endsAt, Date.now())
  const ended = remaining === null
  const price = displayPrice(listing)
  const isReverse = listing.auctionType === 'reverse'

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
      <span className={'absolute top-3 right-3 z-10 chip border ' + (isReverse ? 'bg-violet-500/20 text-violet-200 border-violet-400/30' : 'bg-accent/20 text-accent border-accent/30')}>
        {isReverse ? 'Dutch' : 'Timed'}
      </span>
      <button
        aria-label="Watch"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          toggleWatch(listing.id)
        }}
        className="absolute top-12 right-3 z-10 grid place-items-center h-8 w-8 rounded-full bg-black/40 hover:bg-black/60 text-lg"
      >
        {watched ? '★' : '☆'}
      </button>

      <div className={`relative h-40 bg-gradient-to-br ${listing.gradient}`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-3 left-3 chip bg-black/40 text-white">
          {listing.category}
        </div>
        <div className="absolute bottom-3 right-3 chip bg-black/40 text-accent-2">
          {!ended ? `⏱ ${remaining}` : 'Ended'}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold leading-snug group-hover:text-accent transition pr-6">
          {listing.title}
        </h3>
        <p className="text-sm text-muted mt-0.5">
          {listing.city} {listing.verified && <span className="text-accent-2">✓</span>}
        </p>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted uppercase tracking-wide">
              {isReverse ? 'Now' : listing.currentBid > 0 ? 'Current bid' : 'Reserve'}
            </p>
            <p className="font-display text-xl font-bold">{formatMoney(price)}</p>
            <p className="text-[11px] text-muted">CPM {formatCpm(price, listing.weeklyImpressions)}</p>
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
