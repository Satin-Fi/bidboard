import type { LeaderboardListing } from '../types'
import { formatBid, formatClicks, timeAgo } from '../lib/format'
import { useBidStore } from '../store/useBidStore'
import { ArrowUpRight } from 'lucide-react'

interface RowProps {
  listing: LeaderboardListing
}

export default function LeaderboardRow({ listing }: RowProps) {
  const openModal = useBidStore((s) => s.openModal)
  const trackClick = useBidStore((s) => s.trackClick)

  return (
    <div className="group flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-surface hover:bg-surface-2 border border-white/[0.05] hover:border-white/[0.12] transition-all duration-150">
      {/* Left: Rank + Logo + Content */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        {/* Rank number */}
        <div className="w-7 text-left flex-shrink-0">
          <span className="font-display font-bold text-sm sm:text-base text-neutral-400 group-hover:text-white transition-colors">
            #{listing.rank}
          </span>
        </div>

        {/* Icon / Logo Avatar */}
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-sm ${
            listing.logoBg || 'bg-zinc-800 text-white'
          }`}
        >
          {listing.logoText || listing.title.slice(0, 2).toUpperCase()}
        </div>

        {/* Info & Description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick(listing.id)}
              className="font-display font-bold text-sm sm:text-base text-white hover:text-coral-400 transition-colors truncate inline-flex items-center gap-1"
            >
              {listing.title}
              <ArrowUpRight className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>

          <p className="text-xs text-neutral-400 truncate mt-0.5 max-w-xl">
            {listing.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-neutral-400">
            <span>{timeAgo(listing.createdAt)}</span>
            <span>·</span>
            <span className="text-neutral-300">{listing.category}</span>
            <span>·</span>
            <span className="text-neutral-400 font-mono">
              {formatClicks(listing.clickCount)} clicks
            </span>
          </div>
        </div>
      </div>

      {/* Right: Price & Outbid CTA */}
      <div className="flex flex-col items-end flex-shrink-0 pl-2">
        <span className="font-display font-bold text-base sm:text-lg text-coral-500 tracking-tight">
          {formatBid(listing.currentBid)}
        </span>
        <button
          onClick={() =>
            openModal({
              targetListing: listing,
              targetRank: listing.rank,
              initialAmount: listing.currentBid + 1,
            })
          }
          className="mt-0.5 text-[10px] sm:text-xs font-semibold text-neutral-400 group-hover:text-coral-400 transition-colors"
        >
          outbid →
        </button>
      </div>
    </div>
  )
}
