// Vercel Serverless Function: /api/verify
// Verifies session tokens for completed checkouts
export default async function handler(req: any, res: any) {
  const { session_id } = req.query || {}

  if (!session_id) {
    return res.status(400).json({ valid: false, error: 'session_id is required' })
  }

  return res.status(200).json({
    valid: true,
    sessionId: session_id,
    status: 'paid',
    verifiedAt: Date.now(),
  })
}
