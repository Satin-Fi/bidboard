import { Link } from 'react-router-dom'
import { useBidStore } from '../store/useBidStore'
import { formatBid, timeAgo } from '../lib/format'
import { Zap, Trophy, Sparkles, Flame, ArrowUpRight } from 'lucide-react'

export default function ActivityTicker() {
  const activities = useBidStore((s) => s.activities)

  if (activities.length === 0) return null

  return (
    <div className="my-6 p-3.5 rounded-2xl bg-surface/80 border border-white/[0.06] shadow-sm">
      <div className="flex items-center justify-between px-1 mb-2.5">
        <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-coral-500" /> Live Attention Flow
        </span>
        <Link
          to="/activity"
          className="text-[11px] text-neutral-400 hover:text-coral-400 transition-colors inline-flex items-center gap-0.5"
        >
          View all activity <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {activities.slice(0, 8).map((evt) => (
          <div
            key={evt.id}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-2 border border-white/[0.08] hover:border-white/[0.16] transition-colors"
          >
            <div className="w-5 h-5 rounded-lg bg-coral-500/15 text-coral-400 flex items-center justify-center">
              {evt.type === 'claim_top' ? (
                <Trophy className="w-3 h-3 text-amber-400" />
              ) : evt.type === 'outbid' ? (
                <Zap className="w-3 h-3 text-coral-400" />
              ) : (
                <Sparkles className="w-3 h-3 text-coral-400" />
              )}
            </div>
            <span className="text-xs font-semibold text-white truncate max-w-[120px]">
              {evt.displayUrl || evt.listingTitle}
            </span>
            <span className="text-[11px] text-coral-400 font-mono font-medium">
              at #{evt.newRank} · {formatBid(evt.amount)}
            </span>
            <span className="text-[10px] text-neutral-500 whitespace-nowrap">
              {timeAgo(evt.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
