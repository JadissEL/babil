/**
 * Push datafile scrape results into SourceSiteInventory / SourcePageIndex (+ optional observations).
 */

import prisma from '@/lib/prisma'
import { slugFromDatafileId } from '@/lib/datafile/load-master-list'
import { upsertCountryObservation } from '@/lib/intelligence-pipeline/observation-writer'
import type { ScrapeSourceResult } from '@/lib/datafile/scraper/types'

export async function syncScrapeResultToDatabase(
  result: ScrapeSourceResult,
  opts?: { countryId?: number; runId?: string },
): Promise<{ sourceDbId: string | null }> {
  const slug = slugFromDatafileId(result.sourceId)
  const source = await prisma.intelligenceSource.findUnique({ where: { slug } })
  if (!source) return { sourceDbId: null }

  const discoveryStatus =
    result.status === 'complete' || result.status === 'partial' ? 'complete' : 'failed'

  await prisma.intelligenceSource.update({
    where: { id: source.id },
    data: {
      discoveryStatus,
      baseUrl: result.baseUrl || source.baseUrl,
    },
  })

  await prisma.sourceSiteInventory.upsert({
    where: { sourceId: source.id },
    create: {
      sourceId: source.id,
      status: discoveryStatus,
      robotsPolicy: result.robotsPolicy,
      pageCount: result.pagesScraped,
      lastMappedAt: new Date(),
      errorSummary: result.errorSummary ?? null,
    },
    update: {
      status: discoveryStatus,
      robotsPolicy: result.robotsPolicy,
      pageCount: result.pagesScraped,
      lastMappedAt: new Date(),
      errorSummary: result.errorSummary ?? null,
    },
  })

  for (const page of result.pages) {
    if (!page.contentHash) continue
    await prisma.sourcePageIndex.upsert({
      where: { sourceId_url: { sourceId: source.id, url: page.url } },
      create: {
        sourceId: source.id,
        url: page.url,
        pageType: page.pageType,
        title: page.title,
        contentHash: page.contentHash,
        lastSeenAt: new Date(page.fetchedAt),
      },
      update: {
        pageType: page.pageType,
        title: page.title,
        contentHash: page.contentHash,
        lastSeenAt: new Date(page.fetchedAt),
      },
    })

    if (opts?.countryId != null && page.excerpt && opts.runId) {
      await upsertCountryObservation({
        countryId: opts.countryId,
        sourceId: source.id,
        runId: opts.runId,
        fieldPath: `datafile.scrape.${page.pageType}`,
        valueJson: JSON.stringify({
          value: page.title ?? page.url,
          summary: page.excerpt.slice(0, 500),
        }),
        confidence: 0.5,
        verificationStatus: 'pending',
        sourceUrl: page.url,
        rawExcerpt: page.excerpt.slice(0, 2000),
        dedupeKey: `datafile:${opts.countryId}:${page.url}`,
      })
    }
  }

  return { sourceDbId: source.id }
}
