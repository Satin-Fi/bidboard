import { getAllListings, getDbActivities, getDbStats } from './_db.js'

export default async function handler(req: any, res: any) {
  const { category, q } = req.query || {}

  try {
    const listings = getAllListings(category as string, q as string)
    const activities = getDbActivities()
    const stats = getDbStats()

    return res.status(200).json({
      listings,
      activities,
      stats,
      total: listings.length,
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}
