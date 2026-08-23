import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useBidStore } from '../store/useBidStore'
import { formatBid } from '../lib/format'
import { calculateRank } from '../lib/rules'
import { createCheckoutSession, saveCompletedOrder, getPendingOrder } from '../lib/payment'
import { useUiStore } from '../store/useUiStore'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const pushToast = useUiStore((s) => s.push)
  const listings = useBidStore((s) => s.listings)
  const placeBid = useBidStore((s) => s.placeBid)

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
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 6314')
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

      // 2. If redirected to live Polar / Stripe gateway
      if (session.status === 'redirect' && session.checkoutUrl) {
        window.location.href = session.checkoutUrl
        return
      }

      // 3. Process direct secure payment and award rank
      const result = placeBid({
        listingId: queryListingId || undefined,
        url: url.trim(),
        title: title.trim() || url.replace(/^https?:\/\//, ''),
        description: description.trim(),
        categorySlug: category,
        amount: Number(amount),
        bidder: cardholderName.trim() || 'Anonymous',
      })

      // 4. Save completed order record
      saveCompletedOrder({
        id: 'ord_' + Date.now(),
        sessionId: session.sessionId,
        amount: Number(amount),
        email: email.trim(),
        url: url.trim(),
        title: title.trim() || url.replace(/^https?:\/\//, ''),
        description: description.trim(),
        categorySlug: category,
        rank: result.rank,
        createdAt: Date.now(),
      })

      pushToast(`Payment confirmed! Secured rank #${result.rank}.`, 'ok')
      navigate(`/checkout/success?session_id=${session.sessionId}&rank=${result.rank}&amount=${amount}`)
    } catch (err: any) {
      pushToast(err.message || 'Payment processing failed.', 'warn')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#f3f4f6] font-body selection:bg-coral-500 selection:text-white">
      {/* ── Top Minimal Nav ─────────────────────────────────────── */}
      <div className="border-b border-white/[0.06] bg-[#0b0c10]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex items-center justify-center h-6 w-6 rounded bg-coral-500 font-display font-black text-white text-sm">
            =
          </span>
          <span className="font-display font-bold text-base tracking-tight text-white group-hover:text-coral-400 transition-colors">
            bidboard<span className="text-coral-500">.app</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>256-bit Encrypted Checkout</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
          
          {/* ═══════════════════════════════════════════════════════════
              LEFT COLUMN: Product, Pricing, Rules & Policy
              ═══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 space-y-8 lg:pr-6">
            
            {/* Header / Org */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                <span className="w-5 h-5 rounded-full bg-coral-500 flex items-center justify-center text-[10px] text-white font-bold">
                  ⚡
                </span>
                <span>bidboard.app</span>
              </div>
              <h2 className="text-sm font-medium text-neutral-300">
                bidboard.app Rank
              </h2>
              <div className="font-display font-black text-5xl sm:text-6xl text-white mt-1 tracking-tight">
                {formatBid(amount)}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-2.5 py-4 border-y border-white/[0.08] text-sm">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Subtotal</span>
                <span className="font-mono text-white">{formatBid(amount)}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>Taxes</span>
                <span className="text-neutral-500">—</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-base font-bold text-white">
                <span>Total</span>
                <span className="font-mono font-black text-coral-400">{formatBid(amount)}</span>
              </div>
            </div>

            {/* Target Rank Placement Info */}
            <div className="p-4 rounded-xl bg-surface-2 border border-white/[0.08] flex items-center justify-between">
              <div className="text-xs text-neutral-300">
                <div className="font-bold text-white">Target Position:</div>
                <div className="text-neutral-400 mt-0.5">Claims position based on current bids</div>
              </div>
              <span className="font-display font-black text-xl px-3 py-1 rounded-lg bg-coral-500/20 text-coral-400 border border-coral-500/30">
                #{estimatedRank}
              </span>
            </div>

            {/* Rules Section (From Screenshot) */}
            <div className="space-y-6 text-xs text-neutral-400 leading-relaxed">
              <div>
                <h3 className="font-display font-bold text-base text-white mb-2">Rules</h3>
                <p>
                  Outbid is a public leaderboard. You pay to stand above everyone else. Rank is the bid — nothing else.
                </p>
              </div>

              <div>
                <h4 className="font-display font-bold text-sm text-white mb-2">How ranking works</h4>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Bids are whole US dollars.</li>
                  <li>Paying less than #1 still puts you on the board at whatever rank that bid can take.</li>
                  <li>
                    Enter the same website or @handle again to raise that listing. You only pay the difference from the current bid. Someone else cannot take your rank by paying that difference.
                  </li>
                  <li>
                    App Store, Play Store, GitHub, and similar platform links are keyed by their path, so different apps don't share a bid. Tracking query strings are ignored.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-display font-bold text-sm text-white mb-2">What you can list</h4>
                <ul className="space-y-2 list-disc list-inside">
                  <li>A product website, or an X @handle.</li>
                  <li>
                    Chat and invite links are not allowed — Telegram, WhatsApp, Discord, Messenger, Signal, and similar. The board is for products and profiles, not group chats.
                  </li>
                  <li>
                    Query parameters are stripped from listing links. Affiliate, referral, and tracking URLs will not work.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-display font-bold text-sm text-white mb-2">After you pay</h4>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Your listing is public. Clicks go to the URL or profile you submitted, without query parameters.</li>
                  <li>A completed payment is what claims the rank.</li>
                </ul>
              </div>

              <div>
                <h4 className="font-display font-bold text-sm text-white mb-2">Payment & Chargebacks</h4>
                <p className="space-y-2">
                  By completing this purchase, you confirm that you have reviewed the product and pricing and authorize the payment. If you have any issue with your purchase, please contact us at support@bidboard.app before initiating a payment dispute or chargeback.
                </p>
                <p className="mt-2 text-neutral-500">
                  Nothing in this policy limits any rights that cannot legally be excluded.
                </p>
              </div>
            </div>

          </div>

          {/* ═══════════════════════════════════════════════════════════
              RIGHT COLUMN: Payment Form (Matches Polar.sh UI)
              ═══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#13151c] border border-white/[0.08] shadow-2xl relative">
              
              <form onSubmit={handlePayment} className="space-y-5">
                
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0b0c10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-coral-500 transition-colors"
                  />
                </div>

                {/* Payment Method Selector Box */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Payment method
                  </label>

                  <div className="rounded-2xl border border-white/10 bg-[#0b0c10] overflow-hidden">
                    {/* Link 1-click Pay Card */}
                    <div
                      onClick={() => setPaymentMethod('link')}
                      className={`p-4 border-b border-white/[0.08] cursor-pointer flex items-center justify-between transition-colors ${
                        paymentMethod === 'link' ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="px-2 py-0.5 rounded bg-emerald-500 text-black font-black text-[11px]">
                          link
                        </div>
                        <span className="text-xs text-neutral-300 font-mono truncate max-w-[180px]">
                          {email}
                        </span>
                      </div>
                      <span className="text-neutral-500 text-xs">•••</span>
                    </div>

                    {/* Visa / Card Details */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="px-2 py-0.5 rounded bg-blue-600 font-black text-[10px] text-white tracking-widest uppercase">
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
                          Confirm
                        </button>
                      </div>

                      {paymentMethod === 'card' && (
                        <div className="pt-3 border-t border-white/[0.08] space-y-3 animate-fade-in">
                          <div>
                            <label className="text-[11px] text-neutral-400">Card number</label>
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                              placeholder="4242 •••• •••• 4242"
                              className="w-full bg-[#13151c] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none mt-1"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[11px] text-neutral-400">Expires</label>
                              <input
                                type="text"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                placeholder="MM/YY"
                                className="w-full bg-[#13151c] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] text-neutral-400">CVC</label>
                              <input
                                type="text"
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value)}
                                placeholder="CVC"
                                className="w-full bg-[#13151c] border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div
                        onClick={() => setPaymentMethod(paymentMethod === 'card' ? 'link' : 'card')}
                        className="text-xs text-neutral-400 hover:text-white flex items-center justify-between cursor-pointer pt-1"
                      >
                        <span>Change payment method</span>
                        <span>›</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cardholder name */}
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
                    className="w-full bg-[#0b0c10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-coral-500 transition-colors"
                  />
                </div>

                {/* Billing Address / Country */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Billing address
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#0b0c10] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none cursor-pointer focus:border-coral-500 transition-colors"
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
                    <option value="Other">Other country</option>
                  </select>
                </div>

                {/* Business checkbox */}
                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="business-check"
                    checked={isBusiness}
                    onChange={(e) => setIsBusiness(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-[#0b0c10] text-coral-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="business-check" className="text-xs text-neutral-300 cursor-pointer select-none">
                    I'm purchasing as a business
                  </label>
                </div>

                {/* Mandatory Non-Refundable Terms Checkbox (Matches Screenshot) */}
                <div className="flex items-start gap-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="terms-check"
                    required
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-white/20 bg-[#0b0c10] text-coral-500 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="terms-check" className="text-xs text-neutral-300 leading-relaxed cursor-pointer select-none">
                    I understand that placing a bid does not guarantee I get to the #1 if someone outbids me in the meantime and that bids are non-refundable if I am outbid as you will be listed in the ranking anyway.
                  </label>
                </div>

                {/* Pay Now Button (Solid White with Black Text matching Polar) */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full mt-4 py-3.5 px-6 rounded-full bg-white text-black font-display font-extrabold text-base hover:bg-neutral-200 active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing payment...' : 'Pay now'}
                </button>

                {/* Reseller Legal Disclosure */}
                <p className="text-[11px] text-neutral-500 text-center leading-normal pt-2">
                  By clicking "Pay now", you authorize Polar Software, Inc. / Bidboard, our online reseller and merchant of record, to charge your selected payment method the amount shown above, and agree to the <span className="underline">Buyer Terms</span>. This is a one-time charge.
                </p>

                {/* Powered by Polar Badge */}
                <div className="pt-4 flex items-center justify-center gap-1.5 text-xs text-neutral-500">
                  <span>Powered by</span>
                  <span className="font-semibold text-neutral-400 flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-neutral-600 inline-block" /> Polar
                  </span>
                </div>

              </form>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
