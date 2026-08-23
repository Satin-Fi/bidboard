import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBidStore } from '../store/useBidStore'
import { displayPrice } from '../lib/rules'
import { formatMoney, formatImpressions } from '../lib/format'

// Equirectangular projection onto a 0..100 x/y box for the continental US.
const US_BOUNDS = { latMin: 24.5, latMax: 49.5, lngMin: -125, lngMax: -66.5 }
function project(lat: number, lng: number) {
  const x = ((lng - US_BOUNDS.lngMin) / (US_BOUNDS.lngMax - US_BOUNDS.lngMin)) * 100
  const y = (1 - (lat - US_BOUNDS.latMin) / (US_BOUNDS.latMax - US_BOUNDS.latMin)) * 100
  return { x, y }
}

export default function MapPage() {
  const listings = useBidStore((s) => s.listings.filter((l) => l.status === 'live'))
  const [hover, setHover] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display font-bold text-3xl">Live inventory map</h1>
      <p className="text-muted mt-2">{listings.length} live slots across the US. Hover a pin for details.</p>

      <div className="card p-4 mt-6 relative">
        <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
          {/* map backdrop */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-surface-2 to-ink border border-white/5" />
          {/* faint grid */}
          <svg viewBox="0 0 100 56" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            {Array.from({ length: 11 }).map((_, i) => (
              <line key={'v' + i} x1={i * 10} y1={0} x2={i * 10} y2={56} stroke="rgba(255,255,255,0.05)" />
            ))}
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={'h' + i} x1={0} y1={i * 11.2} x2={100} y2={i * 11.2} stroke="rgba(255,255,255,0.05)" />
            ))}
          </svg>
          {/* pins */}
          {listings.map((l) => {
            const { x, y } = project(l.lat, l.lng)
            return (
              <button
                key={l.id}
                onMouseEnter={() => setHover(l.id)}
                onMouseLeave={() => setHover(null)}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${x}%`, top: `${y * (56 / 100)}%` }}
              >
                <span className={'block h-3 w-3 rounded-full ring-2 ring-black/40 ' + (l.auctionType === 'reverse' ? 'bg-violet-400' : 'bg-accent')} />
                {hover === l.id && (
                  <div className="absolute z-10 left-1/2 -translate-x-1/2 bottom-5 w-44 card p-3 text-left">
                    <Link to={`/listing/${l.id}`} className="font-display font-semibold text-sm hover:text-accent block">{l.title}</Link>
                    <p className="text-xs text-muted mt-0.5">{l.city}</p>
                    <p className="text-sm font-display mt-1">{formatMoney(displayPrice(l))}</p>
                    <p className="text-xs text-muted">{formatImpressions(l.weeklyImpressions)} wk impr.</p>
                  </div>
                )}
              </button>
            )
          })}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-muted">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-accent inline-block" /> Timed</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-400 inline-block" /> Dutch</span>
        </div>
      </div>
    </div>
  )
}
