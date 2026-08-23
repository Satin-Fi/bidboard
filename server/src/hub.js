// WebSocket hub: broadcasts rank updates and activity to all clients
import { WebSocketServer } from 'ws'

export function createHub(server) {
  const wss = new WebSocketServer({ server, path: '/ws' })
  const clients = new Set()

  wss.on('connection', (ws) => {
    clients.add(ws)
    ws.on('close', () => clients.delete(ws))
    ws.on('error', () => clients.delete(ws))
  })

  function send(type, payload) {
    const msg = JSON.stringify({ type, payload })
    for (const ws of clients) {
      if (ws.readyState === ws.OPEN) {
        try { ws.send(msg) } catch {}
      }
    }
  }

  return {
    wss,
    broadcast: send,
    broadcastRankUpdate: (listings) => send('rank_update', { listings }),
    broadcastActivity: (event) => send('activity', event),
    broadcastStats: (stats) => send('stats_update', stats),
    getConnectionCount: () => clients.size,
    // Legacy compat
    listingUpdated: (l) => send('listing.updated', l),
    bidPlaced: (bid, listing) => send('bid.placed', { bid, listing }),
    auctionEnded: (listing) => send('auction.ended', listing),
    snapshot: (data) => send('snapshot', data),
  }
}
