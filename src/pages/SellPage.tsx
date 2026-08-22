import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useBidStore } from '../store/useBidStore'
import { FORMATS, type ListingFormat } from '../types'

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
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [owner, setOwner] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [format, setFormat] = useState<ListingFormat>('Static Bulk')
  const [impressions, setImpressions] = useState('')
  const [reserve, setReserve] = useState('')
  const [hours, setHours] = useState('48')
  const [gradient, setGradient] = useState(GRADIENTS[0])
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !city.trim() || !owner.trim()) {
      setError('Title, owner and city are required.')
      return
    }
    const impr = Number(impressions)
    const res = Number(reserve)
    const dur = Number(hours)
    if (!res || res <= 0) {
      setError('Reserve price must be a positive number.')
      return
    }
    const id = createListing({
      owner: owner.trim(),
      title: title.trim(),
      city: city.trim(),
      address: address.trim() || city.trim(),
      gradient,
      format,
      weeklyImpressions: impr > 0 ? impr : 0,
      reserve: res,
      description: description.trim() || 'No description provided.',
      endsAt: Date.now() + (dur > 0 ? dur : 48) * 60 * 60 * 1000,
    })
    navigate(`/listing/${id}`)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display font-bold text-3xl">List a billboard slot</h1>
      <p className="text-muted mt-2">
        Put your outdoor inventory in front of live bidders. Listings go straight
        to the open auction.
      </p>

      <form onSubmit={submit} className="card p-6 mt-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Slot title *">
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Downtown Digital Spectacular" />
          </Field>
          <Field label="Owner / company *">
            <input className="input" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Your media company" />
          </Field>
          <Field label="City *">
            <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Austin, TX" />
          </Field>
          <Field label="Address">
            <input className="input" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Optional" />
          </Field>
          <Field label="Format">
            <select className="input" value={format} onChange={(e) => setFormat(e.target.value as ListingFormat)}>
              {FORMATS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Weekly impressions">
            <input className="input" type="number" value={impressions} onChange={(e) => setImpressions(String(Number(e.target.value)))} placeholder="250000" />
          </Field>
          <Field label="Reserve price (USD) *">
            <input className="input" type="number" value={reserve} onChange={(e) => setReserve(String(Number(e.target.value)))} placeholder="5000" />
          </Field>
          <Field label="Auction length (hours)">
            <input className="input" type="number" value={hours} onChange={(e) => setHours(String(Number(e.target.value)))} placeholder="48" />
          </Field>
        </div>

        <Field label="Description">
          <textarea className="input min-h-[90px]" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Audience, visibility, posting terms…" />
        </Field>

        <div>
          <p className="label">Artwork swatch</p>
          <div className="flex flex-wrap gap-2">
            {GRADIENTS.map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setGradient(g)}
                className={
                  'h-10 w-16 rounded-lg bg-gradient-to-br ' +
                  g +
                  ' ' +
                  (gradient === g ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface' : '')
                }
              />
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
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}
