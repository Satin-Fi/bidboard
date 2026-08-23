import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBidStore } from '../store/useBidStore'
import { CATEGORIES_LIST } from '../types'
import { calculateRank } from '../lib/rules'
import { formatBid } from '../lib/format'
import { useUiStore } from '../store/useUiStore'

export default function SellPage() {
  const navigate = useNavigate()
  const listings = useBidStore((s) => s.listings)
  const placeBid = useBidStore((s) => s.placeBid)
  const pushToast = useUiStore((s) => s.push)

  const top1 = listings[0]
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('ai-agents-infrastructure')
  const [amount, setAmount] = useState(top1 ? top1.currentBid + 5 : 25)
  const [bidder, setBidder] = useState('')

  const estimatedRank = calculateRank(listings, amount)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    const result = placeBid({
      url: url.trim(),
      title: title.trim(),
      description: description.trim(),
      categorySlug: category,
      amount: Number(amount),
      bidder: bidder.trim(),
    })

    pushToast(`Secured rank #${result.rank} for ${formatBid(amount)}!`, 'ok')
    navigate('/')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="text-center mb-8">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-coral-400">
          Get Listed
        </span>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white mt-1">
          Claim Your Leaderboard Rank
        </h1>
        <p className="text-sm text-neutral-400 mt-2">
          Place your product in front of thousands of daily founders, builders, and early adopters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-surface border border-white/[0.08] space-y-4">
        <div>
          <label className="label">Website URL or @handle</label>
          <input
            type="text"
            required
            placeholder="https://yourproduct.com or @handle"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="input text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Product Name</label>
            <input
              type="text"
              placeholder="e.g. MyProduct"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input text-sm"
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input text-sm bg-surface appearance-none cursor-pointer"
            >
              {CATEGORIES_LIST.filter((c) => c.slug !== 'all').map((c) => (
                <option key={c.slug} value={c.slug} className="bg-surface text-white">
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">One-line description</label>
          <textarea
            rows={2}
            placeholder="What does your product do?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input text-sm resize-none"
          />
        </div>

        <div>
          <label className="label">Your Name or Twitter / X Handle</label>
          <input
            type="text"
            placeholder="@yourhandle"
            value={bidder}
            onChange={(e) => setBidder(e.target.value)}
            className="input text-sm"
          />
        </div>

        <div className="p-4 rounded-xl bg-surface-2 border border-white/[0.08]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">
              Bid Amount ($)
            </label>
            <span className="text-xs text-neutral-400 font-mono">Min: $5</span>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-coral-400 font-display font-bold text-lg">
              $
            </span>
            <input
              type="number"
              min={5}
              step={1}
              required
              value={amount}
              onChange={(e) => setAmount(Math.max(5, Number(e.target.value)))}
              className="input !pl-8 font-display font-bold text-xl text-coral-400"
            />
          </div>

          <div className="mt-3 flex items-center justify-between pt-3 border-t border-white/[0.06] text-sm">
            <span className="text-muted text-xs">Estimated placement:</span>
            <span className="font-display font-extrabold text-base text-coral-400">
              #{estimatedRank} {estimatedRank === 1 ? '👑 Top Spot!' : ''}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full btn-accent !py-3 !text-base !font-bold"
        >
          Claim Rank #{estimatedRank} for {formatBid(amount)} →
        </button>
      </form>
    </div>
  )
}
