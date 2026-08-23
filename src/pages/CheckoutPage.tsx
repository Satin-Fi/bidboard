import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useBidStore } from '../store/useBidStore'
import { formatBid } from '../lib/format'
import { calculateRank } from '../lib/rules'
import { createCheckoutSession, getPendingOrder } from '../lib/payment'
import { useUiStore } from '../store/useUiStore'
import { 
  ArrowLeft, 
  Check, 
  Lock, 
  CreditCard, 
  ShieldCheck, 
  ChevronDown, 
  Zap
} from 'lucide-react'

export default function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const pushToast = useUiStore((s) => s.push)
  const listings = useBidStore((s) => s.listings)

  const pending = getPendingOrder()
  const queryUrl = searchParams.get('url') || pending?.url || ''
  const queryAmount = Number(searchParams.get('amount')) || pending?.amount || 25
  const queryTitle = searchParams.get('title') || pending?.title || ''
  const queryDesc = searchParams.get('desc') || pending?.description || ''
  const queryCategory = searchParams.get('category') || pending?.categorySlug || 'ai-automation'
  const queryListingId = searchParams.get('id') || pending?.listingId || ''

  const [url, setUrl] = useState(queryUrl)
  const [title, setTitle] = useState(queryTitle)
  const [description] = useState(queryDesc)
  const [category] = useState(queryCategory)
  const [amount] = useState(Math.max(1, queryAmount))
  const [email, setEmail] = useState('piyushkumarmj6@gmail.com')
  const [cardholderName, setCardholderName] = useState('Piyush Kumar')
  const [country, setCountry] = useState('India')
  const [isBusiness, setIsBusiness] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'link' | 'card'>('link')
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 6314')
  const [cardExpiry, setCardExpiry] = useState('12/28')
  const [cardCvc, setCardCvc] = useState('•••')
  const [isProcessing, setIsProcessing] = useState(false)

  const estimatedRank = calculateRank(listings, amount)

  useEffect(() => {
    if (!url && !queryUrl) {
      setUrl('https://myproduct.com')
      setTitle('My Awesome Product')
    }
  }, [url, queryUrl])

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !email.includes('@')) {
      pushToast('Please enter a valid email address.', 'warn')
      return
    }

    if (!acceptedTerms) {
      pushToast('Please acknowledge that bids are non-refundable to continue.', 'warn')
      return
    }

    setIsProcessing(true)

    try {
      // 1. Create checkout session
      const session = await createCheckoutSession(
        {
          url: url.trim(),
          title: title.trim() || url.replace(/^https?:\/\//, ''),
          description: description.trim(),
          categorySlug: category,
          amount: Number(amount),
          email: email.trim(),
          bidderName: cardholderName.trim() || 'Anonymous',
          isBusiness,
          listingId: queryListingId,
        },
        listings
      )

      // 2. Redirect to real Polar checkout gateway
      if (session.checkoutUrl) {
        window.location.href = session.checkoutUrl
        return
      }

      throw new Error('Polar checkout URL could not be generated.')
    } catch (err: any) {
      pushToast(err.message || 'Payment initialization failed. Please try again.', 'warn')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#f3f4f6] font-body selection:bg-coral-500 selection:text-white">
      {/* ── Minimal Top Header ────────────────────────────────────── */}
      <header className="border-b border-white/[0.06] bg-[#0b0c10]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors group font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>back to leaderboard</span>
          </Link>

          <Link to="/" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-coral-500" />
            <span className="font-display font-bold text-sm tracking-tight text-white">
              bidboard<span className="text-coral-500">.app</span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-500">
            <Lock className="w-3 h-3 text-neutral-400" />
            <span>SSL Secured</span>
          </div>
        </div>
      </header>

      {/* ── Main 2-Column Split ───────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* ═══════════════════════════════════════════════════════════
              LEFT COLUMN: Product Identity, Summary & Rules
              ═══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 space-y-8 lg:pr-4">
            
            {/* Merchant Identity & Product */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-coral-500/10 border border-coral-500/30 flex items-center justify-center text-coral-400">
                  <Zap className="w-4 h-4" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-[11px] font-mono font-semibold tracking-wider uppercase text-neutral-400">
                    bidboard.app
                  </div>
                  <h1 className="text-sm font-medium text-neutral-200">
                    Leaderboard Rank Claim
                  </h1>
                </div>
              </div>

              {/* Dynamic Huge Price */}
              <div className="font-display font-extrabold text-5xl sm:text-6xl text-white tracking-tight tabular-nums mt-3">
                {formatBid(amount)}
              </div>
            </div>

            {/* Price breakdown table */}
            <div className="py-4 border-y border-white/[0.08] space-y-2.5 text-sm">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Subtotal</span>
                <span className="font-mono text-white tabular-nums">{formatBid(amount)}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Taxes</span>
                <span className="font-mono text-neutral-500">—</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-base font-bold text-white">
                <span>Total due today</span>
                <span className="font-mono font-black text-coral-400 tabular-nums">{formatBid(amount)}</span>
              </div>
            </div>

            {/* Target Rank Live Status */}
            <div className="p-4 rounded-2xl bg-[#12141c] border border-white/[0.08] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Position Secured</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Calculated against current leaderboard bids
                </div>
              </div>
              <span className="font-display font-black text-lg px-3 py-1 rounded-xl bg-coral-500/10 text-coral-400 border border-coral-500/30 font-mono">
                #{estimatedRank}
              </span>
            </div>

            {/* Rules & Transparency (Refined Typography) */}
            <div className="space-y-6 text-xs text-neutral-400 leading-relaxed">
              <div>
                <h2 className="font-display font-bold text-sm text-neutral-200 mb-1.5">
                  Rules
                </h2>
                <p>
                  Bidboard is a public leaderboard. You pay to stand above everyone else. Rank is determined solely by the bid amount — nothing else.
                </p>
              </div>

              <div>
                <h3 className="font-display font-bold text-sm text-neutral-200 mb-2">
                  How ranking works
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-coral-500 mt-1.5 shrink-0" />
                    <span>Bids are whole US dollars. Minimum bid is $1.00.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-coral-500 mt-1.5 shrink-0" />
                    <span>Paying less than #1 still places you on the board at whatever rank that bid can take.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-coral-500 mt-1.5 shrink-0" />
                    <span>Enter the same website or @handle again to raise that listing. You only pay the difference from the current bid. Someone else cannot take your rank by paying that difference.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-coral-500 mt-1.5 shrink-0" />
                    <span>App Store, Play Store, GitHub, and similar platform links are keyed by their path, so different apps don't share a bid.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-display font-bold text-sm text-neutral-200 mb-2">
                  What you can list
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 mt-1.5 shrink-0" />
                    <span>A product website, SaaS, dev tool, or an X / Twitter @handle.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 mt-1.5 shrink-0" />
                    <span>Chat and invite links are not allowed (Telegram, WhatsApp, Discord, Signal). The board is for products, tools, and profiles.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 mt-1.5 shrink-0" />
                    <span>Query parameters are stripped from listing links. Clean root URLs are indexed.</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-display font-bold text-sm text-neutral-200 mb-2">
                  After you pay
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>Your listing is immediately public with direct outbound click tracking enabled.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>A completed payment is what officially claims the rank.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 border-t border-white/[0.06] text-[11px] text-neutral-500">
                <span className="font-semibold text-neutral-400">Payment & Chargebacks: </span>
                By completing this purchase, you confirm that you have reviewed the product and pricing and authorize the payment. Contact <span className="text-neutral-400">support@bidboard.app</span> for any billing queries.
              </div>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════════
              RIGHT COLUMN: Checkout Form (Polar / Stripe Style)
              ═══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#12141c] border border-white/[0.08] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] relative">
              
              <form onSubmit={handlePayment} className="space-y-5">
                
                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#090a0e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500/30 transition-all font-mono"
                  />
                </div>

                {/* Payment Method Container */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Payment method
                  </label>

                  <div className="rounded-2xl border border-white/10 bg-[#090a0e] overflow-hidden">
                    {/* Link 1-Click Pay */}
                    <div
                      onClick={() => setPaymentMethod('link')}
                      className={`p-3.5 border-b border-white/[0.08] cursor-pointer flex items-center justify-between transition-colors ${
                        paymentMethod === 'link' ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="px-2 py-0.5 rounded bg-[#00D66F] text-black font-black text-[11px] tracking-tight">
                          link
                        </div>
                        <span className="text-xs text-neutral-300 font-mono truncate max-w-[200px]">
                          {email}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono text-emerald-400 font-medium">1-click pay</span>
                        <span className={`w-2 h-2 rounded-full ${paymentMethod === 'link' ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
                      </div>
                    </div>

                    {/* Card Section */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="px-2 py-0.5 rounded bg-blue-600 text-white font-black text-[10px] tracking-widest uppercase">
                            VISA
                          </div>
                          <span className="text-xs font-medium text-white">
                            Visa Debit
                          </span>
                          <span className="text-xs text-neutral-400 font-mono">
                            •••• 6314
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod(paymentMethod === 'card' ? 'link' : 'card')}
                          className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                        >
                          {paymentMethod === 'card' ? 'Close' : 'Change method'}
                        </button>
                      </div>

                      {/* Expandable Manual Card Entry */}
                      {paymentMethod === 'card' && (
                        <div className="pt-3 border-t border-white/[0.08] space-y-3">
                          <div>
                            <label className="text-[11px] text-neutral-400 block mb-1">Card number</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                placeholder="4242 •••• •••• 4242"
                                className="w-full bg-[#12141c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-coral-500 font-mono"
                              />
                              <CreditCard className="w-4 h-4 text-neutral-500 absolute right-3 top-3 pointer-events-none" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="text-[11px] text-neutral-400 block mb-1">Expires</label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                placeholder="MM/YY"
                                className="w-full bg-[#12141c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-coral-500 font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-neutral-400 block mb-1">CVC</label>
                              <input
                                type="text"
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value)}
                                placeholder="CVC"
                                className="w-full bg-[#12141c] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-coral-500 font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Cardholder name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full name on card"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    className="w-full bg-[#090a0e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 outline-none focus:border-coral-500 focus:ring-1 focus:ring-coral-500/30 transition-all"
                  />
                </div>

                {/* Billing Country */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Billing country
                  </label>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full appearance-none bg-[#090a0e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none cursor-pointer focus:border-coral-500 transition-all pr-10"
                    >
                      <option value="United States">United States</option>
                      <option value="India">India</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Canada">Canada</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                      <option value="Australia">Australia</option>
                      <option value="Japan">Japan</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Other">Other Country</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Business Purchase Checkbox */}
                <div 
                  onClick={() => setIsBusiness(!isBusiness)}
                  className="flex items-center gap-3 pt-1 cursor-pointer select-none"
                >
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                    isBusiness ? 'bg-coral-500 border-coral-500 text-white' : 'border-white/20 bg-[#090a0e]'
                  }`}>
                    {isBusiness && <Check className="w-3 h-3" strokeWidth={3} />}
                  </div>
                  <span className="text-xs text-neutral-300">
                    I'm purchasing as a business
                  </span>
                </div>

                {/* Mandatory Non-Refundable Terms Checkbox */}
                <div 
                  onClick={() => setAcceptedTerms(!acceptedTerms)}
                  className="flex items-start gap-3 pt-2 cursor-pointer select-none"
                >
                  <div className={`w-4 h-4 mt-0.5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    acceptedTerms ? 'bg-coral-500 border-coral-500 text-white' : 'border-white/20 bg-[#090a0e]'
                  }`}>
                    {acceptedTerms && <Check className="w-3 h-3" strokeWidth={3} />}
                  </div>
                  <span className="text-xs text-neutral-300 leading-relaxed">
                    I understand that placing a bid does not guarantee I remain at #1 if someone outbids me later, and that bids are non-refundable as the product is listed in the ranking.
                  </span>
                </div>

                {/* Pay Now Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-3 py-3.5 px-6 rounded-full bg-white text-black font-display font-extrabold text-sm hover:bg-neutral-100 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isProcessing ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span>Pay {formatBid(amount)}</span>
                  )}
                </button>

                {/* Reseller Legal Disclosure */}
                <p className="text-[11px] text-neutral-500 text-center leading-normal pt-1">
                  By clicking "Pay", you authorize Polar Software, Inc. / Bidboard, our merchant of record, to charge the amount shown above.
                </p>

                {/* Clean Merchant of Record Badge */}
                <div className="pt-2 flex items-center justify-center gap-1.5 text-xs text-neutral-500 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Powered by Polar & Stripe</span>
                </div>

              </form>

            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
