/**
 * Read-only fetch of robots.txt and sitemap.xml (respectful, short timeout).
 */

import {
  isHostCircuitOpen,
  recordFetchFailure,
  recordFetchSuccess,
} from '@/lib/intelligence-pipeline/fetch-circuit-breaker'

const FETCH_MS = 12_000

async function fetchText(url: string): Promise<string | null> {
  let hostname = ''
  try {
    hostname = new URL(url).hostname
  } catch {
    return null
  }
  if (isHostCircuitOpen(hostname)) return null

  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), FETCH_MS)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'BabilSourceDiscovery/1.0 (+https://babil.app)' },
      redirect: 'follow',
    })
    if (!res.ok) {
      recordFetchFailure(hostname)
      return null
    }
    recordFetchSuccess(hostname)
    return await res.text()
  } catch {
    recordFetchFailure(hostname)
    return null
  } finally {
    clearTimeout(t)
  }
}

export function originFromBaseUrl(baseUrl: string): string {
  const u = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`)
  return u.origin
}

export async function fetchRobotsPolicy(baseUrl: string): Promise<string | null> {
  const origin = originFromBaseUrl(baseUrl)
  return fetchText(`${origin}/robots.txt`)
}

export function extractSitemapUrls(robots: string | null, origin: string): string[] {
  const urls: string[] = []
  if (robots) {
    for (const line of robots.split('\n')) {
      const m = line.match(/^\s*Sitemap:\s*(\S+)/i)
      if (m?.[1]) urls.push(m[1].trim())
    }
  }
  if (urls.length === 0) urls.push(`${origin}/sitemap.xml`)
  return Array.from(new Set(urls))
}

export async function parseSitemapLocUrls(sitemapUrl: string, limit = 500): Promise<string[]> {
  const xml = await fetchText(sitemapUrl)
  if (!xml) return []
  const locs: string[] = []
  const re = /<loc>([^<]+)<\/loc>/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(xml)) !== null && locs.length < limit) {
    locs.push(m[1].trim())
  }
  return locs
}
