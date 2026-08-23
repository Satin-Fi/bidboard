import { useParams, Link } from 'react-router-dom'
import { useBidStore } from '../store/useBidStore'
import { formatBid, formatClicks, timeAgo } from '../lib/format'

export default function ListingPage() {
  const { id } = useParams<{ id: string }>()
  const listings = useBidStore((s) => s.listings)
  const openModal = useBidStore((s) => s.openModal)
  const trackClick = useBidStore((s) => s.trackClick)

  const listing = listings.find((l) => l.id === id || l.displayUrl === id)

  if (!listing) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h2 className="font-display font-bold text-2xl text-white">Listing not found</h2>
        <p className="text-sm text-neutral-400 mt-2">This product is not on the active leaderboard.</p>
        <Link to="/" className="btn-accent !mt-6 !inline-block">
          ← Back to Leaderboard
        </Link>
      </div>
    )
  }

  const nextBid = listing.currentBid + 5

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/" className="text-xs font-semibold text-neutral-400 hover:text-white mb-6 inline-block">
        ← Back to Leaderboard
      </Link>

      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-white/[0.08] relative overflow-hidden shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-display font-extrabold text-xl ${
                listing.logoBg || 'bg-zinc-800 text-white'
              }`}
            >
              {listing.logoText || listing.title.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-coral-500 font-display font-extrabold text-white text-xs">
                  #{listing.rank}
                </span>
                <h1 className="font-display font-extrabold text-2xl text-white">{listing.title}</h1>
              </div>
              <a
                href={listing.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick(listing.id)}
                className="text-xs text-coral-400 hover:underline mt-0.5 inline-block"
              >
                {listing.displayUrl} ↗
              </a>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-neutral-400 uppercase font-semibold tracking-wider">Current Bid</div>
            <div className="font-display font-black text-2xl sm:text-3xl text-coral-500">
              {formatBid(listing.currentBid)}
            </div>
          </div>
        </div>

        <p className="text-sm text-neutral-300 mt-6 leading-relaxed bg-surface-2 p-4 rounded-xl border border-white/[0.04]">
          {listing.description}
        </p>

        <div className="grid grid-cols-3 gap-3 my-6 text-center">
          <div className="p-3 rounded-xl bg-surface-2 border border-white/[0.04]">
            <div className="text-[11px] text-neutral-400">Total Clicks</div>
            <div className="font-display font-bold text-lg text-white mt-0.5">
              🔥 {formatClicks(listing.clickCount)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-surface-2 border border-white/[0.04]">
            <div className="text-[11px] text-neutral-400">Category</div>
            <div className="font-display font-semibold text-xs text-neutral-200 mt-1 truncate">
              {listing.category}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-surface-2 border border-white/[0.04]">
            <div className="text-[11px] text-neutral-400">Listed</div>
            <div className="font-display font-semibold text-xs text-neutral-200 mt-1">
              {timeAgo(listing.createdAt)}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackClick(listing.id)}
            className="flex-1 btn-secondary !py-3 !text-sm text-center font-bold"
          >
            Visit Website ↗
          </a>
          <button
            onClick={() =>
              openModal({
                targetListing: listing,
                targetRank: listing.rank,
                initialAmount: nextBid,
              })
            }
            className="flex-1 btn-accent !py-3 !text-sm font-bold"
          >
            Outbid for {formatBid(nextBid)} →
          </button>
        </div>
      </div>
    </div>
  )
}
