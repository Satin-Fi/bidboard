import { recordVerifiedPaymentAndRank } from './_db.js'

export default async function handler(req: any, res: any) {
  const sessionId = (req.query?.session_id || req.body?.session_id) as string

  if (!sessionId) {
    return res.status(400).json({ valid: false, error: 'session_id is required' })
  }

  const polarToken = process.env.POLAR_ACCESS_TOKEN || 'polar_oat_RnrOdhcKt4GMXOU8lOHRxRUli8J21S0Y2oFxt3EQibq'
  const polarBaseUrl = process.env.POLAR_API_URL || 'https://sandbox-api.polar.sh/v1'

  try {
    // 1. Fetch checkout session directly from Polar API
    let checkoutData: any = null
    let polarRes = await fetch(`${polarBaseUrl}/checkouts/custom/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${polarToken}`,
      },
    })

    if (!polarRes.ok) {
      // Try generic checkouts endpoint
      polarRes = await fetch(`${polarBaseUrl}/checkouts/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${polarToken}`,
        },
      })
    }

    if (polarRes.ok) {
      checkoutData = await polarRes.json()
    } else {
      const errText = await polarRes.text()
      console.warn('Could not verify session with Polar:', polarRes.status, errText)
    }

    // 2. If Polar verified that payment was confirmed / succeeded:
    if (checkoutData && (checkoutData.status === 'confirmed' || checkoutData.status === 'succeeded')) {
      const metadata = checkoutData.metadata || {}
      const url = metadata.url || 'https://myproduct.com'
      const title = metadata.title || url.replace(/^https?:\/\//, '')
      const description = metadata.description || ''
      const categorySlug = metadata.categorySlug || 'ai-automation'
      const amountCents = checkoutData.amount || 2500
      const email = checkoutData.customer_email || 'customer@example.com'
      const bidderName = metadata.bidderName || ''

      const result = recordVerifiedPaymentAndRank({
        sessionId: checkoutData.id || sessionId,
        url,
        title,
        description,
        categorySlug,
        amountCents,
        email,
        bidderName,
      })

      return res.status(200).json({
        valid: true,
        rank: result.rank,
        listing: result.listing,
        amount: amountCents / 100,
        status: checkoutData.status,
      })
    }

    // If session is still open (payment not done in Polar)
    if (checkoutData && checkoutData.status === 'open') {
      return res.status(400).json({
        valid: false,
        status: 'open',
        error: 'Payment has not been completed yet on Polar.',
      })
    }

    // Fallback if Polar API is unreachable or test session
    return res.status(400).json({
      valid: false,
      error: 'Unable to verify payment with Polar gateway.',
    })
  } catch (error: any) {
    return res.status(500).json({ valid: false, error: error.message || 'Internal server error during verification' })
  }
}
