// Frontend API client. Talks to the Bidboard backend (VITE_API_URL).
const BASE = (import.meta as any).env?.VITE_API_URL || ''

function token() {
  return localStorage.getItem('bb_token')
}

async function req(path: string, opts: RequestInit = {}) {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(opts.headers as Record<string, string>),
  }
  const t = token()
  if (t) headers['authorization'] = 'Bearer ' + t
  const res = await fetch(BASE + path, { ...opts, headers })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed (${res.status})`)
  }
  return res.json()
}

export const api = {
  listings: () => req('/api/listings'),
  listing: (id: string) => req('/api/listings/' + id),
  bid: (id: string, amount: number, bidder?: string) =>
    req('/api/listings/' + id + '/bid', { method: 'POST', body: JSON.stringify({ amount, bidder }) }),
  accept: (id: string, bidder?: string) =>
    req('/api/listings/' + id + '/accept', { method: 'POST', body: JSON.stringify({ bidder }) }),
  close: (id: string) => req('/api/listings/' + id + '/close', { method: 'POST' }),
  create: (payload: any) => req('/api/listings', { method: 'POST', body: JSON.stringify(payload) }),
  register: (email: string, name: string, password: string) =>
    req('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, name, password }) }),
  login: (email: string, password: string) =>
    req('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  watch: (listingId: string, on: boolean) =>
    req('/api/watch', { method: 'POST', body: JSON.stringify({ listingId, on }) }),
  getWatch: () => req('/api/watch'),
  savedSearches: () => req('/api/saved-searches'),
  saveSearch: (q: string, format: string, category: string) =>
    req('/api/saved-searches', { method: 'POST', body: JSON.stringify({ q, format, category }) }),
  deleteSearch: (id: string) => req('/api/saved-searches/' + id, { method: 'DELETE' }),
}
