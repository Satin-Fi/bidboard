import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useBidStore } from '../store/useBidStore'
import { formatBid } from '../lib/format'
import { getPendingOrder, saveCompletedOrder } from '../lib/payment'

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id') || 'polar_c_' + Date.now()
  const paramRank = searchParams.get('rank')
  const paramAmount = searchParams.get('amount')

  const placeBid = useBidStore((s) => s.placeBid)
  const [finalRank, setFinalRank] = useState<number>(Number(paramRank) || 1)
  const [amountPaid, setAmountPaid] = useState<number>(Number(paramAmount) || 25)
  const [productTitle, setProductTitle] = useState<string>('Your Product')
  const [productUrl, setProductUrl] = useState<string>('https://yourproduct.com')

  useEffect(() => {
    const pending = getPendingOrder()
    if (pending) {
      setProductTitle(pending.title || pending.url)
      setProductUrl(pending.url)
      setAmountPaid(pending.amount)

      // Ensure rank is placed in store
      const result = placeBid({
        listingId: pending.listingId,
        url: pending.url,
        title: pending.title,
        description: pending.description,
        categorySlug: pending.categorySlug,
        amount: pending.amount,
        bidder: pending.bidderName,
      })

      setFinalRank(result.rank)

      saveCompletedOrder({
        id: 'ord_' + Date.now(),
        sessionId,
        amount: pending.amount,
        email: pending.email || 'customer@example.com',
        url: pending.url,
        title: pending.title || pending.url,
        description: pending.description || '',
        categorySlug: pending.categorySlug,
        rank: result.rank,
        createdAt: Date.now(),
      })
    }
  }, [sessionId, placeBid])

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white flex flex-col items-center justify-center p-4">
      {/* Glow highlight */}
      <div className="w-72 h-72 bg-coral-500/20 rounded-full blur-3xl absolute pointer-events-none -top-10" />

      <div className="max-w-lg w-full p-8 sm:p-10 rounded-3xl bg-[#13151c] border border-white/10 shadow-2xl text-center relative z-10">
        
        {/* Animated Success Badge */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-emerald-500/20 animate-bounce">
          ✓
        </div>

        <span className="text-xs font-mono font-bold uppercase tracking-wider text-coral-400">
          Payment Confirmed
        </span>

        <h1 className="font-display font-black text-3xl sm:text-4xl text-white mt-1">
          Spot Claimed!
        </h1>

        <p className="text-sm text-neutral-400 mt-2">
          Your payment of <span className="text-white font-bold">{formatBid(amountPaid)}</span> was successful and your spot is now active on the public leaderboard.
        </p>

        {/* Secured Rank Box */}
        <div className="my-6 p-5 rounded-2xl bg-surface-2 border border-white/[0.08] flex items-center justify-between">
          <div className="text-left">
            <div className="text-xs text-neutral-400">Current Position</div>
            <div className="font-display font-bold text-lg text-white mt-0.5">
              {productTitle}
            </div>
            <a
              href={productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-coral-400 hover:underline"
            >
              {productUrl.replace(/^https?:\/\//, '')} ↗
            </a>
          </div>

          <div className="text-right">
            <span className="font-display font-black text-3xl px-3.5 py-1 rounded-xl bg-coral-500 text-white shadow-md shadow-coral-500/30">
              #{finalRank}
            </span>
          </div>
        </div>

        {/* Info list */}
        <div className="text-xs text-neutral-400 text-left space-y-2 py-4 border-t border-white/[0.08]">
          <div className="flex justify-between">
            <span>Transaction ID</span>
            <span className="font-mono text-neutral-300 text-[11px] truncate max-w-[200px]">
              {sessionId}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span className="text-emerald-400 font-semibold">Live & Active</span>
          </div>
          <div className="flex justify-between">
            <span>Direct Outbound Link</span>
            <span className="text-neutral-300">Enabled (Tracking active)</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-8 space-y-3">
          <Link
            to="/"
            className="w-full btn-accent !py-3.5 !text-sm !font-bold flex items-center justify-center gap-2"
          >
            View Leaderboard →
          </Link>

          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              `We just claimed rank #${finalRank} on the @bidboard pay-to-rank leaderboard with ${productTitle}! Check it out:`
            )}&url=${encodeURIComponent('https://bidboard-eight.vercel.app')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 hover:text-white flex items-center justify-center gap-2 transition-colors"
          >
            Share Rank on 𝕏 (Twitter)
          </a>
        </div>

      </div>
    </div>
  )
}
