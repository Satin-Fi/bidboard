import { Link } from 'react-router-dom'
import { CATEGORIES_LIST } from '../types'
import { useBidStore } from '../store/useBidStore'
import { formatBid } from '../lib/format'
import { CategoryIcon } from '../components/CategoryIcon'

export default function CategoriesPage() {
  const listings = useBidStore((s) => s.listings)
  const setCategory = useBidStore((s) => s.setCategory)
  const openModal = useBidStore((s) => s.openModal)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="text-center mb-10">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-coral-400">
          Directory
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-1">
          Explore by Category
        </h1>
        <p className="text-sm text-neutral-400 mt-2 max-w-md mx-auto">
          Discover ranked products, startups, tools, and creator profiles across all industries.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {CATEGORIES_LIST.filter((c) => c.slug !== 'all').map((cat) => {
          const categoryListings = listings.filter((l) => l.categorySlug === cat.slug)
          const topProduct = categoryListings[0]

          return (
            <div
              key={cat.slug}
              className="p-5 rounded-2xl bg-surface border border-white/[0.06] hover:border-white/[0.15] hover:bg-surface-2 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center text-coral-400">
                    <CategoryIcon name={cat.slug} className="w-4 h-4" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/[0.05] text-xs font-mono font-semibold text-neutral-400">
                    {categoryListings.length} spots
                  </span>
                </div>

                <h3 className="font-display font-bold text-base text-white group-hover:text-coral-400 transition-colors">
                  {cat.name}
                </h3>

                {topProduct ? (
                  <p className="text-xs text-neutral-400 mt-2 line-clamp-2">
                    #1 in category: <span className="text-white font-medium">{topProduct.title}</span> ({formatBid(topProduct.currentBid)})
                  </p>
                ) : (
                  <p className="text-xs text-neutral-500 mt-2">
                    No products yet. Be the first to rank from $1!
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                <Link
                  to="/"
                  onClick={() => setCategory(cat.slug)}
                  className="text-xs font-semibold text-coral-400 hover:underline"
                >
                  View leaderboard →
                </Link>
                <button
                  onClick={() => openModal({ categorySlug: cat.slug, initialAmount: 1 })}
                  className="text-[11px] font-medium text-neutral-400 hover:text-white"
                >
                  + Add product ($1)
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
