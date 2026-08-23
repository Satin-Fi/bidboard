// Server-side persistence for paid bids.
// Prefers Upstash Redis (serverless-safe, free tier) when env vars are set;
// otherwise falls back to a local JSON file (dev / demo only — NOT durable on Vercel).
import { promises as fs } from 'node:fs'

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const FILE = '.data/bids.json'

export interface StoredBid {
  id: string
  url: string
  title: string
  description: string
  categorySlug: string
  amount: number
  bidder: string
  isBusiness: boolean
  rank: number
  sessionId: string
  status: 'paid' | 'pending'
  createdAt: number
}

async function readAll(): Promise<StoredBid[]> {
  if (REDIS_URL && REDIS_TOKEN) {
    const res = await fetch(`${REDIS_URL}/lrange/bidboard:bids/0/-1`, {
      headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    })
    if (res.ok) {
      const raw = (await res.json()) as unknown
      // Upstash returns { result: [...] }
      const arr = Array.isArray(raw) ? raw : (raw as any)?.result ?? []
      return (Array.isArray(arr) ? arr : []).map((x: string) => JSON.parse(x))
    }
  }
  try {
    const buf = await fs.readFile(FILE, 'utf8')
    return JSON.parse(buf) as StoredBid[]
  } catch {
    return []
  }
}

async function writeAll(bids: StoredBid[]): Promise<void> {
  if (REDIS_URL && REDIS_TOKEN) {
    // Replace the list atomically.
    await fetch(`${REDIS_URL}/del/bidboard:bids`, { headers: { Authorization: `Bearer ${REDIS_TOKEN}` } })
    if (bids.length) {
      const args = bids.map((b) => encodeURIComponent(JSON.stringify(b)))
      await fetch(`${REDIS_URL}/rpush/bidboard:bids/${args.join('/')}`, {
        headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
      })
    }
    return
  }
  await fs.mkdir('.data', { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(bids, null, 2), 'utf8')
}

export async function saveBid(bid: StoredBid): Promise<void> {
  const all = await readAll()
  const idx = all.findIndex((b) => b.sessionId === bid.sessionId)
  if (idx >= 0) all[idx] = bid
  else all.push(bid)
  await writeAll(all)
}

export async function getBid(sessionId: string): Promise<StoredBid | null> {
  const all = await readAll()
  return all.find((b) => b.sessionId === sessionId) ?? null
}

export async function listBids(): Promise<StoredBid[]> {
  const all = await readAll()
  return all.sort((a, b) => b.amount - a.amount)
}
