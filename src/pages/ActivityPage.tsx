import { useBidStore } from '../store/useBidStore'
import { formatBid, formatNumber, timeAgo } from '../lib/format'

export default function ActivityPage() {
  const activities = useBidStore((s) => s.activities)
  const stats = useBidStore((s) => s.stats)
  const openModal = useBidStore((s) => s.openModal)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Top Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        <div className="p-4 rounded-2xl bg-surface border border-white/[0.06] text-center">
          <div className="text-xs text-neutral-400 font-medium">Online Viewers</div>
          <div className="font-display font-black text-2xl sm:text-3xl text-emerald-400 mt-1">
            {stats.onlineCount}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-white/[0.06] text-center">
          <div className="text-xs text-neutral-400 font-medium">Total Visitors</div>
          <div className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
            {formatNumber(stats.totalVisitors)}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-white/[0.06] text-center">
          <div className="text-xs text-neutral-400 font-medium">Total Volume</div>
          <div className="font-display font-black text-2xl sm:text-3xl text-coral-500 mt-1">
            {formatBid(stats.totalRevenue)}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-surface border border-white/[0.06] text-center">
          <div className="text-xs text-neutral-400 font-medium">Total Clicks</div>
          <div className="font-display font-black text-2xl sm:text-3xl text-amber-400 mt-1">
            {formatNumber(stats.totalClicks)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Live Activity Feed
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Real-time public events, bids, outbids, and rank advancements.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-accent !py-2 !px-4 text-xs font-bold"
        >
          + Outbid & Climb
        </button>
      </div>

      <div className="space-y-2.5">
        {activities.map((evt) => (
          <div
            key={evt.id}
            className="flex items-center justify-between gap-3 p-4 rounded-xl bg-surface border border-white/[0.06] hover:border-white/[0.12] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 ${
                  evt.type === 'claim_top'
                    ? 'bg-coral-500/20 text-coral-400 border border-coral-500/30'
                    : evt.type === 'outbid'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}
              >
                {evt.type === 'claim_top' ? '👑' : evt.type === 'outbid' ? '⚡' : '✨'}
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

            <div className="font-display font-bold text-sm sm:text-base text-coral-500">
              {formatBid(evt.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
