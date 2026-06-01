import {
  isHostCircuitOpen,
  recordFetchFailure,
  recordFetchSuccess,
} from '@/lib/intelligence-pipeline/fetch-circuit-breaker'
import { waitForHost } from '@/lib/datafile/scraper/rate-limit'

const UA =
  process.env.DATAFILE_SCRAPE_USER_AGENT ??
  'BabilDatafileScraper/1.0 (+https://babil.app; immigration research)'

export function scrapeFetchTimeoutMs(): number {
  return Math.min(30_000, Math.max(8000, Number(process.env.DATAFILE_SCRAPE_FETCH_MS || 14_000)))
}

/** Basic robots.txt: skip if root path disallowed for all agents. */
export function isRootDisallowed(robots: string | null): boolean {
  if (!robots) return false
  let applies = false
  for (const line of robots.split('\n')) {
    const t = line.trim()
    if (/^User-agent:\s*\*/i.test(t)) applies = true
    if (/^User-agent:/i.test(t) && !/^User-agent:\s*\*/i.test(t)) applies = false
    if (applies && /^Disallow:\s*\/\s*$/i.test(t)) return true
  }
  return false
}

function scrapeRetryMs(): number {
  return Math.max(500, Number(process.env.DATAFILE_SCRAPE_RETRY_MS || 2000))
}

function fetchHeaders(): Record<string, string> {
  return {
    'User-Agent': UA,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8',
    'Cache-Control': 'no-cache',
  }
}

const RETRYABLE_STATUS = new Set([403, 429, 502, 503])

async function fetchOnce(url: string, hostname: string): Promise<{
  ok: boolean
  status: number
  text: string | null
}> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), scrapeFetchTimeoutMs())
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: fetchHeaders(),
      redirect: 'follow',
    })
    const text = res.ok ? await res.text() : null
    if (res.ok) recordFetchSuccess(hostname)
    else recordFetchFailure(hostname)
    return { ok: res.ok, status: res.status, text }
  } catch {
    recordFetchFailure(hostname)
    return { ok: false, status: 0, text: null }
  } finally {
    clearTimeout(t)
  }
}

export async function fetchPageText(url: string): Promise<{
  ok: boolean
  status: number
  text: string | null
}> {
  let hostname = ''
  try {
    hostname = new URL(url).hostname
  } catch {
    return { ok: false, status: 0, text: null }
  }
  if (isHostCircuitOpen(hostname)) {
    return { ok: false, status: 0, text: null }
  }

  await waitForHost(hostname)

  let result = await fetchOnce(url, hostname)
  if (!result.ok && RETRYABLE_STATUS.has(result.status)) {
    await new Promise((r) => setTimeout(r, scrapeRetryMs()))
    await waitForHost(hostname)
    result = await fetchOnce(url, hostname)
  }
  return result
}
