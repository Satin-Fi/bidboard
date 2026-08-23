// Vercel Serverless Function: /api/webhook
// Handles Polar.sh / Stripe webhook events
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const event = req.body || {}

  // Handle Polar webhook: order.created / checkout.updated
  if (event.type === 'order.created' || event.type === 'checkout.created') {
    const data = event.data || {}
    console.log('Polar Webhook received:', event.type, data.id)
    return res.status(200).json({ received: true })
  }

  // Handle Stripe webhook: checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data?.object || {}
    console.log('Stripe Webhook received:', session.id, session.amount_total)
    return res.status(200).json({ received: true })
  }

  return res.status(200).json({ received: true })
}
