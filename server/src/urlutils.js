// URL normalization and safety utilities

// Blocked patterns
const BLOCKED_PATTERNS = [
  /^(javascript|data|vbscript):/i,
  /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i,
  /\.(tk|ml|ga|cf|gq)$/i, // common spam TLDs
]

const BLOCKED_DOMAINS = [
  't.me', 'telegram.me', 'wa.me', 'discord.gg', 'discord.com/invite',
]

// URL shorteners
const URL_SHORTENERS = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly']

// Tracking params to strip
const TRACKING_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'ref', 'referral', 'affiliate', 'aff', 'fbclid', 'gclid', 'mc_cid', 'mc_eid',
  'igshid', 'twclid', '_ga', 'msclkid', 'zanpid', 'dclid']

export function normalizeUrl(raw) {
  let urlStr = (raw || '').trim()
  if (!urlStr) throw new Error('URL cannot be empty.')

  // Handle @username — treat as Twitter/X
  if (urlStr.startsWith('@')) {
    urlStr = `https://x.com/${urlStr.slice(1)}`
  }

  // Add protocol if missing
  if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
    urlStr = 'https://' + urlStr
  }

  let u
  try {
    u = new URL(urlStr)
  } catch {
    throw new Error('Invalid URL format.')
  }

  // Force HTTPS
  u.protocol = 'https:'

  // Block dangerous schemes
  if (!['https:', 'http:'].includes(u.protocol)) {
    throw new Error('Unsupported URL scheme.')
  }

  // Strip tracking params
  TRACKING_PARAMS.forEach((p) => u.searchParams.delete(p))

  // Strip trailing slash from path (except root)
  if (u.pathname !== '/') {
    u.pathname = u.pathname.replace(/\/+$/, '')
  }

  // Remove fragment
  u.hash = ''

  return u.toString()
}

export function isUrlAllowed(url) {
  let u
  try { u = new URL(url) } catch { return false }

  const host = u.hostname.toLowerCase()

  // Block known bad domains
  for (const d of BLOCKED_DOMAINS) {
    if (host === d || host.endsWith('.' + d)) return false
  }

  // Block URL shorteners
  for (const d of URL_SHORTENERS) {
    if (host === d || host.endsWith('.' + d)) return false
  }

  // Block patterns
  for (const p of BLOCKED_PATTERNS) {
    if (p.test(host) || p.test(url)) return false
  }

  // Block private networks
  if (/^(localhost|127\.|0\.0\.0\.|::1)/.test(host)) return false

  return true
}
