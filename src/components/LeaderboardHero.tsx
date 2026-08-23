import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBidStore } from '../store/useBidStore'
import { formatBid } from '../lib/format'
import CategorySelect from './CategorySelect'
import { Globe, Plus, Minus, ArrowUpRight, Sparkles } from 'lucide-react'

export default function LeaderboardHero() {
  const listings = useBidStore((s) => s.listings)
  const openModal = useBidStore((s) => s.openModal)

  const top1 = listings[0]
  const top1Price = top1 ? top1.currentBid : 0
  const defaultClaimPrice = top1 ? top1Price + 1 : 1
  const [claimPrice, setClaimPrice] = useState(defaultClaimPrice)
  const [inputUrl, setInputUrl] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    openModal({
      initialUrl: inputUrl,
      initialAmount: Math.max(1, claimPrice),
      categorySlug: selectedCategory,
    })
  }

  return (
    <section className="pt-6 pb-8 text-center relative overflow-hidden">
      {/* ── Top Live Indicator Badge (Real, authentic stats) ────────────────── */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-2 border border-white/[0.08] text-xs text-neutral-300 mb-6 hover:border-white/[0.15] transition-colors shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="font-semibold text-emerald-400 font-mono">Live attention market</span>
        <span className="text-neutral-600">·</span>
        <span className="text-neutral-400 font-mono">
          {listings.length === 0 ? 'Starting at $1' : `${listings.length} spots ranked`}
        </span>
        <span className="text-neutral-600">·</span>
        <Link
          to="/activity"
          className="text-neutral-300 hover:text-white font-medium inline-flex items-center gap-0.5 hover:underline"
        >
          activity <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      {/* ── Hero Heading with Stepper ────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 my-2">
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-white tracking-tight">
          Claim #1 for
        </h1>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={() => setClaimPrice((p) => Math.max(1, p - 1))}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-surface-2 hover:bg-surface-3 border border-white/[0.08] flex items-center justify-center text-neutral-300 hover:text-white transition-transform active:scale-95 shadow-sm"
            title="Decrease claim amount"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="font-display font-black text-4xl sm:text-6xl text-coral-500 tracking-tight font-mono select-all">
            {formatBid(claimPrice)}
          </span>
          <button
            type="button"
            onClick={() => setClaimPrice((p) => p + 1)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-coral-500/15 hover:bg-coral-500/25 border border-coral-500/30 flex items-center justify-center text-coral-400 hover:text-coral-300 transition-transform active:scale-95 shadow-sm"
            title="Increase claim amount"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Subtitle ─────────────────────────────────────────────── */}
      <p className="mt-3 text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
        <span className="text-coral-400 font-semibold">New spots start at $1.</span> Paying less than the #1 price still puts you on the board at whatever place that bid can take.
      </p>

      {/* ── Main Input Bar with Custom Dropdown ──────────────────── */}
      <form onSubmit={handleQuickSubmit} className="mt-6 max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 rounded-2xl bg-surface border border-white/[0.08] shadow-card-subtle focus-within:border-coral-500/60 transition-colors">
          <div className="relative flex-1 w-full">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
              <Globe className="w-4 h-4" />
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
            <CategorySelect
              value={selectedCategory}
              onChange={setSelectedCategory}
              includeAll
              className="w-full sm:w-48"
              placeholder="Choose category"
            />

            <button
              type="submit"
              className="btn-accent !px-6 !py-2.5 !text-sm !font-bold whitespace-nowrap !rounded-xl shadow-md shadow-coral-500/20 flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Outbid
            </button>
          </div>
        </div>

        <p className="text-[11px] text-neutral-500 mt-2.5">
          Already on the list? Enter the same URL or @handle to top up your bid and climb higher.
        </p>
      </form>
    </section>
  )
}
