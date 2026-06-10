/**
 * Per-country manifest fetch (visa categories) + rule/LLM extraction → contract field observations.
 */

import { runManifestUrlFetchBatch } from '@/lib/agent-manifest-source-fetch'
import { loadRunMemory, saveRunMemory, orchestrationSlugForCountry } from '@/lib/agent-run-memory'
import { slugFromDatafileId } from '@/lib/datafile/load-master-list'
import { extractFieldsFromExcerpt } from '@/lib/datafile/extract/field-extractors'
import { focusVisaText, normalizeExcerpt } from '@/lib/datafile/extract/html-to-text'
import { llmFillFieldGaps } from '@/lib/datafile/extract/llm-fill-gaps'
import { resolveLlmBudget } from '@/lib/datafile/extract/resolve-llm-budget'
import { resolveSourceSlugForManifestLabel } from '@/lib/intelligence-manifest-source-bridge'
import { upsertCountryObservation } from '@/lib/intelligence-pipeline/observation-writer'
import { logIntelligence } from '@/lib/intelligence-pipeline/intelligence-log'
import prisma from '@/lib/prisma'
import { assertProdWritesAllowed } from '@/lib/prod-write-guard'
import { MOROCCO_CORRIDOR_DESTINATION_NAMES } from '@/lib/datafile/extract/morocco-corridor-destinations'

const VISA_CATEGORY_IDS = ['visa_immigration', 'morocco_visa_corridor'] as const

const STRUCTURED_FIELD_PATHS = [
  'visa_processing_time',
  'full_data.appointment_audit.avg_wait_time',
  'full_data.friction_analysis.real_delay',
  'full_data.visa_system.tourism.fees',
  'appointment_difficulty',
]

export type ManifestVisaExtractOptions = {
  countryIds?: number[]
  schengenOnly?: boolean
  /** When true, process every country (optional limit). */
  allCountries?: boolean
  /** Morocco corridor: France, Spain, Canada, UK, US, etc. */
  moroccoCorridor?: boolean
  limit?: number
  writeDb?: boolean
  llmFill?: boolean
  llmTokenBudget?: number
  manifestBatchSize?: number
}

function verificationForField(confidence: number): 'pending' | 'estimated' | 'needs_review' {
  if (confidence >= 0.65) return 'estimated'
  if (confidence >= 0.5) return 'needs_review'
  return 'pending'
}

export type ManifestVisaExtractReport = {
  countriesProcessed: number
  fetchesOk: number
  observationsWritten: number
  sourcesUnresolved: number
  llmCalls: number
  llmSkipReason?: string
  byFieldPath: Record<string, number>
}

function slugifyLabel(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 72)
}

async function resolveSourceIdForLabel(sourceLabel: string): Promise<string | null> {
  const slugCandidates = [
    resolveSourceSlugForManifestLabel(sourceLabel),
    slugFromDatafileId(slugifyLabel(sourceLabel)),
    `manifest_${slugifyLabel(sourceLabel)}`,
  ]
  for (const slug of slugCandidates) {
    const row = await prisma.intelligenceSource.findUnique({ where: { slug }, select: { id: true } })
    if (row) return row.id
  }
  const byName = await prisma.intelligenceSource.findFirst({
    where: { name: { equals: sourceLabel, mode: 'insensitive' } },
    select: { id: true },
  })
  if (byName) return byName.id

  // New manifest labels (e.g. Wikipedia Visa Policy) get a reference-tier source row.
  const created = await prisma.intelligenceSource.upsert({
    where: { slug: `manifest_${slugifyLabel(sourceLabel)}` },
    update: {},
    create: {
      slug: `manifest_${slugifyLabel(sourceLabel)}`,
      name: sourceLabel,
      tier: 'TIER_C_CURATED',
      licenseNote: 'auto-created from manifest visa extraction label',
    },
    select: { id: true },
  })
  return created.id
}

