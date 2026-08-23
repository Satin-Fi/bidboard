// WebSocket client for live auction updates. Auto-reconnects.
let ws: WebSocket | null = null
let listeners: ((evt: any) => void)[] = []
let connected = false

export function connectWs(onEvent: (evt: any) => void) {
  if (!listeners.includes(onEvent)) {
    listeners.push(onEvent)
  }
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return

  const base = (import.meta as any).env?.VITE_WS_URL || ''
  const defaultProto = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const defaultHost = typeof window !== 'undefined' ? window.location.host : 'localhost:4000'
  const url = base ? base.replace(/^http(s?):/, 'ws$1:') : `${defaultProto}//${defaultHost}/ws`

  try {
    ws = new WebSocket(url)
    ws.onopen = () => {
      connected = true
    }
    ws.onmessage = (m) => {
      try {
        const evt = JSON.parse(m.data)
        listeners.forEach((l) => l(evt))
      } catch {
        /* ignore */
      }
    }
    ws.onclose = () => {
      connected = false
      setTimeout(() => {
        if (!ws || ws.readyState === WebSocket.CLOSED) {
          connectWs(onEvent)
        }
      }, 5000)
    }
    ws.onerror = () => ws?.close()
  } catch (err) {
    console.warn('WebSocket connection unavailable:', err)
  }
}

export function isWsConnected() {
  return connected
}

