import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useBidStore } from '../store/useBidStore'
import ListingCard from '../components/ListingCard'
import { FORMATS, type ListingFormat } from '../types'
import { formatImpressions } from '../lib/format'

export default function HomePage() {
  const listings = useBidStore((s) => s.listings)
  const [format, setFormat] = useState<'All' | ListingFormat>('All')
  const [q, setQ] = useState('')

  const live = listings.filter((l) => l.status === 'live')
  const ended = listings.filter((l) => l.status === 'ended')

  const filtered = live.filter((l) => {
    const byFormat = format === 'All' || l.format === format
    const byQuery =
      q.trim() === '' ||
      l.title.toLowerCase().includes(q.toLowerCase()) ||
      l.city.toLowerCase().includes(q.toLowerCase())
    return byFormat && byQuery
  })

  const totalImpressions = live.reduce((a, l) => a + l.weeklyImpressions, 0)
  const totalBids = listings.reduce((a, l) => a + l.bidCount, 0)

  return (
    <div>
      {/* Hero */}
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

      {/* Filters */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterPill active={format === 'All'} onClick={() => setFormat('All')}>
              All
            </FilterPill>
            {FORMATS.map((f) => (
              <FilterPill key={f} active={format === f} onClick={() => setFormat(f)}>
                {f}
              </FilterPill>
            ))}
          </div>
          <input
            className="input sm:max-w-xs"
            placeholder="Search city or title…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </section>

      {/* Listing grid */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        {filtered.length === 0 ? (
          <div className="card p-10 text-center text-muted">
            No {format !== 'All' ? format : ''} slots match “{q}”.{' '}
            <Link to="/sell" className="text-accent hover:underline">
              List your own
            </Link>
            .
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}

        {ended.length > 0 && (
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
