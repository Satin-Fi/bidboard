import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useBidStore, type SortKey } from '../store/useBidStore'
import { useUiStore } from '../store/useUiStore'
import ListingCard from '../components/ListingCard'
import { FORMATS, type ListingFormat } from '../types'
import { formatImpressions } from '../lib/format'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'ending', label: 'Ending soon' },
  { key: 'new', label: 'Newest' },
  { key: 'bid', label: 'Highest bid' },
  { key: 'impr', label: 'Most impressions' },
]

export default function HomePage() {
  const listings = useBidStore((s) => s.listings)
  const watched = useBidStore((s) => s.watched)
  const watchedOnly = useUiStore((s) => s.watchedOnly)
  const setWatchedOnly = useUiStore((s) => s.setWatchedOnly)
  const sort = useBidStore((s) => s.sort)
  const setSort = useBidStore((s) => s.setSort)
  const rivalBid = useBidStore((s) => s.rivalBid)
  const tick = useBidStore((s) => s.tick)
  const push = useUiStore((s) => s.push)

  const [format, setFormat] = useState<'All' | ListingFormat>('All')
  const [q, setQ] = useState('')

  // auction clock
  useEffect(() => {
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [tick])

  // simulated marketplace: every ~7s a rival bumps a random live auction
  useEffect(() => {
    const t = setInterval(() => {
      const live = useBidStore.getState().listings.filter((l) => l.status === 'live')
      if (live.length === 0) return
      const target = live[Math.floor(Math.random() * live.length)]
      const before = target.currentBid
      rivalBid(target.id)
      const after = useBidStore.getState().listings.find((l) => l.id === target.id)!
      if (after.currentBid > before && useBidStore.getState().watched.includes(target.id)) {
        push(`New bid on ${target.title}: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(after.currentBid)}`, 'info')
      }
    }, 7000)
    return () => clearInterval(t)
  }, [rivalBid, push])

  const live = listings.filter((l) => l.status === 'live')
  const ended = listings.filter((l) => l.status === 'ended')

  const visible = useMemo(() => {
    let list = live
    if (watchedOnly) list = list.filter((l) => watched.includes(l.id))
    if (format !== 'All') list = list.filter((l) => l.format === format)
    if (q.trim() !== '') {
      const needle = q.toLowerCase()
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(needle) ||
          l.city.toLowerCase().includes(needle),
      )
    }
    const sorted = [...list]
    switch (sort) {
      case 'ending':
        sorted.sort((a, b) => a.endsAt - b.endsAt)
        break
      case 'new':
        sorted.sort((a, b) => b.createdAt - a.createdAt)
        break
      case 'bid':
        sorted.sort(
          (a, b) => (b.currentBid > 0 ? b.currentBid : b.reserve) - (a.currentBid > 0 ? a.currentBid : a.reserve),
        )
        break
      case 'impr':
        sorted.sort((a, b) => b.weeklyImpressions - a.weeklyImpressions)
        break
    }
    return sorted
  }, [live, watched, watchedOnly, format, q, sort])

  const totalImpressions = live.reduce((a, l) => a + l.weeklyImpressions, 0)
  const totalBids = listings.reduce((a, l) => a + l.bidCount, 0)

  return (
    <div>
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
          </p>
          <div className="mt-8 flex flex-wrap gap-6">
            <Stat label="Live auctions" value={String(live.length)} />
            <Stat label="Weekly impressions" value={formatImpressions(totalImpressions)} />
            <Stat label="Bids placed" value={String(totalBids)} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterPill active={format === 'All'} onClick={() => setFormat('All')}>
              All
            </FilterPill>
            {FORMATS.map((f) => (
              <FilterPill key={f} active={format === f} onClick={() => setFormat(f)}>
                {f}
              </FilterPill>
            ))}
            <button
              onClick={() => setWatchedOnly(!watchedOnly)}
              className={
                'rounded-full px-3 py-1.5 text-sm font-medium transition ' +
                (watchedOnly
                  ? 'bg-accent-2/20 text-accent-2 border border-accent-2/40'
                  : 'bg-white/5 text-muted hover:text-white hover:bg-white/10')
              }
            >
              ★ Watched ({watched.length})
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted">Sort</span>
            <select
              className="input !w-auto !py-1.5"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <input
              className="input sm:max-w-[180px] !py-1.5"
              placeholder="Search city or title…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        {visible.length === 0 ? (
          <div className="card p-10 text-center text-muted">
            {watchedOnly
              ? 'No watched slots match. Tap ☆ on a listing to watch it.'
              : `No ${format !== 'All' ? format : ''} slots match “${q}”. `}
            <Link to="/sell" className="text-accent hover:underline">
              List your own
            </Link>
            .
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}

        {ended.length > 0 && !watchedOnly && (
          <div className="mt-14">
            <h2 className="font-display text-xl font-semibold text-muted mb-4">
              Recently ended
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 opacity-70">
              {ended.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-3xl font-bold text-white">{value}</div>
      <div className="text-sm text-muted">{label}</div>
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded-full px-3 py-1.5 text-sm font-medium transition ' +
        (active
          ? 'bg-accent text-ink'
          : 'bg-white/5 text-muted hover:text-white hover:bg-white/10')
      }
    >
      {children}
    </button>
  )
}
