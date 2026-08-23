import { useBidStore } from '../store/useBidStore'
import { formatBid } from '../lib/format'
import { Link } from 'react-router-dom'

export default function MapPage() {
  const listings = useBidStore((s) => s.listings)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display font-bold text-3xl text-white">Global Leaderboard Distribution</h1>
      <p className="text-sm text-neutral-400 mt-1">Products ranking from founders across 40+ countries.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
        {listings.slice(0, 10).map((item) => (
          <div key={item.id} className="p-4 rounded-xl bg-surface border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-display font-bold text-coral-400">#{item.rank}</span>
              <div>
                <Link to={`/listing/${item.id}`} className="font-display font-semibold text-white hover:text-coral-400 text-sm">
                  {item.title}
                </Link>
                <div className="text-xs text-neutral-400">{item.category}</div>
              </div>
            </div>
            <span className="font-display font-bold text-sm text-coral-500">{formatBid(item.currentBid)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
