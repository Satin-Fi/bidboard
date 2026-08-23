// WebSocket hub: broadcasts auction events to all connected clients.
import { WebSocketServer } from 'ws'

export function createHub(server) {
  const wss = new WebSocketServer({ server, path: '/ws' })
  const clients = new Set()

  wss.on('connection', (ws) => {
    clients.add(ws)
    ws.on('close', () => clients.delete(ws))
  })

  function broadcast(type, payload) {
    const msg = JSON.stringify({ type, payload })
    for (const ws of clients) {
      if (ws.readyState === ws.OPEN) ws.send(msg)
    }
  }

  return {
    wss,
    broadcast,
    /** initial snapshot for a freshly-connected client */
    snapshot: (data) => broadcast('snapshot', data),
    listingUpdated: (listing) => broadcast('listing.updated', listing),
    bidPlaced: (bid, listing) => broadcast('bid.placed', { bid, listing }),
    auctionEnded: (listing) => broadcast('auction.ended', listing),
  }
}
