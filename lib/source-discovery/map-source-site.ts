/**
 * Bounded site mapping: robots + sitemap + shallow link extraction (structure only).
 */

import { createHash } from 'node:crypto'

import prisma from '@/lib/prisma'
import { classifyPageUrl } from '@/lib/source-discovery/classify-page'
import {
  extractSitemapUrls,
  fetchRobotsPolicy,
  originFromBaseUrl,
  parseSitemapLocUrls,
} from '@/lib/source-discovery/robots-sitemap'
import type { DiscoveryMapResult, SourceCapabilities } from '@/lib/source-discovery/types'
import { logIntelligence } from '@/lib/intelligence-pipeline/intelligence-log'

const MAX_PAGES = 200
const MAX_DEPTH = 2

function hashContent(s: string): string {
  return createHash('sha256').update(s).digest('hex').slice(0, 32)
}

function deriveCapabilities(urls: string[]): SourceCapabilities {
  return {
    hasPdf: urls.some((u) => /\.pdf($|\?)/i.test(u)),
    hasApi: urls.some((u) => /api\.|\/api\//i.test(u)),
    hasCountryPages: urls.some((u) => /\/[a-z]{2}(\/|$)/i.test(u)),
    hasDynamicContent: urls.length > 80,
  }
}

export async function mapSourceSite(sourceId: string): Promise<DiscoveryMapResult> {
  const source = await prisma.intelligenceSource.findUnique({ where: { id: sourceId } })
  if (!source?.baseUrl) {
    const procedural: DiscoveryMapResult = {
      sourceId,
      status: 'procedural_no_fetch',
      pageCount: 0,
      sitemapUrl: null,
      robotsPolicy: null,
      capabilities: {
        hasPdf: false,
        hasApi: false,
        hasCountryPages: false,
        hasDynamicContent: false,
      },
      errorSummary: 'no_base_url',
    }
    await persistDiscovery(sourceId, procedural)
    return procedural
  }

  await prisma.intelligenceSource.update({
    where: { id: sourceId },
    data: { discoveryStatus: 'mapping' },
  })

  await prisma.sourceSiteInventory.upsert({
    where: { sourceId },
    create: { sourceId, status: 'mapping' },
    update: { status: 'mapping', errorSummary: null },
  })

  try {
    const origin = originFromBaseUrl(source.baseUrl)
    const robotsPolicy = await fetchRobotsPolicy(source.baseUrl)
    const sitemapCandidates = extractSitemapUrls(robotsPolicy, origin)
    let urls: string[] = []
    let sitemapUrl: string | null = null

    for (const sm of sitemapCandidates) {
      const locs = await parseSitemapLocUrls(sm, MAX_PAGES)
      if (locs.length > 0) {
        urls = locs
        sitemapUrl = sm
        break
      }
    }

    if (urls.length === 0) {
      urls = [source.baseUrl]
    }

    urls = urls
      .filter((u) => {
        try {
          const parsed = new URL(u)
          return parsed.origin === origin
        } catch {
          return false
        }
      })
      .slice(0, MAX_PAGES)

    const capabilities = deriveCapabilities(urls)
    const now = new Date()

    for (const url of urls) {
      const pageType = classifyPageUrl(url)
      const depth = url === source.baseUrl ? 0 : Math.min(MAX_DEPTH, 1)
      await prisma.sourcePageIndex.upsert({
        where: { sourceId_url: { sourceId, url } },
        create: {
          sourceId,
          url,
          pageType,
          depth,
          parentUrl: depth > 0 ? source.baseUrl : null,
          contentHash: hashContent(url),
          lastSeenAt: now,
        },
        update: { pageType, contentHash: hashContent(url), lastSeenAt: now },
      })
    }

    const result: DiscoveryMapResult = {
      sourceId,
      status: 'complete',
      pageCount: urls.length,
      sitemapUrl,
      robotsPolicy,
      capabilities,
    }
    await persistDiscovery(sourceId, result)
    logIntelligence('info', 'source_discovery_complete', {
      sourceId,
      slug: source.slug,
      pageCount: urls.length,
    })
    return result
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    const failed: DiscoveryMapResult = {
      sourceId,
      status: 'failed',
      pageCount: 0,
      sitemapUrl: null,
      robotsPolicy: null,
      capabilities: {
        hasPdf: false,
        hasApi: false,
        hasCountryPages: false,
        hasDynamicContent: false,
      },
      errorSummary: msg,
    }
    await persistDiscovery(sourceId, failed)
    return failed
  }
}

async function persistDiscovery(sourceId: string, result: DiscoveryMapResult): Promise<void> {
  const status = result.status
  await prisma.sourceSiteInventory.upsert({
    where: { sourceId },
    create: {
      sourceId,
      status,
      sitemapUrl: result.sitemapUrl,
      robotsPolicy: result.robotsPolicy,
      capabilitiesJson: JSON.stringify(result.capabilities),
      pageCount: result.pageCount,
      lastMappedAt: new Date(),
      errorSummary: result.errorSummary ?? null,
    },
    update: {
      status,
      sitemapUrl: result.sitemapUrl,
      robotsPolicy: result.robotsPolicy,
      capabilitiesJson: JSON.stringify(result.capabilities),
      pageCount: result.pageCount,
      lastMappedAt: new Date(),
      errorSummary: result.errorSummary ?? null,
    },
  })
  await prisma.intelligenceSource.update({
    where: { id: sourceId },
    data: {
      discoveryStatus: status,
      capabilitiesJson: JSON.stringify(result.capabilities),
    },
  })
}
