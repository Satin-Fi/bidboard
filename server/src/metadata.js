// Metadata scraper using node-fetch + cheerio
import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

const TIMEOUT = 5000
const MAX_SIZE = 500_000 // 500KB

export async function fetchMetadata(url) {
  let html = ''
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT)
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Bidboardbot/1.0 (metadata preview; +https://bidboard.app)',
        Accept: 'text/html',
      },
      redirect: 'follow',
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('html')) throw new Error('Not HTML')
    const buf = await res.buffer()
    if (buf.length > MAX_SIZE) throw new Error('Too large')
    html = buf.toString('utf8')
  } catch {
    return { title: '', description: '', logoUrl: null }
  }

  const $ = cheerio.load(html)

  const og = (prop) => $(`meta[property="og:${prop}"]`).attr('content') || ''
  const meta = (name) => $(`meta[name="${name}"]`).attr('content') || ''

  const title = og('title') || $('title').text() || meta('title') || ''
  const description = og('description') || meta('description') || ''

  // Favicon
  const u = new URL(url)
  let logoUrl = null
  const appleTouchIcon = $('link[rel="apple-touch-icon"]').attr('href')
  const faviconLink = $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href')
  const ogImage = og('image')

  if (ogImage && ogImage.startsWith('http')) {
    logoUrl = ogImage
  } else if (appleTouchIcon) {
    logoUrl = appleTouchIcon.startsWith('http') ? appleTouchIcon : u.origin + appleTouchIcon
  } else if (faviconLink) {
    logoUrl = faviconLink.startsWith('http') ? faviconLink : u.origin + faviconLink
  } else {
    // Fallback to standard favicon
    logoUrl = `${u.origin}/favicon.ico`
  }

  return {
    title: title.slice(0, 80).trim(),
    description: description.slice(0, 160).trim(),
    logoUrl,
  }
}
