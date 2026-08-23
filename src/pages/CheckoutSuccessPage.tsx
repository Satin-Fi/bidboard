import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useBidStore } from '../store/useBidStore'
import { formatBid } from '../lib/format'
import { getPendingOrder, saveCompletedOrder } from '../lib/payment'
import { Check, ArrowRight, ExternalLink, Share2, AlertCircle, Loader2 } from 'lucide-react'

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id') || ''
  const paramRank = searchParams.get('rank')
  const paramAmount = searchParams.get('amount')
  const paramUrl = searchParams.get('url')
  const paramTitle = searchParams.get('title')

  const fetchLeaderboard = useBidStore((s) => s.fetchLeaderboard)
  const [finalRank, setFinalRank] = useState<number>(Number(paramRank) || 1)
  const [amountPaid, setAmountPaid] = useState<number>(Number(paramAmount) || 25)
  const [productTitle, setProductTitle] = useState<string>(paramTitle || 'Your Product')
  const [productUrl, setProductUrl] = useState<string>(paramUrl || 'https://yourproduct.com')
  const [isVerifying, setIsVerifying] = useState<boolean>(true)
  const [verified, setVerified] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const pending = getPendingOrder()
    if (pending) {
      setProductTitle(pending.title || pending.url)
      setProductUrl(pending.url)
      setAmountPaid(pending.amount)
    }

    if (!sessionId) {
      setIsVerifying(false)
      setVerified(false)
      setErrorMessage('No checkout session ID provided.')
      return
    }

    // Real server-side verification with Polar API
    fetch(`/api/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((d) => {
        setIsVerifying(false)
        if (d.valid) {
          setVerified(true)
          if (d.rank) setFinalRank(d.rank)
          if (d.amount) setAmountPaid(d.amount)
          if (d.listing?.title) setProductTitle(d.listing.title)
          if (d.listing?.url) setProductUrl(d.listing.url)

          // Save completed order record
          saveCompletedOrder({
            id: 'ord_' + Date.now(),
            sessionId,
            amount: d.amount || amountPaid,
            email: d.listing?.email || pending?.email || 'customer@example.com',
            url: d.listing?.url || productUrl,
            title: d.listing?.title || productTitle,
            description: d.listing?.description || '',
            categorySlug: d.listing?.categorySlug || 'ai-automation',
            rank: d.rank || finalRank,
            createdAt: Date.now(),
          })

          // Sync full leaderboard from persistent server database
          fetchLeaderboard()
        } else {
          setVerified(false)
          setErrorMessage(d.error || 'Payment not verified by Polar gateway.')
        }
      })
      .catch((err) => {
        setIsVerifying(false)
        setVerified(false)
        setErrorMessage(err.message || 'Unable to connect to verification server.')
      })
  }, [sessionId, fetchLeaderboard])

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#f3f4f6] font-body flex flex-col items-center justify-center p-4 selection:bg-coral-500 selection:text-white">
      {/* Subtle ambient glow */}
      <div className="w-80 h-80 bg-coral-500/10 rounded-full blur-3xl absolute pointer-events-none -top-10" />

      <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-[#12141c] border border-white/[0.08] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] text-center relative z-10">
        
        {isVerifying ? (
          <div className="py-8 space-y-4">
            <Loader2 className="w-10 h-10 text-coral-500 animate-spin mx-auto" />
            <h1 className="font-display font-bold text-xl text-white">
              Verifying Payment with Polar...
            </h1>
            <p className="text-xs text-neutral-400 font-mono">
              Checking session token {sessionId.slice(0, 16)}...
            </p>
          </div>
        ) : verified ? (
          <>
            {/* Success Badge */}
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Check className="w-7 h-7" strokeWidth={2.5} />
            </div>

            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-coral-400">
              Payment Confirmed & Verified
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl text-white mt-1 tracking-tight">
              Rank #{finalRank} Secured!
            </h1>

            <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
              Your payment of <span className="text-white font-mono font-bold">{formatBid(amountPaid)}</span> was verified on the Polar gateway. Your listing is live on the public leaderboard.
            </p>

            {/* Claimed Spot Summary Card */}
            <div className="my-6 p-4 rounded-2xl bg-[#090a0e] border border-white/[0.08] flex items-center justify-between text-left">
              <div className="space-y-0.5 truncate pr-3">
                <div className="text-[10px] font-mono text-neutral-500 uppercase">Live Rank</div>
                <div className="font-display font-bold text-base text-white truncate">
                  {productTitle}
                </div>
                <a
                  href={productUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-coral-400 hover:underline inline-flex items-center gap-1 font-mono"
                >
                  <span>{productUrl.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="shrink-0">
                <span className="font-display font-black text-2xl px-3 py-1 rounded-xl bg-coral-500 text-white shadow-md shadow-coral-500/20 font-mono">
                  #{finalRank}
                </span>
              </div>
            </div>

            {/* Meta Info */}
            <div className="text-xs text-neutral-400 text-left space-y-2 py-3 border-t border-white/[0.06] font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">Transaction ID</span>
                <span className="text-neutral-300 truncate max-w-[180px]">{sessionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Status</span>
                <span className="text-emerald-400 font-semibold">Verified on Polar</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2.5">
              <Link
                to="/"
                className="w-full py-3.5 px-6 rounded-full bg-white text-black font-display font-extrabold text-sm hover:bg-neutral-100 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span>View on Leaderboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  `We just claimed rank #${finalRank} on the @bidboard pay-to-rank leaderboard with ${productTitle}! Check it out:`
                )}&url=${encodeURIComponent('https://bidboard-eight.vercel.app')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-xs font-semibold text-neutral-300 hover:text-white flex items-center justify-center gap-2 transition-colors border border-white/[0.06]"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share on 𝕏 (Twitter)</span>
              </a>
            </div>
          </>
        ) : (
          <div className="py-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-7 h-7" strokeWidth={2.5} />
            </div>

            <h1 className="font-display font-bold text-2xl text-white">
              Payment Not Confirmed
            </h1>

            <p className="text-xs text-neutral-400 leading-relaxed">
              {errorMessage || 'The payment session was not confirmed on Polar. If you just completed payment, it may take a few seconds to process.'}
            </p>

            <div className="pt-4 space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 px-4 rounded-xl bg-coral-500 hover:bg-coral-600 text-white font-semibold text-xs transition-colors"
              >
                Retry Verification
              </button>

              <Link
                to="/checkout"
                className="block w-full py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 font-semibold text-xs transition-colors"
              >
                Return to Checkout
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
