import { Link } from 'react-router-dom'
import { useBidStore } from '../store/useBidStore'
import { formatBid, timeAgo } from '../lib/format'

export default function ActivityTicker() {
  const activities = useBidStore((s) => s.activities)

  if (activities.length === 0) return null

  return (
    <div className="my-6 p-3 rounded-2xl bg-surface/60 border border-white/[0.06]">
      <div className="flex items-center justify-between px-1 mb-2">
        <span className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
          <span className="text-coral-500">💥</span> Latest activity
        </span>
        <Link to="/activity" className="text-[11px] text-neutral-400 hover:text-coral-400 transition-colors">
          View all activity →
        </Link>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
        {activities.slice(0, 8).map((evt) => (
          <div
            key={evt.id}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#13151c] border border-white/[0.08] hover:border-white/[0.15] transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-coral-500/20 text-coral-400 flex items-center justify-center text-[10px] font-bold">
              {evt.type === 'claim_top' ? '👑' : evt.type === 'outbid' ? '⚡' : '✨'}
            </div>
            <span className="text-xs font-semibold text-white truncate max-w-[110px]">
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
