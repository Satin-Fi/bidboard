import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBidStore } from '../store/useBidStore'
import { CATEGORIES_LIST } from '../types'
import { formatBid, formatNumber } from '../lib/format'

export default function LeaderboardHero() {
  const listings = useBidStore((s) => s.listings)
  const stats = useBidStore((s) => s.stats)
  const openModal = useBidStore((s) => s.openModal)

  const top1 = listings[0]
  const top1Price = top1 ? top1.currentBid : 15000
  const [claimPrice, setClaimPrice] = useState(top1Price + 5)
  const [inputUrl, setInputUrl] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    openModal({
      initialUrl: inputUrl,
      initialAmount: claimPrice,
      categorySlug: selectedCategory,
    })
  }

  return (
    <section className="pt-8 pb-10 text-center relative overflow-hidden">
      {/* ── Top Live Indicator Badge ─────────────────────────────── */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-neutral-300 mb-6 hover:bg-white/[0.08] transition-colors">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-emerald-400">{stats.onlineCount} online</span>
        <span className="text-neutral-500">·</span>
        <span>{formatNumber(stats.totalVisitors)} visitors since launch</span>
        <span className="text-neutral-500">·</span>
        <Link to="/activity" className="text-neutral-300 hover:text-white font-medium underline underline-offset-2">
          see stats →
        </Link>
      </div>

      {/* ── Hero Heading with Stepper ────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 my-2">
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-white tracking-tight">
          Claim #1 for
        </h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setClaimPrice((p) => Math.max(top1Price + 1, p - 5))}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-neutral-300 hover:text-white font-bold text-lg transition-transform active:scale-95"
            title="Decrease claim amount"
          >
            -
          </button>
          <span className="font-display font-black text-4xl sm:text-6xl text-coral-500 tracking-tight select-all">
            {formatBid(claimPrice)}
          </span>
          <button
            type="button"
            onClick={() => setClaimPrice((p) => p + 5)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-coral-500/20 hover:bg-coral-500/30 border border-coral-500/30 flex items-center justify-center text-coral-400 hover:text-coral-300 font-bold text-lg transition-transform active:scale-95"
            title="Increase claim amount"
          >
            +
          </button>
        </div>
      </div>

      {/* ── Subtitle ─────────────────────────────────────────────── */}
      <p className="mt-3 text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
        <span className="text-coral-400 font-semibold">New spots start at $5.</span> Paying less than the #1 price still puts you on the board at whatever place that bid can take.
      </p>

      {/* ── Main Input Bar ───────────────────────────────────────── */}
      <form onSubmit={handleQuickSubmit} className="mt-7 max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 rounded-2xl bg-surface border border-white/10 shadow-2xl focus-within:border-coral-500/60 transition-colors">
          <div className="relative flex-1 w-full">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">
              🌐
            </span>
            <input
              type="text"
              placeholder="Your product URL or @handle"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full bg-transparent pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none"
            />
          </div>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-44 bg-surface-2 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-neutral-300 outline-none cursor-pointer hover:bg-surface-3 transition-colors"
            >
              <option value="all">Choose a category</option>
              {CATEGORIES_LIST.filter((c) => c.slug !== 'all').map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="btn-accent !px-6 !py-2.5 !text-sm !font-bold whitespace-nowrap !rounded-xl"
            >
              Outbid
            </button>
          </div>
        </div>

        <p className="text-[11px] text-neutral-500 mt-2.5">
          Already on the list? Enter the same URL or @handle and up your bid.
        </p>
      </form>
    </section>
  )
}
