/**
 * Main algorithm: iterate ~300 datafile sources and scrape each (bounded, respectful).
 */

import { randomUUID } from 'node:crypto'

import { loadDatafileMasterList } from '@/lib/datafile/load-master-list'
import type { DatafileMasterSource } from '@/lib/datafile/types'
import {
  readRunManifestIfExists,
  readSourceResultIfExists,
  recomputeRunStatsFromDisk,
  writeRunManifest,
  writeSourceResult,
} from '@/lib/datafile/scraper/persist-run'
import { scrapeDatafileSource } from '@/lib/datafile/scraper/scrape-source'
import { syncScrapeResultToDatabase } from '@/lib/datafile/scraper/sync-to-database'
import type { ScrapeRunManifest } from '@/lib/datafile/scraper/types'
import { logIntelligence } from '@/lib/intelligence-pipeline/intelligence-log'
import prisma from '@/lib/prisma'
import { assertProdWritesAllowed } from '@/lib/prod-write-guard'

export type RunDatafileScrapeOptions = {
  /** Max sources to process this run (null = all with baseUrl). */
  limit?: number | null
  /** Only scrape this datafile source id. */
  sourceId?: string
  /** Resume existing run folder. */
  runId?: string
  /** Skip sources already present in run dir with status complete. */
  resume?: boolean
  /** With resume: only re-process sources whose saved status is failed/partial/skipped (not complete). */
  retryFailed?: boolean
  writeDb?: boolean
  countryIdForObservations?: number
  cwd?: string
}

export async function runDatafileScrapeAlgorithm(
  opts: RunDatafileScrapeOptions = {},
): Promise<ScrapeRunManifest> {
  const cwd = opts.cwd ?? process.cwd()
  const master = loadDatafileMasterList(cwd)
  const runId = opts.runId ?? `run_${new Date().toISOString().replace(/[:.]/g, '-')}_${randomUUID().slice(0, 8)}`

  let sources: DatafileMasterSource[] = master.sources.filter(
    (s) => s.baseUrl && s.requiresDiscoveryGate !== false,
  )
  if (opts.sourceId) sources = sources.filter((s) => s.id === opts.sourceId)
  if (opts.limit != null) sources = sources.slice(0, opts.limit)

  const existingManifest = opts.runId ? readRunManifestIfExists(runId, cwd) : null
  const allScrapeableIds = master.sources
    .filter((s) => s.baseUrl && s.requiresDiscoveryGate !== false)
    .map((s) => s.id)

  const manifest: ScrapeRunManifest = {
    runId,
    startedAt: existingManifest?.startedAt ?? new Date().toISOString(),
    config: {
      maxPagesPerSource: Number(process.env.DATAFILE_SCRAPE_MAX_PAGES_PER_SOURCE || 40),
      delayMsBetweenRequests: Number(process.env.DATAFILE_SCRAPE_DELAY_MS || 1500),
      maxSources: opts.limit ?? null,
    },
    stats: {
      sourcesTotal: master.sources.length,
      sourcesAttempted: 0,
      sourcesComplete: 0,
      sourcesSkipped: 0,
      sourcesFailed: 0,
      pagesScraped: 0,
    },
    sourceIds: opts.sourceId ? sources.map((s) => s.id) : allScrapeableIds,
  }

  writeRunManifest(manifest, cwd)

  let dbEnrichmentRunId: string | undefined
  if (opts.writeDb) {
    assertProdWritesAllowed('datafile-scrape')
    const run = await prisma.enrichmentRun.create({
      data: { status: 'RUNNING', trigger: `datafile:scrape:${runId}` },
    })
    dbEnrichmentRunId = run.id
  }

  logIntelligence('info', 'datafile_scrape_run_start', {
    runId,
    sources: sources.length,
  })

  for (const source of sources) {
    if (opts.resume) {
      const existing = readSourceResultIfExists(runId, source.id, cwd)
      if (existing?.status === 'complete') {
        manifest.stats.sourcesComplete += 1
        manifest.stats.pagesScraped += existing.pagesScraped
        continue
      }
      if (
        opts.retryFailed &&
        existing &&
        !['failed', 'partial', 'skipped'].includes(existing.status)
      ) {
        continue
      }
    }

    manifest.stats.sourcesAttempted += 1
    const result = await scrapeDatafileSource(source)
    writeSourceResult(runId, result, cwd)

    if (result.status === 'complete') manifest.stats.sourcesComplete += 1
    else if (result.status === 'skipped') manifest.stats.sourcesSkipped += 1
    else manifest.stats.sourcesFailed += 1
    manifest.stats.pagesScraped += result.pagesScraped

    if (opts.writeDb) {
      await syncScrapeResultToDatabase(result, {
        countryId: opts.countryIdForObservations,
        runId: dbEnrichmentRunId,
      })
    }

    logIntelligence('info', 'datafile_scrape_source_done', {
      runId,
      sourceId: source.id,
      status: result.status,
      pages: result.pagesScraped,
    })
  }

  manifest.stats = recomputeRunStatsFromDisk(runId, master.sources.length, cwd)
  manifest.finishedAt = new Date().toISOString()
  writeRunManifest(manifest, cwd)

  if (dbEnrichmentRunId) {
    await prisma.enrichmentRun.update({
      where: { id: dbEnrichmentRunId },
      data: {
        status: 'SUCCEEDED',
        finishedAt: new Date(),
        statsJson: JSON.stringify(manifest.stats),
      },
    })
  }

  logIntelligence('info', 'datafile_scrape_run_finish', { runId, stats: manifest.stats })

  return manifest
}
