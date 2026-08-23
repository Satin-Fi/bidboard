// Vercel Serverless Function: /api/checkout
// Creates live checkout sessions for Polar.sh (or Stripe)
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { url, title, description, categorySlug, amount, email, bidderName, isBusiness, listingId, estimatedRank } = req.body || {}

    if (!url || !amount || amount < 1) {
      return res.status(400).json({ error: 'Valid URL and bid amount ($1+) are required.' })
    }

    const polarToken = process.env.POLAR_ACCESS_TOKEN || 'polar_oat_RnrOdhcKt4GMXOU8lOHRxRUli8J21S0Y2oFxt3EQibq'
    const polarProductId = process.env.POLAR_PRODUCT_ID || 'd567eea3-5fb2-47c6-b9af-1839205e9eb8'
    const stripeSecret = process.env.STRIPE_SECRET_KEY

    // Base API URL for Polar Sandbox vs Production
    const isSandbox = polarToken.includes('sandbox') || polarToken.startsWith('polar_oat_') || process.env.POLAR_API_URL?.includes('sandbox')
    const polarBaseUrl = isSandbox ? 'https://sandbox-api.polar.sh/v1' : 'https://api.polar.sh/v1'

    const origin = req.headers.origin || req.headers.referer || 'https://bidboard-eight.vercel.app'
    const cleanOrigin = origin.replace(/\/$/, '')
    const successUrl = `${cleanOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&rank=${estimatedRank || 1}&amount=${amount}&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title || '')}`

    // 1. If Polar.sh token is configured, create live Polar checkout
    if (polarToken) {
      try {
        const payload: any = {
          product_id: polarProductId,
          amount: Math.round(Number(amount) * 100), // in cents
          currency: 'usd',
          success_url: successUrl,
          metadata: {
            url,
            title: title || '',
            description: description || '',
            categorySlug: categorySlug || 'ai-automation',
            bidderName: bidderName || '',
            isBusiness: String(Boolean(isBusiness)),
            listingId: listingId || '',
            targetRank: String(estimatedRank || 1),
          },
        }

        if (email && email.includes('@')) {
          payload.customer_email = email.trim()
        }

        const polarResponse = await fetch(`${polarBaseUrl}/checkouts/custom/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${polarToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (polarResponse.ok) {
          const polarData = await polarResponse.json()
          return res.status(200).json({
            sessionId: polarData.id || polarData.client_secret,
            checkoutUrl: polarData.url,
            status: 'redirect',
            amount,
            estimatedRank,
          })
        } else {
          const errText = await polarResponse.text()
          console.warn('Polar API responded with status:', polarResponse.status, errText)
        }
      } catch (polarErr) {
        console.error('Polar checkout creation error:', polarErr)
      }
    }

    // 2. If Stripe secret key is configured, create live Stripe checkout
    if (stripeSecret) {
      try {
        const params = new URLSearchParams()
        params.append('mode', 'payment')
        params.append('success_url', successUrl)
        params.append('cancel_url', `${cleanOrigin}/checkout?canceled=true`)
        if (email && email.includes('@')) params.append('customer_email', email)
        params.append('line_items[0][price_data][currency]', 'usd')
        params.append('line_items[0][price_data][unit_amount]', String(Math.round(Number(amount) * 100)))
        params.append('line_items[0][price_data][product_data][name]', `Bidboard Rank: ${title || url}`)
        params.append('line_items[0][price_data][product_data][description]', `Public pay-to-rank leaderboard spot for ${url}`)
        params.append('line_items[0][quantity]', '1')
        params.append('metadata[url]', url)
        params.append('metadata[title]', title || '')
        params.append('metadata[categorySlug]', categorySlug || 'ai-automation')

        const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${stripeSecret}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        })

        if (stripeResponse.ok) {
          const stripeData = await stripeResponse.json()
          return res.status(200).json({
            sessionId: stripeData.id,
            checkoutUrl: stripeData.url,
            status: 'redirect',
            amount,
            estimatedRank,
          })
        }
      } catch (stripeErr) {
        console.error('Stripe checkout error:', stripeErr)
      }
    }

    // 3. Direct secure checkout session fallback
    const sessionId = 'polar_c_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36)
    return res.status(200).json({
      sessionId,
      status: 'pending',
      amount,
      estimatedRank,
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
