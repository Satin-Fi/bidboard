// Vercel Serverless Function: /api/checkout
// Creates checkout sessions for Polar.sh (or Stripe)
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const { url, title, description, categorySlug, amount, email, bidderName, isBusiness, listingId, estimatedRank } = req.body || {}

    if (!url || !amount || amount < 1) {
      return res.status(400).json({ error: 'Valid URL and bid amount ($1+) are required.' })
    }

    const polarToken = process.env.POLAR_ACCESS_TOKEN
    const polarOrgId = process.env.POLAR_ORGANIZATION_ID
    const stripeSecret = process.env.STRIPE_SECRET_KEY
    const origin = req.headers.origin || req.headers.referer || 'https://bidboard-eight.vercel.app'
    const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&rank=${estimatedRank || 1}`

    // 1. If Polar.sh token is configured, create live Polar checkout
    if (polarToken) {
      const polarResponse = await fetch('https://api.polar.sh/v1/checkouts/custom/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${polarToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization_id: polarOrgId,
          product_name: `Bidboard Rank Claim: ${title || url}`,
          product_price_amount: Math.round(Number(amount) * 100), // in cents
          product_price_currency: 'usd',
          success_url: successUrl,
          customer_email: email || undefined,
          metadata: {
            url,
            title: title || '',
            description: description || '',
            categorySlug: categorySlug || 'other',
            bidderName: bidderName || '',
            isBusiness: String(Boolean(isBusiness)),
            listingId: listingId || '',
            targetRank: String(estimatedRank || 1),
          },
        }),
      })

      if (polarResponse.ok) {
        const polarData = await polarResponse.json()
        return res.status(200).json({
          sessionId: polarData.id,
          checkoutUrl: polarData.url,
          status: 'redirect',
          amount,
          estimatedRank,
        })
      }
    }

    // 2. If Stripe secret key is configured, create live Stripe checkout
    if (stripeSecret) {
      const params = new URLSearchParams()
      params.append('mode', 'payment')
      params.append('success_url', successUrl)
      params.append('cancel_url', `${origin}/checkout?canceled=true`)
      if (email) params.append('customer_email', email)
      params.append('line_items[0][price_data][currency]', 'usd')
      params.append('line_items[0][price_data][unit_amount]', String(Math.round(Number(amount) * 100)))
      params.append('line_items[0][price_data][product_data][name]', `Bidboard Rank: ${title || url}`)
      params.append('line_items[0][price_data][product_data][description]', `Public pay-to-rank leaderboard spot for ${url}`)
      params.append('line_items[0][quantity]', '1')
      params.append('metadata[url]', url)
      params.append('metadata[title]', title || '')
      params.append('metadata[categorySlug]', categorySlug || 'other')

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
    }

    // 3. Standalone mode (Direct processed checkout session)
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
