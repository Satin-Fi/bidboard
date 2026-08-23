import type { LeaderboardListing } from '../types'
import { formatBid, formatClicks, timeAgo } from '../lib/format'
import { useBidStore } from '../store/useBidStore'
import { ArrowUpRight, Trophy, Zap } from 'lucide-react'

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

        const rankBadgeStyle =
          item.rank === 1
            ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-md shadow-amber-500/25'
            : item.rank === 2
            ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-black shadow-sm'
            : 'bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-sm'

        const cardBorder =
          item.rank === 1
            ? 'border-amber-500/35 shadow-glow-gold/15 hover:border-amber-500/60'
            : item.rank === 2
            ? 'border-white/[0.12] hover:border-white/[0.22]'
            : 'border-white/[0.08] hover:border-white/[0.18]'

        return (
          <div key={item.id} className="relative group">
            {/* ── Main Ranked Card ───────────────────────────────── */}
            <div
              className={`rounded-2xl p-4 sm:p-5 transition-all duration-150 border bg-surface/95 backdrop-blur-sm ${cardBorder}`}
            >
              <div className="flex items-start sm:items-center justify-between gap-3">
                {/* Left: Rank + Logo + Content */}
                <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-display font-extrabold text-sm sm:text-base ${rankBadgeStyle}`}
                    >
                      {item.rank === 1 ? (
                        <Trophy className="w-4 h-4" />
                      ) : (
                        `#${item.rank}`
                      )}
                    </span>
                  </div>

                  {/* Icon / Logo */}
                  <div
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-display font-bold text-sm shadow-sm ${
                      item.logoBg || 'bg-surface-2 text-white border border-white/10'
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
                        className="font-display font-bold text-base sm:text-lg text-white hover:text-coral-400 transition-colors truncate inline-flex items-center gap-1 group/link"
                      >
                        {item.title}
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover/link:opacity-100 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all" />
                      </a>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-[11px] text-neutral-400">
                      <span>{timeAgo(item.createdAt)}</span>
                      <span>·</span>
                      <span className="text-neutral-300 font-medium">{item.category}</span>
                      <span>·</span>
                      <span className="text-neutral-400 font-mono inline-flex items-center gap-0.5">
                        <Zap className="w-3 h-3 text-amber-400/80" />
                        {formatClicks(item.clickCount)} clicks
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Price & Outbid action */}
                <div className="flex flex-col items-end flex-shrink-0 pl-2">
                  <span
                    className={`font-display font-black text-xl sm:text-2xl font-mono tracking-tight select-all ${
                      item.rank === 1 ? 'text-amber-400' : 'text-coral-500'
                    }`}
                  >
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
                  className="px-3 py-0.5 rounded-full bg-surface-2 border border-white/[0.12] text-[10px] sm:text-xs font-semibold text-neutral-300 hover:text-white hover:border-coral-500/60 hover:bg-surface-3 shadow-sm transition-all hover:scale-105"
                >
                  claim this rank for <span className="font-mono text-coral-400">{formatBid(nextPrice)}</span>
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
