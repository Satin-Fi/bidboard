import { recordVerifiedPaymentAndRank } from './_db.js'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    const event = req.body || {}
    console.log('Polar/Payment Webhook Event received:', event.type)

    // Handle Polar webhook: order.created
    if (event.type === 'order.created' || event.type === 'checkout.created') {
      const data = event.data || {}
      const metadata = data.metadata || data.checkout?.metadata || {}
      const url = metadata.url
      if (url) {
        const title = metadata.title || url.replace(/^https?:\/\//, '')
        const description = metadata.description || ''
        const categorySlug = metadata.categorySlug || 'ai-automation'
        const amountCents = data.amount || data.subtotal_amount || 2500
        const email = data.customer_email || data.user?.email || 'customer@example.com'
        const bidderName = metadata.bidderName || ''

        recordVerifiedPaymentAndRank({
          sessionId: data.id || 'wh_' + Date.now(),
          url,
          title,
          description,
          categorySlug,
          amountCents,
          email,
          bidderName,
        })
      }
      return res.status(200).json({ received: true })
    }

    // Handle Stripe checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object || {}
      const metadata = session.metadata || {}
      const url = metadata.url
      if (url) {
        const title = metadata.title || url.replace(/^https?:\/\//, '')
        const categorySlug = metadata.categorySlug || 'ai-automation'
        const amountCents = session.amount_total || 2500
        const email = session.customer_details?.email || 'customer@example.com'

        recordVerifiedPaymentAndRank({
          sessionId: session.id,
          url,
          title,
          description: '',
          categorySlug,
          amountCents,
          email,
        })
      }
      return res.status(200).json({ received: true })
    }

    return res.status(200).json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return res.status(500).json({ error: err.message || 'Webhook processing failed' })
  }
}
