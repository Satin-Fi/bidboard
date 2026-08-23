import { useState, useEffect, useCallback } from 'react'
import { useBidStore } from '../store/useBidStore'
import { calculateRank } from '../lib/rules'
import { formatBid, cleanUrl } from '../lib/format'
import { useUiStore } from '../store/useUiStore'
import { createCheckoutSession } from '../lib/payment'
import CategorySelect from './CategorySelect'
import { X, Globe, Trophy } from 'lucide-react'

export default function OutbidModal() {
  const modal = useBidStore((s) => s.modal)
  const closeModal = useBidStore((s) => s.closeModal)
  const listings = useBidStore((s) => s.listings)
  const pushToast = useUiStore((s) => s.push)

  const topListing = listings[0]
  const defaultMinBid = modal.targetListing
    ? modal.targetListing.currentBid + 1
    : topListing
      ? topListing.currentBid + 1
      : 1

  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('ai-automation')
  const [amount, setAmount] = useState(defaultMinBid)
  const [bidder, setBidder] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modal.open) {
        closeModal()
      }
    },
    [modal.open, closeModal]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (modal.open) {
      const initialAmt = modal.initialAmount || defaultMinBid
      setAmount(Math.max(1, initialAmt))
      setUrl(modal.initialUrl || '')
      setTitle(modal.targetListing?.title || '')
      setDescription(modal.targetListing?.description || '')
      setCategory(modal.categorySlug && modal.categorySlug !== 'all' ? modal.categorySlug : 'ai-automation')
    }
  }, [modal.open, modal.targetListing, modal.initialUrl, modal.initialAmount, modal.categorySlug, defaultMinBid])

  if (!modal.open) return null

  const estimatedRank = calculateRank(listings, amount)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) {
      pushToast('Please enter a valid website URL or @handle.', 'warn')
      return
    }
    if (amount < 1) {
      pushToast('Minimum bid is $1.', 'warn')
      return
    }

    setIsSubmitting(true)
    try {
      createCheckoutSession(
        {
          url: url.trim(),
          title: title.trim() || cleanUrl(url),
          description: description.trim(),
          categorySlug: category,
          amount: Number(amount),
          email: '',
          bidderName: bidder.trim(),
          listingId: modal.targetListing?.id,
        },
        listings
      ).then((session) => {
        closeModal()
        if (session.status === 'redirect' && session.checkoutUrl) {
          window.location.href = session.checkoutUrl
        } else {
          const params = new URLSearchParams({
            url: url.trim(),
            amount: String(amount),
            title: title.trim() || cleanUrl(url),
            desc: description.trim(),
            category,
            id: modal.targetListing?.id || '',
          })
          window.location.href = `/checkout?${params.toString()}`
        }
      })
    } catch {
      pushToast('Could not process checkout.', 'warn')
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={closeModal}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-surface border border-white/10 shadow-2xl p-6 sm:p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -right-16 -top-16 w-36 h-36 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-coral-400">
              {modal.targetListing ? `Outbid #${modal.targetListing.rank}` : 'Public Attention Marketplace'}
            </span>
            <h2 className="font-display text-2xl font-bold text-white mt-0.5">
              {modal.targetListing ? `Outbid ${modal.targetListing.title}` : 'Claim Your Leaderboard Rank'}
            </h2>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Your Website URL or @handle</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500">
                <Globe className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                placeholder="https://yourproduct.com or @handle"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  if (!title) {
                    const cleaned = cleanUrl(e.target.value)
                    const parts = cleaned.split('.')
                    if (parts.length > 0 && parts[0]) setTitle(parts[0])
                  }
                }}
                className="input text-sm !pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Product Title</label>
              <input
                type="text"
                placeholder="Product name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="label">Category</label>
              <CategorySelect
                value={category}
                onChange={setCategory}
                className="w-full"
                placeholder="Select category"
                dropdownAlign="full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="label">Your Name or Twitter / X</label>
              <input
                type="text"
                placeholder="@username (optional)"
                value={bidder}
                onChange={(e) => setBidder(e.target.value)}
                className="input text-sm"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-2 border border-white/[0.08]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Your Bid Amount ($)
              </label>
              <span className="text-xs text-neutral-400 font-mono">
                Min: $1 {topListing ? `· #1 Price: ${formatBid(topListing.currentBid)}` : '· First Spot'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-coral-400 font-display font-bold text-lg">
                  $
                </span>
                <input
                  type="number"
                  min={1}
                  step={1}
                  required
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                  className="input !pl-8 font-display font-bold text-xl text-coral-400 font-mono"
                />
              </div>

              <div className="flex gap-1.5">
                {[1, 5, 10, 25].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => setAmount((prev) => prev + inc)}
                    className="px-2.5 py-2 text-xs font-mono font-medium rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
                  >
                    +{inc}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between pt-3 border-t border-white/[0.06] text-sm">
              <span className="text-neutral-400 text-xs">Estimated placement:</span>
              <div className="flex items-center gap-2">
                <span
                  className={`font-display font-extrabold text-sm px-2.5 py-0.5 rounded-md inline-flex items-center gap-1 font-mono ${
                    estimatedRank === 1
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : estimatedRank <= 3
                        ? 'bg-coral-500/20 text-coral-300 border border-coral-500/30'
                        : 'bg-white/5 text-neutral-300'
                  }`}
                >
                  {estimatedRank === 1 && <Trophy className="w-3.5 h-3.5" />}
                  #{estimatedRank}
                </span>
                <span className="text-xs text-neutral-400">
                  {estimatedRank === 1 ? 'Top Spot (#1)' : `Outbids ${Math.max(0, listings.length - estimatedRank + 1)} spots`}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-accent !py-3 !text-base !font-bold flex items-center justify-center shadow-lg shadow-coral-500/20"
            >
              {isSubmitting ? 'Securing spot...' : `Claim #${estimatedRank} for ${formatBid(amount)} →`}
            </button>
            <p className="text-center text-[11px] text-neutral-500 mt-2">
              Rank is updated instantly in real time. Higher bids claim higher positions.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
