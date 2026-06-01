/**
 * Resolve sitemap entries to scrapeable HTML page URLs (not nested sitemap XML).
 */

import { parseSitemapLocUrls } from '@/lib/source-discovery/robots-sitemap'

export function isSitemapXmlUrl(url: string): boolean {
  try {
    const p = new URL(url).pathname.toLowerCase()
    return p.includes('sitemap') && p.endsWith('.xml')
  } catch {
    return /sitemap.*\.xml/i.test(url)
  }
}

export function isLikelyHtmlPageUrl(url: string): boolean {
  try {
    const p = new URL(url).pathname.toLowerCase()
    if (/\.(xml|gz|json|pdf|jpg|jpeg|png|gif|webp|svg|ico|css|js)$/i.test(p)) return false
    return true
  } catch {
    return false
  }
}

/** Expand sitemap index → child sitemaps → HTML locs (bounded). */
export async function discoverPageUrlsFromSitemap(
  sitemapUrl: string,
  limit: number,
): Promise<string[]> {
  const firstPass = await parseSitemapLocUrls(sitemapUrl, Math.max(limit * 4, 120))
  if (firstPass.length === 0) return []

  const htmlUrls: string[] = []
  const childSitemaps: string[] = []

  for (const u of firstPass) {
    if (isSitemapXmlUrl(u)) childSitemaps.push(u)
    else if (isLikelyHtmlPageUrl(u)) htmlUrls.push(u)
  }

  if (htmlUrls.length < Math.max(3, Math.floor(limit / 3))) {
    for (const child of childSitemaps.slice(0, 8)) {
      const nested = await parseSitemapLocUrls(child, limit * 2)
      for (const u of nested) {
        if (!isSitemapXmlUrl(u) && isLikelyHtmlPageUrl(u)) htmlUrls.push(u)
      }
      if (htmlUrls.length >= limit) break
    }
  }

  const seen = new Set<string>()
  const out: string[] = []
  for (const u of htmlUrls) {
    if (seen.has(u)) continue
    seen.add(u)
    out.push(u)
    if (out.length >= limit) break
  }
  return out
}
