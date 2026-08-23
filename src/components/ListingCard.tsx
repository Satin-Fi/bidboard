import type { LeaderboardListing } from '../types'
import { formatBid, formatClicks, timeAgo } from '../lib/format'
import { useBidStore } from '../store/useBidStore'

export default function ListingCard({ listing }: { listing: LeaderboardListing }) {
  const trackClick = useBidStore((s) => s.trackClick)
  const openModal = useBidStore((s) => s.openModal)

  return (
    <div className="p-4 rounded-2xl bg-surface border border-white/[0.06] hover:border-white/[0.15] transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="px-2.5 py-0.5 rounded-lg bg-coral-500 font-display font-extrabold text-white text-xs">
            #{listing.rank}
          </span>
          <span className="text-xs font-mono font-semibold text-coral-400">
            {formatBid(listing.currentBid)}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-xs ${
              listing.logoBg || 'bg-zinc-800 text-white'
            }`}
          >
            {listing.logoText || listing.title.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-white group-hover:text-coral-400 transition-colors">
              {listing.title}
            </h3>
            <a
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick(listing.id)}
              className="text-[11px] text-neutral-400 hover:text-coral-400 hover:underline"
            >
              {listing.displayUrl}
            </a>
          </div>
        </div>

        <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
          {listing.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs">
        <span className="text-neutral-500 text-[11px]">{timeAgo(listing.createdAt)}</span>
        <div className="flex items-center gap-2">
          <span className="text-coral-400 font-mono text-[11px]">
            🔥 {formatClicks(listing.clickCount)}
          </span>
          <button
            onClick={() =>
              openModal({
                targetListing: listing,
                targetRank: listing.rank,
                initialAmount: listing.currentBid + 5,
              })
            }
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-neutral-300 hover:text-white"
          >
            Outbid
          </button>
        </div>
      </div>
    </div>
  )
}

