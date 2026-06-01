/**
 * Convert bronze scrape JSON into CountryObservation rows (rules first, optional LLM).
 */

import { readAllSourceResults } from '@/lib/datafile/scraper/persist-run'
import type { ScrapePageRecord } from '@/lib/datafile/scraper/types'
import { slugFromDatafileId } from '@/lib/datafile/load-master-list'
import { extractFieldsFromExcerpt } from '@/lib/datafile/extract/field-extractors'
import { llmFillFieldGaps } from '@/lib/datafile/extract/llm-fill-gaps'
import {
  buildCountryLookup,
  isLowSignalScrapePage,
  matchCountriesFromPage,
  matchCountriesFromSourceHint,
  type CountryLookupRow,
} from '@/lib/datafile/extract/match-country-from-page'
import { upsertCountryObservation } from '@/lib/intelligence-pipeline/observation-writer'
import { logIntelligence } from '@/lib/intelligence-pipeline/intelligence-log'
import prisma from '@/lib/prisma'
import { assertProdWritesAllowed } from '@/lib/prod-write-guard'

const LLM_CANDIDATE_PATHS = [
  'visa_processing_time',
  'full_data.appointment_audit.avg_wait_time',
  'full_data.friction_analysis.real_delay',
  'full_data.visa_system.tourism.fees',
  'appointment_difficulty',
]

export type BronzeToObservationsOptions = {
  runId: string
  writeDb?: boolean
  llmFill?: boolean
  llmTokenBudget?: number
  countryIds?: number[]
  cwd?: string
}

export type BronzeToObservationsReport = {
  runId: string
  pagesConsidered: number
  observationsWritten: number
  llmCalls: number
  byFieldPath: Record<string, number>
}

async function resolveSourceDbId(datafileSourceId: string): Promise<string | null> {
  const slug = slugFromDatafileId(datafileSourceId)
  const row = await prisma.intelligenceSource.findUnique({ where: { slug }, select: { id: true } })
  return row?.id ?? null
}

function processPage(
  page: ScrapePageRecord,
  lookup: CountryLookupRow[],
  countryFilter: Set<number> | null,
  sourceHintIds: number[],
): { countryId: number; fields: ReturnType<typeof extractFieldsFromExcerpt> }[] {
  if (!page.excerpt || isLowSignalScrapePage(page.url, page.excerpt)) return []

  let countryIds = matchCountriesFromPage(lookup, {
    url: page.url,
    title: page.title,
    excerpt: page.excerpt,
  })
  if (countryIds.length === 0 && sourceHintIds.length > 0) {
    countryIds = sourceHintIds
  }
  countryIds = countryIds.filter((id) => !countryFilter || countryFilter.has(id))

  const fields = extractFieldsFromExcerpt(page.excerpt, page.pageType)
  if (fields.length === 0 || countryIds.length === 0) return []

  return countryIds.map((countryId) => ({ countryId, fields }))
}

export async function bronzeScrapeRunToObservations(
  opts: BronzeToObservationsOptions,
): Promise<BronzeToObservationsReport> {
  const cwd = opts.cwd ?? process.cwd()
  const results = readAllSourceResults(opts.runId, cwd)

  const countries = await prisma.country.findMany({
    select: { id: true, name: true },
    ...(opts.countryIds?.length ? { where: { id: { in: opts.countryIds } } } : {}),
  })
  const lookup = buildCountryLookup(countries)
  const countryFilter = opts.countryIds?.length ? new Set(opts.countryIds) : null

  if (opts.writeDb) assertProdWritesAllowed('datafile:bronze-to-observations')

  let enrichmentRunId: string | undefined
  if (opts.writeDb) {
    const run = await prisma.enrichmentRun.create({
      data: { status: 'RUNNING', trigger: `datafile:bronze:${opts.runId}` },
    })
    enrichmentRunId = run.id
  }

  const report: BronzeToObservationsReport = {
    runId: opts.runId,
    pagesConsidered: 0,
    observationsWritten: 0,
    llmCalls: 0,
    byFieldPath: {},
  }

  const tokenBudget =
    opts.llmTokenBudget ?? Number(process.env.AGENT_LLM_TOKEN_BUDGET_PER_TASK || 0)

  for (const sourceResult of results) {
    if (!['complete', 'partial'].includes(sourceResult.status)) continue
    const sourceDbId = opts.writeDb ? await resolveSourceDbId(sourceResult.sourceId) : null
    if (opts.writeDb && !sourceDbId) continue

    const sourceHintIds = matchCountriesFromSourceHint(
      lookup,
      sourceResult.name,
      sourceResult.baseUrl,
    ).filter((id) => !countryFilter || countryFilter.has(id))

    for (const page of sourceResult.pages) {
      if (!page.excerpt || isLowSignalScrapePage(page.url, page.excerpt)) continue
      report.pagesConsidered += 1

      let bundles = processPage(page, lookup, countryFilter, sourceHintIds)
      const needsLlm =
        opts.llmFill &&
        tokenBudget > 0 &&
        (bundles.length === 0 || bundles.every((b) => b.fields.length === 0))

      if (needsLlm) {
        const countryIds =
          bundles.length > 0
            ? bundles.map((b) => b.countryId)
            : [
                ...matchCountriesFromPage(lookup, {
                  url: page.url,
                  title: page.title,
                  excerpt: page.excerpt,
                }),
                ...sourceHintIds,
              ].filter((id, i, arr) => arr.indexOf(id) === i)
                .filter((id) => !countryFilter || countryFilter.has(id))

        for (const countryId of countryIds.slice(0, 1)) {
          const country = countries.find((c) => c.id === countryId)
          if (!country) continue
          report.llmCalls += 1
          const llmFields = await llmFillFieldGaps(
            {
              countryName: country.name,
              excerpt: page.excerpt,
              candidateFieldPaths: LLM_CANDIDATE_PATHS,
            },
            tokenBudget,
          )
          if (llmFields.length > 0) {
            bundles = [
              {
                countryId,
                fields: llmFields.map((f) => ({
                  fieldPath: f.fieldPath,
                  value: f.value,
                  confidence: f.confidence,
                })),
              },
            ]
            break
          }
        }
      }

      for (const bundle of bundles) {
        for (const field of bundle.fields) {
          report.byFieldPath[field.fieldPath] = (report.byFieldPath[field.fieldPath] ?? 0) + 1
          if (!opts.writeDb || !sourceDbId || !enrichmentRunId) continue

          await upsertCountryObservation({
            countryId: bundle.countryId,
            sourceId: sourceDbId,
            runId: enrichmentRunId,
            fieldPath: field.fieldPath,
            valueJson: JSON.stringify({ value: field.value, summary: page.excerpt.slice(0, 400) }),
            confidence: field.confidence,
            verificationStatus: 'pending',
            sourceUrl: page.url,
            rawExcerpt: page.excerpt.slice(0, 2000),
            dedupeKey: `datafile-extract:${bundle.countryId}:${field.fieldPath}:${page.url}`,
          })
          report.observationsWritten += 1
        }
      }
    }
  }

  if (enrichmentRunId) {
    await prisma.enrichmentRun.update({
      where: { id: enrichmentRunId },
      data: {
        status: 'SUCCEEDED',
        finishedAt: new Date(),
        statsJson: JSON.stringify(report),
      },
    })
  }

  logIntelligence('info', 'datafile_bronze_to_observations_done', report)
  return report
}
