import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBidStore } from '../store/useBidStore'
import { useUiStore } from '../store/useUiStore'
import { FORMATS, CATEGORIES, type ListingFormat, type Category, type AuctionType } from '../types'

const GRADIENTS = [
  'from-rose-500 via-orange-500 to-amber-400',
  'from-sky-500 via-cyan-500 to-emerald-400',
  'from-violet-500 via-fuchsia-500 to-pink-500',
  'from-amber-500 via-yellow-400 to-lime-400',
  'from-teal-500 via-blue-500 to-indigo-500',
  'from-orange-600 via-red-500 to-rose-500',
]

export default function SellPage() {
  const createListing = useBidStore((s) => s.createListing)
  const push = useUiStore((s) => s.push)
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [owner, setOwner] = useState('')
  const [verified, setVerified] = useState(false)
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [category, setCategory] = useState<Category>('Billboard')
  const [format, setFormat] = useState<ListingFormat>('Static Bulk')
  const [auctionType, setAuctionType] = useState<AuctionType>('timed')
  const [impressions, setImpressions] = useState('')
  const [viewsPerDay, setViewsPerDay] = useState('')
  const [reserve, setReserve] = useState('')
  const [startPrice, setStartPrice] = useState('')
  const [declinePerHour, setDeclinePerHour] = useState('')
  const [ratePerWeek, setRatePerWeek] = useState('')
  const [hours, setHours] = useState('48')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [gradient, setGradient] = useState(GRADIENTS[0])
  const [description, setDescription] = useState('')
  const [size, setSize] = useState('')
  const [illumination, setIllumination] = useState('Reflective')
  const [audience, setAudience] = useState('')
  const [dayparting, setDayparting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !city.trim() || !owner.trim()) {
      setError('Title, owner and city are required.')
      return
    }
    const res = Number(reserve)
    const dur = Number(hours)
    const start = auctionType === 'reverse' ? Number(startPrice) : undefined
    if (!res || res <= 0) { setError('Reserve price must be a positive number.'); return }
    if (auctionType === 'reverse' && (!start || start <= res)) { setError('For Dutch auctions, start price must exceed the reserve.'); return }

    const id = createListing({
      owner: owner.trim(), title: title.trim(), city: city.trim(),
      address: address.trim() || city.trim(),
      category, format, auctionType,
      weeklyImpressions: Number(impressions) > 0 ? Number(impressions) : 0,
      viewsPerDay: Number(viewsPerDay) > 0 ? Number(viewsPerDay) : 0,
      reserve: res,
      startPrice: start,
      declinePerHour: auctionType === 'reverse' ? (Number(declinePerHour) > 0 ? Number(declinePerHour) : 0) : undefined,
      ratePerWeek: Number(ratePerWeek) > 0 ? Number(ratePerWeek) : undefined,
      endsAt: Date.now() + (dur > 0 ? dur : 48) * 60 * 60 * 1000,
      lat: Number(lat) || 39.8, lng: Number(lng) || -98.5,
      gradient, description: description.trim() || 'No description provided.',
      verified, size: size.trim() || '—', illumination,
      audience: audience.trim() || 'General public', dayparting,
    })
    push('Slot published to the open auction.', 'ok')
    navigate(`/listing/${id}`)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display font-bold text-3xl">List a billboard slot</h1>
      <p className="text-muted mt-2">Put your outdoor inventory in front of live bidders. Listings go straight to the open auction.</p>

      <form onSubmit={submit} className="card p-6 mt-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Slot title *"><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Downtown Digital Spectacular" /></Field>
          <Field label="Owner / company *"><input className="input" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Your media company" /></Field>
          <Field label="City *"><input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Austin, TX" /></Field>
          <Field label="Address"><input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Optional" /></Field>
          <Field label="Category">
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIES.map((c) => (<option key={c}>{c}</option>))}
            </select>
          </Field>
          <Field label="Format">
            <select className="input" value={format} onChange={(e) => setFormat(e.target.value as ListingFormat)}>
              {FORMATS.map((f) => (<option key={f}>{f}</option>))}
            </select>
          </Field>
          <Field label="Auction type">
            <select className="input" value={auctionType} onChange={(e) => setAuctionType(e.target.value as AuctionType)}>
              <option value="timed">Timed (English)</option>
              <option value="reverse">Dutch (declining price)</option>
            </select>
          </Field>
          <Field label="Physical size"><input className="input" value={size} onChange={(e) => setSize(e.target.value)} placeholder="14 × 48 ft" /></Field>
          <Field label="Illumination"><input className="input" value={illumination} onChange={(e) => setIllumination(e.target.value)} placeholder="Reflective / LED / Backlit" /></Field>
          <Field label="Audience"><input className="input" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Commuters 25-54" /></Field>
          <Field label="Weekly impressions"><input className="input" type="number" value={impressions} onChange={(e) => setImpressions(String(Number(e.target.value)))} placeholder="250000" /></Field>
          <Field label="Views per day"><input className="input" type="number" value={viewsPerDay} onChange={(e) => setViewsPerDay(String(Number(e.target.value)))} placeholder="35000" /></Field>
          <Field label={`Reserve / floor (USD) *`}><input className="input" type="number" value={reserve} onChange={(e) => setReserve(String(Number(e.target.value)))} placeholder="5000" /></Field>
          {auctionType === 'reverse' ? (
            <>
              <Field label="Start price (USD) *"><input className="input" type="number" value={startPrice} onChange={(e) => setStartPrice(String(Number(e.target.value)))} placeholder="9000" /></Field>
              <Field label="Decline per hour (USD)"><input className="input" type="number" value={declinePerHour} onChange={(e) => setDeclinePerHour(String(Number(e.target.value)))} placeholder="300" /></Field>
            </>
          ) : null}
          <Field label="Rate / week (USD)"><input className="input" type="number" value={ratePerWeek} onChange={(e) => setRatePerWeek(String(Number(e.target.value)))} placeholder="6500" /></Field>
          <Field label="Auction length (hours)"><input className="input" type="number" value={hours} onChange={(e) => setHours(String(Number(e.target.value)))} placeholder="48" /></Field>
          <Field label="Latitude"><input className="input" type="number" step="0.0001" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="40.7589" /></Field>
          <Field label="Longitude"><input className="input" type="number" step="0.0001" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="-73.9851" /></Field>
        </div>

        <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
          <input type="checkbox" checked={dayparting} onChange={(e) => setDayparting(e.target.checked)} className="h-4 w-4" /> Dayparted / scheduled buying available
        </label>
        <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
          <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="h-4 w-4" /> Mark owner as verified
        </label>

        <Field label="Description"><textarea className="input min-h-[90px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Audience, visibility, posting terms…" /></Field>

        <div>
          <p className="label">Artwork swatch</p>
          <div className="flex flex-wrap gap-2">
            {GRADIENTS.map((g) => (
              <button type="button" key={g} onClick={() => setGradient(g)}
                className={'h-10 w-16 rounded-lg bg-gradient-to-br ' + g + ' ' + (gradient === g ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface' : '')} />
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <div className="flex items-center gap-3">
          <button type="submit" className="btn-accent">Publish to auction</button>
          <Link to="/" className="btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (<div><label className="label">{label}</label>{children}</div>)
}
