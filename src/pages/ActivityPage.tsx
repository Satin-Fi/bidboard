import { useBidStore } from '../store/useBidStore'
import { formatBid, formatNumber, timeAgo } from '../lib/format'
import { Trophy, Zap, Sparkles, Plus } from 'lucide-react'

export default function ActivityPage() {
  const activities = useBidStore((s) => s.activities)
  const stats = useBidStore((s) => s.stats)
  const openModal = useBidStore((s) => s.openModal)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <div className="p-4 rounded-2xl bg-surface border border-white/[0.06] text-center shadow-sm">
          <div className="text-xs text-neutral-400 font-medium">Online Viewers</div>
          <div className="font-display font-black text-2xl sm:text-3xl text-emerald-400 mt-1 font-mono">
            {stats.onlineCount}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-white/[0.06] text-center shadow-sm">
          <div className="text-xs text-neutral-400 font-medium">Total Visitors</div>
          <div className="font-display font-black text-2xl sm:text-3xl text-white mt-1 font-mono">
            {formatNumber(stats.totalVisitors)}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-white/[0.06] text-center shadow-sm">
          <div className="text-xs text-neutral-400 font-medium">Total Volume</div>
          <div className="font-display font-black text-2xl sm:text-3xl text-coral-500 mt-1 font-mono">
            {formatBid(stats.totalRevenue)}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-white/[0.06] text-center shadow-sm">
          <div className="text-xs text-neutral-400 font-medium">Total Clicks</div>
          <div className="font-display font-black text-2xl sm:text-3xl text-amber-400 mt-1 font-mono">
            {formatNumber(stats.totalClicks)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Live Activity Feed
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Real-time public events, bids, outbids, and rank advancements.
          </p>
        </div>
        <button
          onClick={() => openModal({ initialAmount: 1 })}
          className="btn-accent !py-2 !px-4 text-xs font-bold"
        >
          <Plus className="w-3.5 h-3.5" />
          Outbid & Climb ($1)
        </button>
      </div>

      <div className="space-y-2.5">
        {activities.map((evt) => (
          <div
            key={evt.id}
            className="flex items-center justify-between gap-3 p-4 rounded-xl bg-surface border border-white/[0.06] hover:border-white/[0.14] transition-all duration-150 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 ${
                  evt.type === 'claim_top'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                    : evt.type === 'outbid'
                      ? 'bg-coral-500/15 text-coral-400 border border-coral-500/25'
                      : 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                }`}
              >
                {evt.type === 'claim_top' ? (
                  <Trophy className="w-5 h-5 text-amber-400" />
                ) : evt.type === 'outbid' ? (
                  <Zap className="w-5 h-5" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm text-white">
                    {evt.displayUrl || evt.listingTitle}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {evt.type === 'claim_top'
                      ? 'claimed #1 rank'
                      : evt.oldRank
                        ? `climbed from #${evt.oldRank} → #${evt.newRank}`
                        : `joined leaderboard at #${evt.newRank}`}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-500 mt-0.5">
                  {timeAgo(evt.createdAt)}
                </div>
              </div>
            </div>

            <div className="font-display font-bold text-sm sm:text-base text-coral-500 font-mono">
              {formatBid(evt.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
