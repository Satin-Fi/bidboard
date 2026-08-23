// Vercel Serverless Function: /api/checkout
// Creates live Polar.sh checkout session for a pay-to-rank bid
export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json({ live: true, gateway: 'polar' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const {
      url,
      title,
      description,
      categorySlug,
      amount,
      email,
      bidderName,
      isBusiness,
      listingId,
      estimatedRank,
    } = req.body || {}

    if (!url || !amount || Number(amount) < 1) {
      return res.status(400).json({ error: 'Valid URL and bid amount ($1+) are required.' })
    }

    const polarToken = process.env.POLAR_ACCESS_TOKEN || 'polar_oat_RnrOdhcKt4GMXOU8lOHRxRUli8J21S0Y2oFxt3EQibq'
    const polarProductId = process.env.POLAR_PRODUCT_ID || 'd567eea3-5fb2-47c6-b9af-1839205e9eb8'
    const polarBaseUrl = process.env.POLAR_API_URL || 'https://sandbox-api.polar.sh/v1'

    const origin = req.headers.origin || req.headers.referer || 'https://bidboard-eight.vercel.app'
    const cleanOrigin = origin.replace(/\/$/, '')
    const successUrl = `${cleanOrigin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&rank=${estimatedRank || 1}&amount=${amount}&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title || '')}`

    // Polar metadata validation: strings must not be empty
    const rawMeta: Record<string, any> = {
      url,
      title: title || url.replace(/^https?:\/\//, ''),
      description: description || undefined,
      categorySlug: categorySlug || 'ai-automation',
      bidderName: bidderName || 'Anonymous',
      isBusiness: isBusiness ? 'true' : undefined,
      listingId: listingId || undefined,
      targetRank: String(estimatedRank || 1),
    }

    const cleanMeta: Record<string, string> = {}
    for (const [k, v] of Object.entries(rawMeta)) {
      if (v !== undefined && v !== null && String(v).trim() !== '') {
        cleanMeta[k] = String(v).trim()
      }
    }

    const payload: any = {
      product_id: polarProductId,
      amount: Math.round(Number(amount) * 100), // in cents
      currency: 'usd',
      success_url: successUrl,
      metadata: cleanMeta,
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
      console.warn('Polar checkout error response:', polarResponse.status, errText)
      return res.status(polarResponse.status).json({
        error: 'Failed to create Polar checkout session',
        details: errText,
      })
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
