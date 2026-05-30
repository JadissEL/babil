/**
 * Deep collect from SourcePageIndex — HTML pages → bronze observations (structure pass).
 */

import prisma from '@/lib/prisma'
import { upsertCountryObservation } from '@/lib/intelligence-pipeline/observation-writer'

const FETCH_MS = 15_000

export async function runDeepCollectForSource(args: {
  sourceId: string
  countryId: number
  runId: string
  limit?: number
}): Promise<{ pages: number; written: number }> {
  const pages = await prisma.sourcePageIndex.findMany({
    where: { sourceId: args.sourceId, pageType: { not: 'pdf' } },
    take: args.limit ?? 24,
    orderBy: { lastSeenAt: 'desc' },
  })

  let written = 0
  for (const page of pages) {
    let title: string | null = page.title
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), FETCH_MS)
      const res = await fetch(page.url, {
        signal: ctrl.signal,
        headers: { 'User-Agent': 'BabilDeepCollect/1.0' },
      })
      clearTimeout(t)
      if (res.ok) {
        const html = await res.text()
        const m = html.match(/<title[^>]*>([^<]+)<\/title>/i)
        if (m?.[1]) title = m[1].trim().slice(0, 200)
      }
    } catch {
      /* skip fetch errors */
    }

    const fieldPath = `source.page.${page.pageType}`
    await upsertCountryObservation({
      countryId: args.countryId,
      sourceId: args.sourceId,
      runId: args.runId,
      fieldPath,
      valueJson: JSON.stringify({ value: title ?? page.url, summary: title ?? page.url }),
      confidence: 0.55,
      verificationStatus: 'pending',
      sourceUrl: page.url,
      rawExcerpt: title,
      dedupeKey: `page:${args.countryId}:${page.url}`,
    })
    written++
  }

  return { pages: pages.length, written }
}