export async function runManifestVisaExtraction(
  opts: ManifestVisaExtractOptions,
): Promise<ManifestVisaExtractReport> {
  if (opts.writeDb) assertProdWritesAllowed('datafile:manifest-visa-extract')

  const llm = resolveLlmBudget({ llmFill: !!opts.llmFill, explicitBudget: opts.llmTokenBudget })

  let countries = await prisma.country.findMany({
    select: { id: true, name: true, region: true, schengen_flag: true },
    ...(opts.countryIds?.length ? { where: { id: { in: opts.countryIds } } } : {}),
  })

  if (opts.moroccoCorridor) {
    const want = new Set(
      MOROCCO_CORRIDOR_DESTINATION_NAMES.map((n) => n.toLowerCase()),
    )
    countries = countries.filter((c) => want.has(c.name.toLowerCase()))
  } else if (opts.schengenOnly) {
    countries = countries.filter((c) => c.schengen_flag)
  } else if (!opts.countryIds?.length && !opts.allCountries) {
    countries = countries.filter((c) => c.schengen_flag)
  }
  if (opts.limit != null) countries = countries.slice(0, opts.limit)

  let enrichmentRunId: string | undefined
  if (opts.writeDb) {
    const run = await prisma.enrichmentRun.create({
      data: { status: 'RUNNING', trigger: 'datafile:manifest-visa-extract' },
    })
    enrichmentRunId = run.id
  }

  const report: ManifestVisaExtractReport = {
    countriesProcessed: 0,
    fetchesOk: 0,
    observationsWritten: 0,
    sourcesUnresolved: 0,
    llmCalls: 0,
    llmSkipReason: llm.skipReason,
    byFieldPath: {},
  }

  for (const country of countries) {
    report.countriesProcessed += 1
    const mem = await loadRunMemory(country.name)
    const batch = await runManifestUrlFetchBatch({
      country: country.name,
      region: country.region,
      memory: mem,
      perCycle: opts.manifestBatchSize ?? 18,
      categoryIds: [...VISA_CATEGORY_IDS],
      refetchTtlMs: Number(process.env.DATAFILE_MANIFEST_REFETCH_TTL_MS ?? 0),
      logVerbose: () => {},
    })
    await saveRunMemory(mem)

    for (const item of batch.results) {
      if (!item.ok || !item.excerpt || item.excerpt.length < 80) continue
      const text = focusVisaText(normalizeExcerpt(item.excerpt))
      if (text.length < 80) continue
      report.fetchesOk += 1

      const sourceId = opts.writeDb ? await resolveSourceIdForLabel(item.sourceLabel) : null
      if (opts.writeDb && !sourceId) {
        report.sourcesUnresolved += 1
        continue
      }

      let fields = extractFieldsFromExcerpt(text, 'visa')

      if (fields.length === 0 && llm.enabled) {
        report.llmCalls += 1
        const llmFields = await llmFillFieldGaps(
          {
            countryName: country.name,
            excerpt: text,
            candidateFieldPaths: STRUCTURED_FIELD_PATHS,
          },
          llm.budget,
        )
        fields = llmFields.map((f) => ({
          fieldPath: f.fieldPath,
          value: f.value,
          confidence: f.confidence,
        }))
      }

      // No excerpt fallback: low-confidence snippet rows dilute field consensus
      // and block promotion of curated/LLM values. Pages without extractable
      // facts simply contribute nothing.

      for (const field of fields) {
        report.byFieldPath[field.fieldPath] = (report.byFieldPath[field.fieldPath] ?? 0) + 1
        if (!opts.writeDb || !sourceId || !enrichmentRunId) continue

        await upsertCountryObservation({
          countryId: country.id,
          sourceId,
          runId: enrichmentRunId,
          fieldPath: field.fieldPath,
          valueJson: JSON.stringify({
            value: field.value,
            summary: text.slice(0, 400),
            source: 'manifest_visa_extract',
          }),
          confidence: field.confidence,
          verificationStatus: verificationForField(field.confidence),
          sourceUrl: item.url,
          rawExcerpt: text.slice(0, 2000),
          dedupeKey: `manifest-visa:${country.id}:${field.fieldPath}:${orchestrationSlugForCountry(country.name)}:${item.sourceLabel}`,
        })
        report.observationsWritten += 1
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

  logIntelligence('info', 'datafile_manifest_visa_extract_done', report)
  return report
}
