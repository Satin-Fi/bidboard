import { useState, useMemo } from 'react'
import { useBidStore } from '../store/useBidStore'
import { CATEGORIES_LIST } from '../types'
import LeaderboardHero from '../components/LeaderboardHero'
import LeaderboardPodium from '../components/LeaderboardPodium'
import ActivityTicker from '../components/ActivityTicker'
import LeaderboardRow from '../components/LeaderboardRow'
import { CategoryIcon, Search, Flame } from '../components/CategoryIcon'
import { RotateCw, Plus } from 'lucide-react'

export default function HomePage() {
  const listings = useBidStore((s) => s.listings)
  const activeCategory = useBidStore((s) => s.activeCategory)
  const setCategory = useBidStore((s) => s.setCategory)
  const searchQuery = useBidStore((s) => s.searchQuery)
  const setSearch = useBidStore((s) => s.setSearch)
  const openModal = useBidStore((s) => s.openModal)

  const [page, setPage] = useState(1)
  const pageSize = 50

  const filteredListings = useMemo(() => {
    let result = listings
    if (activeCategory && activeCategory !== 'all') {
      result = result.filter((l) => l.categorySlug === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.displayUrl.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q),
      )
    }
    return result
  }, [listings, activeCategory, searchQuery])

  const top3 = filteredListings.slice(0, 3)
  const rest = filteredListings.slice(3)
  const totalPages = Math.max(1, Math.ceil(filteredListings.length / pageSize))

  return (
    <div className="mx-auto max-w-4xl px-4 py-4">
      {/* ── Hero Component ────────────────────────────────────────── */}
      <LeaderboardHero />

      {/* ── Category Filter Pills & Search ───────────────────────── */}
      <div className="my-6 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar flex-1">
            {CATEGORIES_LIST.map((cat) => {
              const isActive = activeCategory === cat.slug
              return (
                <button
                  key={cat.slug}
                  onClick={() => {
                    setCategory(cat.slug)
                    setPage(1)
                  }}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-coral-500 text-white shadow-md shadow-coral-500/20'
                      : 'bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
                  }`}
                >
                  {cat.slug === 'all' ? (
                    <Flame className="w-3.5 h-3.5 text-coral-400" />
                  ) : (
                    <CategoryIcon name={cat.slug} className="w-3.5 h-3.5 opacity-80" />
                  )}
                  <span>{cat.name}</span>
                </button>
              )
            })}
          </div>

          <div className="relative w-full sm:w-52 flex-shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search spots..."
              value={searchQuery}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full bg-surface border border-white/10 rounded-full pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-coral-500/60 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── Top 3 Podium Cards ────────────────────────────────────── */}
      <LeaderboardPodium listings={top3} />

      {/* ── Real-time Activity Ticker ─────────────────────────────── */}
      <ActivityTicker />

      {/* ── Vertical Ranked List (Ranks #4 and below) ─────────────── */}
      {rest.length > 0 ? (
        <div className="space-y-2.5 my-6">
          {rest.map((item, index) => {
            const actualRank = item.rank
            const showTop10Divider = actualRank === 11 && index > 0
            const showTop50Divider = actualRank === 51 && index > 0

            return (
              <div key={item.id}>
                {showTop10Divider && (
                  <div className="my-5 flex items-center justify-center gap-3">
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="px-3 py-1 rounded-full bg-surface-2 border border-white/10 text-[10px] font-mono font-bold tracking-widest text-neutral-400 uppercase">
                      TOP 10
                    </span>
                    <div className="h-px bg-white/10 flex-1" />
                  </div>
                )}

                {showTop50Divider && (
                  <div className="my-5 flex items-center justify-center gap-3">
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="px-3 py-1 rounded-full bg-surface-2 border border-white/10 text-[10px] font-mono font-bold tracking-widest text-neutral-400 uppercase">
                      TOP 50
                    </span>
                    <div className="h-px bg-white/10 flex-1" />
                  </div>
                )}

                <LeaderboardRow listing={item} />
              </div>
            )
          })}
        </div>
      ) : (
        top3.length === 0 && (
          <div className="text-center py-16 rounded-2xl bg-surface border border-white/[0.06] my-8">
            <p className="text-neutral-400 text-sm">No listings found in this category.</p>
            <button
              onClick={() => openModal({ categorySlug: activeCategory })}
              className="btn-accent !mt-4 !py-2 !px-5 text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              Be the first to claim #1 for $1
            </button>
          </div>
        )
      )}

      {/* ── Pagination & Refresh Controls ─────────────────────────── */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-t border-white/[0.06] text-xs text-neutral-400">
        <div className="flex items-center gap-1.5">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="w-7 h-7 rounded-lg bg-surface hover:bg-surface-2 disabled:opacity-30 flex items-center justify-center border border-white/10 transition-colors"
          >
            ‹
          </button>
          <button
            onClick={() => setPage(1)}
            className={`w-7 h-7 rounded-lg font-mono font-medium flex items-center justify-center transition-colors ${
              page === 1
                ? 'bg-coral-500 text-white font-bold'
                : 'bg-surface hover:bg-surface-2 border border-white/10 text-neutral-300'
            }`}
          >
            1
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="w-7 h-7 rounded-lg bg-surface hover:bg-surface-2 disabled:opacity-30 flex items-center justify-center border border-white/10 transition-colors"
          >
            ›
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-neutral-400">
            1 - {Math.min(filteredListings.length, pageSize)} of {filteredListings.length} spots
          </span>
          <button
            onClick={() => window.location.reload()}
            className="px-2.5 py-1 rounded-lg bg-surface hover:bg-surface-2 border border-white/10 text-neutral-300 flex items-center gap-1 text-[11px] transition-colors"
          >
            <RotateCw className="w-3 h-3 text-neutral-400" />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Bottom Attention Callout ────────────────────────── */}
      <section className="mt-14 p-8 sm:p-12 rounded-3xl bg-surface border border-white/[0.08] text-center relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-coral-500/5 via-transparent to-transparent pointer-events-none" />

        <p className="text-xs sm:text-sm text-neutral-400 font-medium">
          A <span className="text-coral-400 font-semibold underline underline-offset-4">public attention marketplace</span> where
        </p>

        <div className="my-3 font-display font-black text-4xl sm:text-6xl text-coral-500 tracking-tight select-all drop-shadow-sm">
          Rank is determined by bid.
        </div>

        <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
          Anyone can start ranking from $1. Outbid existing positions to climb to the top of the leaderboard.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => openModal({ initialAmount: 1 })}
            className="btn-accent !px-8 !py-3 !text-sm !font-bold !rounded-xl"
          >
            Claim Your Spot for $1 →
          </button>
        </div>
      </section>
    </div>
  )
}
