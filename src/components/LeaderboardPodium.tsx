import type { LeaderboardListing } from '../types'
import { formatBid, formatClicks, timeAgo } from '../lib/format'
import { useBidStore } from '../store/useBidStore'
import { ArrowUpRight } from 'lucide-react'

interface PodiumProps {
  listings: LeaderboardListing[]
}

export default function LeaderboardPodium({ listings }: PodiumProps) {
  const top3 = listings.slice(0, 3)
  const openModal = useBidStore((s) => s.openModal)
  const trackClick = useBidStore((s) => s.trackClick)

  if (top3.length === 0) return null

  return (
    <div className="space-y-3 mb-6">
      {top3.map((item, idx) => {
        const nextPrice = item.currentBid + 1

        return (
          <div key={item.id} className="relative group">
            {/* ── Main Ranked Card ───────────────────────────────── */}
            <div
              className={`rounded-2xl p-4 sm:p-5 transition-all duration-200 border bg-[#13151c]/90 backdrop-blur-sm ${
                item.rank === 1
                  ? 'border-coral-500/40 shadow-lg shadow-coral-500/10 hover:border-coral-500/70'
                  : 'border-coral-500/25 hover:border-coral-500/50'
              }`}
            >
              <div className="flex items-start sm:items-center justify-between gap-3">
                {/* Left: Rank + Logo + Content */}
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-coral-500 font-display font-extrabold text-white text-sm sm:text-base shadow-sm shadow-coral-500/30">
                      #{item.rank}
                    </span>
                  </div>

                  {/* Icon / Logo */}
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-sm ${
                      item.logoBg || 'bg-zinc-800 text-white'
                    }`}
                  >
                    {item.logoText || item.title.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Title & Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackClick(item.id)}
                        className="font-display font-bold text-base sm:text-lg text-white hover:text-coral-400 transition-colors truncate inline-flex items-center gap-1"
                      >
                        {item.title}
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-[11px] text-neutral-400">
                      <span>{timeAgo(item.createdAt)}</span>
                      <span>·</span>
                      <span className="text-neutral-300">{item.category}</span>
                      <span>·</span>
                      <span className="text-neutral-400 font-mono">
                        {formatClicks(item.clickCount)} clicks
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Price & Outbid action */}
                <div className="flex flex-col items-end flex-shrink-0 pl-2">
                  <span className="font-display font-black text-xl sm:text-2xl text-coral-500 tracking-tight select-all">
                    {formatBid(item.currentBid)}
                  </span>
                  <button
                    onClick={() =>
                      openModal({
                        targetListing: item,
                        targetRank: item.rank,
                        initialAmount: nextPrice,
                      })
                    }
                    className="mt-1 text-[11px] font-semibold text-neutral-400 hover:text-coral-400 transition-colors"
                  >
                    outbid →
                  </button>
                </div>
              </div>
            </div>

            {/* ── Interstitial claim rank chip ─────────────── */}
            {idx < top3.length - 1 && (
              <div className="flex justify-center -my-2 relative z-10">
                <button
                  onClick={() =>
                    openModal({
                      targetListing: item,
                      targetRank: item.rank,
                      initialAmount: nextPrice,
                    })
                  }
                  className="px-3 py-0.5 rounded-full bg-[#13151c] border border-coral-500/40 text-[10px] sm:text-xs font-semibold text-coral-400 hover:bg-coral-500 hover:text-white shadow-sm transition-all hover:scale-105"
                >
                  claim this rank for {formatBid(nextPrice)}
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
