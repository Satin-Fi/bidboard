import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useBidStore, type SortKey } from '../store/useBidStore'
import { useUiStore } from '../store/useUiStore'
import { saveSearch, deleteSearch } from '../store/marketActions'
import ListingCard from '../components/ListingCard'
import { FORMATS, CATEGORIES, type ListingFormat, type Category } from '../types'
import { formatImpressions, cpm } from '../lib/format'
import { displayPrice } from '../lib/rules'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'ending', label: 'Ending soon' },
  { key: 'new', label: 'Newest' },
  { key: 'bid', label: 'Highest bid' },
  { key: 'impr', label: 'Most impressions' },
  { key: 'cpm', label: 'Best CPM' },
]

export default function HomePage() {
  const listings = useBidStore((s) => s.listings)
  const watched = useBidStore((s) => s.watched)
  const watchedOnly = useUiStore((s) => s.watchedOnly)
  const setWatchedOnly = useUiStore((s) => s.setWatchedOnly)
  const sort = useBidStore((s) => s.sort)
  const setSort = useBidStore((s) => s.setSort)
  const push = useUiStore((s) => s.push)
  const savedSearches = useBidStore((s) => s.savedSearches)

  const [format, setFormat] = useState<ListingFormat | 'All'>('All')
  const [category, setCategory] = useState<Category | 'All'>('All')
  const [q, setQ] = useState('')

  const live = listings.filter((l) => l.status === 'live')
  const ended = listings.filter((l) => l.status === 'ended')

  const visible = useMemo(() => {
    let list = live
    if (watchedOnly) list = list.filter((l) => watched.includes(l.id))
    if (format !== 'All') list = list.filter((l) => l.format === format)
    if (category !== 'All') list = list.filter((l) => l.category === category)
    if (q.trim() !== '') {
      const needle = q.toLowerCase()
      list = list.filter(
        (l) => l.title.toLowerCase().includes(needle) || l.city.toLowerCase().includes(needle),
      )
    }
    const sorted = [...list]
    const price = (l: (typeof list)[number]) => displayPrice(l)
    switch (sort) {
      case 'ending': sorted.sort((a, b) => a.endsAt - b.endsAt); break
      case 'new': sorted.sort((a, b) => b.createdAt - a.createdAt); break
      case 'bid': sorted.sort((a, b) => price(b) - price(a)); break
      case 'impr': sorted.sort((a, b) => b.weeklyImpressions - a.weeklyImpressions); break
      case 'cpm': sorted.sort((a, b) => cpm(price(a), a.weeklyImpressions) - cpm(price(b), b.weeklyImpressions)); break
    }
    return sorted
  }, [live, watched, watchedOnly, format, category, q, sort, displayPrice])

  const totalImpressions = live.reduce((a, l) => a + l.weeklyImpressions, 0)
  const totalBids = listings.reduce((a, l) => a + l.bidCount, 0)

  const persistSearch = () => {
    if (!q.trim() && format === 'All' && category === 'All') {
      push('Set a filter before saving a search.', 'warn')
      return
    }
    saveSearch(q, format, category)
    push('Search saved.', 'ok')
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/40 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <span className="chip mb-4 text-accent-2 border border-accent-2/30">
            Live auctions · {live.length} slots open now
          </span>
          <h1 className="font-display font-bold text-4xl sm:text-6xl leading-[1.05] max-w-3xl">
            Bid on the best billboard space on earth.
          </h1>
          <p className="mt-5 text-lg text-muted max-w-2xl">
            Bidboard is a real-time marketplace where media owners auction outdoor
            ad slots and brands bid them up — transparent, competitive, instant.
            English and Dutch auctions, verified inventory, live CPMs.
          </p>
          <div className="mt-8 flex flex-wrap gap-6">
            <Stat label="Live auctions" value={String(live.length)} />
            <Stat label="Weekly impressions" value={formatImpressions(totalImpressions)} />
            <Stat label="Bids placed" value={String(totalBids)} />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-4 py-12 grid sm:grid-cols-3 gap-4">
        <Step n="1" title="Browse verified inventory">
          Filter by format, category and city. Every slot shows live impressions, CPM and a map pin.
        </Step>
        <Step n="2" title="Bid your price">
          Timed auctions let you outbid rivals; Dutch auctions drop the price until you grab the slot.
        </Step>
        <Step n="3" title="Win & launch">
          Anti-snipe protects late bids. Won slots come with specs and owner contacts to book creative.
        </Step>
      </section>

      {/* FILTERS */}
      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterPill active={format === 'All' && category === 'All'} onClick={() => { setFormat('All'); setCategory('All') }}>
              All
            </FilterPill>
            {CATEGORIES.map((c) => (
              <FilterPill key={c} active={category === c} onClick={() => { setCategory(c); setFormat('All') }}>
                {c}
              </FilterPill>
            ))}
            <button
              onClick={() => setWatchedOnly(!watchedOnly)}
              className={'rounded-full px-3 py-1.5 text-sm font-medium transition ' + (watchedOnly ? 'bg-accent-2/20 text-accent-2 border border-accent-2/40' : 'bg-white/5 text-muted hover:text-white hover:bg-white/10')}
            >
              ★ Watched ({watched.length})
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">Sort</span>
            <select className="input !w-auto !py-1.5" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              {SORTS.map((s) => (<option key={s.key} value={s.key}>{s.label}</option>))}
            </select>
            <button onClick={persistSearch} className="btn-ghost !py-1.5" title="Save current filter">⚲ Save</button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <input className="input sm:max-w-[220px] !py-1.5" placeholder="Search city or title…" value={q} onChange={(e) => setQ(e.target.value)} />
          <span className="text-xs text-muted hidden sm:inline">Formats:</span>
          {FORMATS.map((f) => (
            <FilterPill key={f} active={format === f} onClick={() => { setFormat(f); setCategory('All') }}>
              {f}
            </FilterPill>
          ))}
        </div>

        {savedSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs text-muted">Saved:</span>
            {savedSearches.map((s) => (
              <button key={s.id} onClick={() => { setQ(s.q); setFormat(s.format as ListingFormat | 'All'); setCategory(s.category as Category | 'All') }}
                className="chip hover:bg-white/10" title="Click to apply, double-click ✕ to delete">
                <span onClick={(e) => { e.stopPropagation(); deleteSearch(s.id) }}>{s.q || s.category || s.format} ✕</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* GRID */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        {visible.length === 0 ? (
          <div className="card p-10 text-center text-muted">
            {watchedOnly ? 'No watched slots match. Tap ☆ on a listing to watch it.'
              : `No ${category !== 'All' ? category : ''} ${format !== 'All' ? format : ''} slots match “${q}”. `}
            <Link to="/sell" className="text-accent hover:underline">List your own</Link>.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((l) => (<ListingCard key={l.id} listing={l} />))}
          </div>
        )}

        {ended.length > 0 && !watchedOnly && (
          <div className="mt-14">
            <h2 className="font-display text-xl font-semibold text-muted mb-4">Recently ended</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 opacity-70">
              {ended.map((l) => (<ListingCard key={l.id} listing={l} />))}
            </div>
          </div>
        )}
      </section>

      {/* TRUST / WHY */}
      <section className="border-t border-white/5 bg-surface/40">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="font-display text-2xl font-bold">Why buyers pick Bidboard</h2>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Trust icon="⚡" title="Two auction types">English and Dutch auctions in one marketplace.</Trust>
            <Trust icon="✓" title="Verified inventory">Owner verification + specs on every slot.</Trust>
            <Trust icon="📍" title="Geo + CPM">Map pins, impressions and live CPM per slot.</Trust>
            <Trust icon="🛡" title="Anti-snipe" >Late bids extend the clock — no last-second steals.</Trust>
          </div>
        </div>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (<div><div className="font-display text-3xl font-bold text-white">{value}</div><div className="text-sm text-muted">{label}</div></div>)
}
function Step({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <div className="card p-5">
      <div className="font-display text-2xl font-bold text-accent">{n}</div>
      <h3 className="font-display font-semibold mt-2">{title}</h3>
      <p className="text-sm text-muted mt-1">{children}</p>
    </div>
  )
}
function Trust({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <div className="card p-5">
      <div className="text-2xl">{icon}</div>
      <h3 className="font-display font-semibold mt-2">{title}</h3>
      <p className="text-sm text-muted mt-1">{children}</p>
    </div>
  )
}
function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick}
      className={'rounded-full px-3 py-1.5 text-sm font-medium transition ' + (active ? 'bg-accent text-ink' : 'bg-white/5 text-muted hover:text-white hover:bg-white/10')}>
      {children}
    </button>
  )
}
