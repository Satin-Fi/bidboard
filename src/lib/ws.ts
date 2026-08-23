// WebSocket client for live auction updates. Auto-reconnects.
let ws: WebSocket | null = null
let listeners: ((evt: any) => void)[] = []
let connected = false

export function connectWs(onEvent: (evt: any) => void) {
  listeners.push(onEvent)
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return

  const base = (import.meta as any).env?.VITE_WS_URL || ''
  const url = base ? base.replace(/^http/, 'ws') : `ws://${location.host}/ws`
  ws = new WebSocket(url)
  ws.onopen = () => { connected = true }
  ws.onmessage = (m) => {
    try {
      const evt = JSON.parse(m.data)
      listeners.forEach((l) => l(evt))
    } catch { /* ignore */ }
  }
  ws.onclose = () => {
    connected = false
    setTimeout(() => connectWs(onEvent), 2000) // reconnect
  }
  ws.onerror = () => ws?.close()
}

export function isWsConnected() {
  return connected
}
