// Seeds the repository with demo inventory + a demo owner account.
// Run: node src/seed.js   (loads .env if present)
import { loadDb, saveDb, findUserByEmail, insertUser } from './repository.js'
import { hashPassword } from './auth.js'

const HOUR = 60 * 60 * 1000
const now = Date.now()

const listings = [
  {
    id: 'bb-001', ownerId: 'owner-1', owner: 'Metro Media Group', verified: true,
    title: 'Times Square Spectacular — North Face', city: 'New York, NY', address: '1560 Broadway',
    category: 'Billboard', format: 'Digital Large', gradient: 'from-rose-500 via-orange-500 to-amber-400',
    weeklyImpressions: 1450000, viewsPerDay: 207000, reserve: 42000, ratePerWeek: 58000,
    lat: 40.7589, lng: -73.9851, description: 'Flagship double-sided LED spectacular in the heart of Times Square. 24/7 rotation, 15-second spots.',
    endsAt: now + 6 * HOUR, createdAt: now - 5 * HOUR, auctionType: 'timed', status: 'live',
    currentBid: 38500, bidCount: 14, topBidder: 'Apex Beverages',
    size: '36 × 96 ft', illumination: 'Full LED', audience: 'Tourists & shoppers 18–54', dayparting: true,
  },
  {
    id: 'bb-002', ownerId: 'owner-1', owner: 'Sunbelt Outdoor', verified: true,
    title: 'I-405 Freeway Bulk Static', city: 'Los Angeles, CA', address: 'I-405 NB @ Getty Center',
    category: 'Billboard', format: 'Static Bulk', gradient: 'from-sky-500 via-cyan-500 to-emerald-400',
    weeklyImpressions: 920000, viewsPerDay: 131000, reserve: 18500, ratePerWeek: 24000,
    lat: 34.0833, lng: -118.475, description: 'Oversized 14x48 static panel facing northbound rush-hour traffic.',
    endsAt: now + 28 * HOUR, createdAt: now - 9 * HOUR, auctionType: 'timed', status: 'live',
    currentBid: 17200, bidCount: 6, topBidder: 'Coastline Realty',
    size: '14 × 48 ft', illumination: 'Reflective', audience: 'Commuters 25–54', dayparting: false,
  },
  {
    id: 'bb-003', ownerId: 'owner-2', owner: 'Windy City Displays', verified: false,
    title: 'Loop Digital 6-Sheet Network', city: 'Chicago, IL', address: 'Wacker Dr & Michigan Ave',
    category: 'Street Furniture', format: 'Digital Small', gradient: 'from-violet-500 via-fuchsia-500 to-pink-500',
    weeklyImpressions: 310000, viewsPerDay: 44000, reserve: 6400, ratePerWeek: 8200,
    lat: 41.8888, lng: -87.6255, description: 'Cluster of 12 linked 6-sheet digital kiosks across the Loop pedway.',
    endsAt: now + 3 * HOUR, createdAt: now - 2 * HOUR, auctionType: 'timed', status: 'live',
    currentBid: 5900, bidCount: 21, topBidder: 'North Branch Coffee',
    size: '6-sheet (47 × 70 in)', illumination: 'Digital', audience: 'Pedestrians & office workers', dayparting: true,
  },
  {
    id: 'bb-004', ownerId: 'owner-1', owner: 'Capitol Transit Ads', verified: true,
    title: 'Metro Light-Rail Full Wrap — Dutch Auction', city: 'Washington, DC', address: 'Red Line — Union Station',
    category: 'Transit', format: 'Transit', gradient: 'from-amber-500 via-yellow-400 to-lime-400',
    weeklyImpressions: 540000, viewsPerDay: 77000, reserve: 9800, startPrice: 16000, declinePerHour: 900, ratePerWeek: 12500,
    lat: 38.8977, lng: -77.0061, description: 'Reverse (Dutch) auction: the price starts at $16,000 and drops $900/hour until a buyer accepts.',
    endsAt: now + 52 * HOUR, createdAt: now - 14 * HOUR, auctionType: 'reverse', status: 'live',
    currentBid: 0, bidCount: 0, topBidder: null,
    size: 'Full train wrap', illumination: 'Vinyl wrap', audience: 'Commuters 22–60', dayparting: false,
  },
  {
    id: 'bb-005', ownerId: 'owner-2', owner: 'Bay Area Street Co', verified: false,
    title: 'SOMA Bus Shelter Program', city: 'San Francisco, CA', address: '2nd St & Folsom',
    category: 'Street Furniture', format: 'Street Furniture', gradient: 'from-teal-500 via-blue-500 to-indigo-500',
    weeklyImpressions: 180000, viewsPerDay: 26000, reserve: 3200, ratePerWeek: 4100,
    lat: 37.7785, lng: -122.396, description: 'Premium bus shelter facing the SOMA tech corridor. Backlit for night visibility.',
    endsAt: now + 11 * HOUR, createdAt: now - 1 * HOUR, auctionType: 'timed', status: 'live',
    currentBid: 2950, bidCount: 9, topBidder: 'Foundry Labs',
    size: 'Bus shelter (4 × 6 ft)', illumination: 'Backlit', audience: 'Pedestrians & transit riders', dayparting: true,
  },
  {
    id: 'bb-006', ownerId: 'owner-1', owner: 'Lone Star Billboards', verified: true,
    title: 'Highway 59 Mega Static', city: 'Houston, TX', address: 'I-59 S @ Loop 610',
    category: 'Billboard', format: 'Static Bulk', gradient: 'from-orange-600 via-red-500 to-rose-500',
    weeklyImpressions: 760000, viewsPerDay: 109000, reserve: 12000, ratePerWeek: 15500,
    lat: 29.7589, lng: -95.3677, description: 'Monument 20x60 bullet panel on the southbound commuter corridor.',
    endsAt: now + 41 * HOUR, createdAt: now - 20 * HOUR, auctionType: 'timed', status: 'live',
    currentBid: 11400, bidCount: 3, topBidder: 'BBQ Nation',
    size: '20 × 60 ft', illumination: 'Reflective', audience: 'Commuters 25–54', dayparting: false,
  },
  {
    id: 'bb-007', ownerId: 'owner-1', owner: 'Skyline Airport Media', verified: true,
    title: 'Terminal B Arrivals Digital Wall', city: 'Atlanta, GA', address: 'ATL Terminal B',
    category: 'Airport', format: 'Digital Large', gradient: 'from-sky-500 via-cyan-500 to-emerald-400',
    weeklyImpressions: 410000, viewsPerDay: 59000, reserve: 21000, startPrice: 30000, declinePerHour: 1100, ratePerWeek: 27000,
    lat: 33.6407, lng: -84.4277, description: 'Reverse auction on the arrivals baggage-claim digital wall. Price drops $1,100/hr until accepted.',
    endsAt: now + 36 * HOUR, createdAt: now - 7 * HOUR, auctionType: 'reverse', status: 'live',
    currentBid: 0, bidCount: 0, topBidder: null,
    size: '12 × 40 ft LED', illumination: 'Full LED', audience: 'Travelers 30–65, HHI $120k+', dayparting: true,
  },
]

async function main() {
  const db = loadDb()
  if (db.listings.length === 0) db.listings = listings
  if (!findUserByEmail(db, 'owner@bidboard.app')) {
    db.users.push({
      id: 'owner-1', email: 'owner@bidboard.app', name: 'Demo Owner',
      passwordHash: await hashPassword('password123'), verified: true, createdAt: now,
    })
  }
  if (!findUserByEmail(db, 'buyer@bidboard.app')) {
    db.users.push({
      id: 'buyer-1', email: 'buyer@bidboard.app', name: 'Demo Buyer',
      passwordHash: await hashPassword('password123'), verified: false, createdAt: now,
    })
  }
  saveDb(db)
  console.log('Seeded', db.listings.length, 'listings and', db.users.length, 'users.')
}

main()
