// Vercel Serverless Function: /api/checkout
// Creates a live Polar.sh checkout session for a pay-to-rank bid.
//
// SECURITY: the Polar access token MUST come from an env var (POLAR_ACCESS_TOKEN).
// A previously-committed token was leaked and has been removed — rotate it in Polar
// and scrub git history (git filter-repo / BFG) before relying on this in production.
import { saveBid } from './_store'

interface BidMeta {
  url: string
  title: string
  description: string
  categorySlug: string
  bidderName: string
  isBusiness: boolean
  listingId: string
  targetRank: number
}

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const live = Boolean(process.env.POLAR_ACCESS_TOKEN || process.env.STRIPE_SECRET_KEY)
    return res.status(200).json({ live, gateway: live ? (process.env.POLAR_ACCESS_TOKEN ? 'polar' : 'stripe') : 'none' })
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  try {
    const {
      url, title, description, categorySlug, amount, email, bidderName, isBusiness, listingId, estimatedRank,
    } = req.body || {}

    if (!url || !amount || amount < 1) {
      return res.status(400).json({ error: 'Valid URL and bid amount ($1+) are required.' })
    }

    const polarToken = process.env.POLAR_ACCESS_TOKEN
    const polarOrgId = process.env.POLAR_ORGANIZATION_ID
    const polarProductId = process.env.POLAR_PRODUCT_ID
    const stripeSecret = process.env.STRIPE_SECRET_KEY

    const origin = (req.headers.origin || req.headers.referer || 'https://bidboard-eight.vercel.app').replace(/\/$/, '')
    const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&rank=${estimatedRank || 1}&amount=${amount}&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title || '')}`
    const meta: BidMeta = {
      url, title: title || '', description: description || '', categorySlug: categorySlug || 'ai-automation',
      bidderName: bidderName || '', isBusiness: Boolean(isBusiness), listingId: listingId || '', targetRank: estimatedRank || 1,
    }

    // ── Polar.sh (primary) ──────────────────────────────────────────────
    if (polarToken && polarProductId) {
      const isSandbox = polarToken.includes('sandbox') || !!process.env.POLAR_API_URL?.includes('sandbox')
      const base = process.env.POLAR_API_URL || (isSandbox ? 'https://sandbox-api.polar.sh/v1' : 'https://api.polar.sh/v1')

      // Polar custom checkout charges a fixed product price. To charge the EXACT bid
      // amount we create a one-off price on the product, then checkout with that price.
      try {
        const priceBody: any = {
          product_id: polarProductId,
          amount_type: 'fixed',
          price_amount: Math.round(Number(amount) * 100),
          currency: 'usd',
        }
        if (polarOrgId) priceBody.organization_id = polarOrgId
        const priceRes = await fetch(`${base}/prices/`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${polarToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(priceBody),
        })
        if (!priceRes.ok) {
          const t = await priceRes.text()
          console.warn('Polar price creation failed:', priceRes.status, t)
        } else {
          const price = await priceRes.json()
          const coBody: any = {
            products: [{ product_price_id: price.id, quantity: 1 }],
            success_url: successUrl,
            customer_email: email?.includes('@') ? email.trim() : undefined,
            metadata: { ...meta, sessionPriceId: price.id },
          }
          if (polarOrgId) coBody.organization_id = polarOrgId
          const coRes = await fetch(`${base}/checkouts/custom/`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${polarToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(coBody),
          })
          if (coRes.ok) {
            const data = await coRes.json()
            // Record intent so the webhook can confirm later.
            await saveBid({
              id: 'rank-' + Date.now(), url: meta.url, title: meta.title, description: meta.description,
              categorySlug: meta.categorySlug, amount: Number(amount), bidder: meta.bidderName,
              isBusiness: meta.isBusiness, rank: meta.targetRank, sessionId: data.id || data.client_secret,
              status: 'pending', createdAt: Date.now(),
            })
            return res.status(200).json({
              sessionId: data.id || data.client_secret,
              checkoutUrl: data.url,
              status: 'redirect',
              amount,
              estimatedRank,
            })
          } else {
            console.warn('Polar checkout failed:', coRes.status, await coRes.text())
          }
        }
      } catch (e) {
        console.error('Polar error:', e)
      }
    }

    // ── Stripe (secondary) ──────────────────────────────────────────────
    if (stripeSecret) {
      try {
        const params = new URLSearchParams()
        params.append('mode', 'payment')
        params.append('success_url', successUrl)
        params.append('cancel_url', `${origin}/checkout?canceled=true`)
        if (email?.includes('@')) params.append('customer_email', email)
        params.append('line_items[0][price_data][currency]', 'usd')
        params.append('line_items[0][price_data][unit_amount]', String(Math.round(Number(amount) * 100)))
        params.append('line_items[0][price_data][product_data][name]', `Bidboard Rank: ${title || url}`)
        params.append('line_items[0][quantity]', '1')
        params.append('metadata[url]', url)
        params.append('metadata[rank]', String(estimatedRank || 1))
        const sRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${stripeSecret}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        })
        if (sRes.ok) {
          const data = await sRes.json()
          return res.status(200).json({ sessionId: data.id, checkoutUrl: data.url, status: 'redirect', amount, estimatedRank })
        }
      } catch (e) {
        console.error('Stripe error:', e)
      }
    }

    // ── No gateway configured: be honest, do NOT fake a charge ───────────
    return res.status(200).json({ status: 'demo', amount, estimatedRank, message: 'No payment gateway configured. Set POLAR_ACCESS_TOKEN to go live.' })
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
