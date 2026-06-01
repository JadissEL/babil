/**
 * Scrape one datafile source: robots → sitemap URLs → fetch + extract each page (bounded).
 */

import {
  extractSitemapUrls,
  fetchRobotsPolicy,
  originFromBaseUrl,
  parseSitemapLocUrls,
} from '@/lib/source-discovery/robots-sitemap'
import {
  discoverPageUrlsFromSitemap,
  isSitemapXmlUrl,
} from '@/lib/datafile/scraper/discover-page-urls'
import { extractFromHtml } from '@/lib/datafile/scraper/extract-content'
import { fetchPageText, isRootDisallowed } from '@/lib/datafile/scraper/fetch-respectful'
import { fallbackUrlsForOrigin } from '@/lib/datafile/scraper/host-fallbacks'
import type { ScrapePageRecord, ScrapeSourceResult } from '@/lib/datafile/scraper/types'
import type { DatafileMasterSource } from '@/lib/datafile/types'

function maxPagesPerSource(): number {
  return Math.max(1, Math.min(200, Number(process.env.DATAFILE_SCRAPE_MAX_PAGES_PER_SOURCE || 40)))
}

async function discoverUrls(baseUrl: string): Promise<{ urls: string[]; robots: string | null }> {
  const origin = originFromBaseUrl(baseUrl)
  const robots = await fetchRobotsPolicy(baseUrl)
  if (isRootDisallowed(robots)) return { urls: [], robots }

  const limit = maxPagesPerSource()
  const sitemapCandidates = extractSitemapUrls(robots, origin)
  let urls: string[] = []
  for (const sm of sitemapCandidates) {
    let locs = await discoverPageUrlsFromSitemap(sm, limit)
    if (locs.length === 0) {
      const raw = await parseSitemapLocUrls(sm, limit * 2)
      locs = raw.filter((u) => !isSitemapXmlUrl(u))
      if (locs.length === 0) locs = raw.slice(0, limit)
    }
    if (locs.length > 0) {
      urls = locs
      break
    }
  }

  if (urls.length === 0) urls = [baseUrl]

  const filtered = urls.filter((u) => {
    try {
      return new URL(u).origin === origin
    } catch {
      return false
    }
  })

  return { urls: filtered.slice(0, limit), robots }
}

/** Try sitemap discovery from baseUrl and optional fallback origins. */
async function discoverUrlsWithFallbacks(baseUrl: string): Promise<{
  urls: string[]
  robots: string | null
  effectiveBaseUrl: string
}> {
  let { urls, robots } = await discoverUrls(baseUrl)
  if (urls.length > 0) return { urls, robots, effectiveBaseUrl: baseUrl }

  const origin = originFromBaseUrl(baseUrl)
  for (const alt of fallbackUrlsForOrigin(origin)) {
    const altResult = await discoverUrls(alt)
    if (altResult.urls.length > 0) {
      return { urls: altResult.urls, robots: altResult.robots, effectiveBaseUrl: alt }
    }
  }

  return { urls: [baseUrl], robots, effectiveBaseUrl: baseUrl }
}

export async function scrapeDatafileSource(source: DatafileMasterSource): Promise<ScrapeSourceResult> {
  const startedAt = new Date().toISOString()
  const baseUrl = source.baseUrl?.trim()

  if (!baseUrl) {
    return {
      sourceId: source.id,
      name: source.name,
      baseUrl: '',
      status: 'skipped',
      robotsPolicy: null,
      pagesScraped: 0,
      pages: [],
      errorSummary: 'missing_base_url',
      startedAt,
      finishedAt: new Date().toISOString(),
    }
  }

  try {
    const { urls, robots, effectiveBaseUrl } = await discoverUrlsWithFallbacks(baseUrl)
    const robotsPolicy = robots ?? (await fetchRobotsPolicy(effectiveBaseUrl))

    if (isRootDisallowed(robotsPolicy) && urls.length <= 1) {
      return {
        sourceId: source.id,
        name: source.name,
        baseUrl,
        status: 'skipped',
        robotsPolicy,
        pagesScraped: 0,
        pages: [],
        errorSummary: 'robots_disallow_root',
        startedAt,
        finishedAt: new Date().toISOString(),
      }
    }

    const pages: ScrapePageRecord[] = []

    for (const url of urls) {
      const { ok, status, text } = await fetchPageText(url)
      if (!ok || !text) {
        pages.push({
          url,
          pageType: 'other',
          title: null,
          contentHash: '',
          excerpt: null,
          fetchedAt: new Date().toISOString(),
          statusCode: status || null,
          error: 'fetch_failed',
        })
        continue
      }

      const { title, excerpt, pageType, hash } = extractFromHtml(url, text)
      pages.push({
        url,
        pageType,
        title,
        contentHash: hash,
        excerpt,
        fetchedAt: new Date().toISOString(),
        statusCode: status,
      })
    }

    const successPages = pages.filter((p) => p.excerpt || p.title)
    const status =
      successPages.length === 0 ? 'failed' : successPages.length < pages.length ? 'partial' : 'complete'

    return {
      sourceId: source.id,
      name: source.name,
      baseUrl: effectiveBaseUrl,
      status,
      robotsPolicy,
      pagesScraped: successPages.length,
      pages,
      errorSummary:
        successPages.length === 0 && pages.some((p) => p.statusCode === 403)
          ? 'homepage_or_pages_403'
          : undefined,
      startedAt,
      finishedAt: new Date().toISOString(),
    }
  } catch (e) {
    return {
      sourceId: source.id,
      name: source.name,
      baseUrl,
      status: 'failed',
      robotsPolicy: null,
      pagesScraped: 0,
      pages: [],
      errorSummary: e instanceof Error ? e.message : String(e),
      startedAt,
      finishedAt: new Date().toISOString(),
    }
  }
}
