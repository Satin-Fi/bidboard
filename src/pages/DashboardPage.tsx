import { Link } from 'react-router-dom'
import { useBidStore } from '../store/useBidStore'
import { formatBid, formatClicks, formatNumber, timeAgo } from '../lib/format'

export default function DashboardPage() {
  const listings = useBidStore((s) => s.listings)
  const stats = useBidStore((s) => s.stats)
  const openModal = useBidStore((s) => s.openModal)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">Attention Analytics</h1>
          <p className="text-sm text-neutral-400 mt-1">Live overview of product rankings, click throughput, and revenue volume.</p>
        </div>
        <button onClick={() => openModal()} className="btn-accent">+ Claim Spot</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi label="Online Viewers" value={String(stats.onlineCount)} />
        <Kpi label="Total Visitors" value={formatNumber(stats.totalVisitors)} />
        <Kpi label="Total Volume" value={formatBid(stats.totalRevenue)} />
        <Kpi label="Total Clicks" value={formatNumber(stats.totalClicks)} />
      </div>

      <h2 className="font-display text-xl font-semibold mt-10 mb-3 text-white">Top 10 Attention Positions</h2>
      <div className="space-y-3">
        {listings.slice(0, 10).map((l) => (
          <div key={l.id} className="p-4 rounded-xl bg-surface border border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-7 text-center font-display font-extrabold text-coral-400">
                #{l.rank}
              </span>
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-xs ${
                  l.logoBg || 'bg-zinc-800 text-white'
                }`}
              >
                {l.logoText || l.title.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <Link to={`/listing/${l.id}`} className="font-display font-semibold text-white hover:text-coral-400">
                  {l.title}
                </Link>
                <p className="text-xs text-neutral-400">{l.category} · {timeAgo(l.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="text-amber-400 font-mono text-xs">
                🔥 {formatClicks(l.clickCount)} clicks
              </span>
              <span className="font-display font-bold text-coral-500">
                {formatBid(l.currentBid)}
              </span>
              <button
                onClick={() =>
                  openModal({
                    targetListing: l,
                    targetRank: l.rank,
                    initialAmount: l.currentBid + 5,
                  })
                }
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300"
              >
                Outbid
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-surface border border-white/[0.06] text-center">
      <div className="font-display text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-neutral-400 mt-0.5">{label}</div>
    </div>
  )
}
