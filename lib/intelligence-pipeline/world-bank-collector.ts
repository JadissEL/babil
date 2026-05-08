import prisma from '@/lib/prisma'
import {
  FIELD_ECONOMY_GDP_USD_CURRENT,
  FIELD_ECONOMY_GDP_PER_CAPITA_USD_CURRENT,
  FIELD_GENERAL_POPULATION_TOTAL,
  FIELD_QUALITY_LIFE_EXPECTANCY_YEARS,
  FIELD_WORK_UNEMPLOYMENT_RATE_PCT,
  WORLD_BANK_INDICATORS,
} from './taxonomy-v1'
import {
  chunkIso2ForWorldBank,
  fetchWorldBankCountryIso2Map,
  fetchWorldBankLatestDataForCountriesBatch,
  resolveIso2ForBabilCountryName,
} from './world-bank-client'

const BATCH_DELAY_MS = 200
const ISO2_PER_BATCH = 40

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export type WorldBankCollectorResult = {
  observationsWritten: number
  countriesMatched: number
  countriesSkippedNoIso: number
  errors: number
  /** Nombre d’appels HTTP indicateur×lot (plus bas que 1 requête / pays / indicateur). */
  apiBatchCalls: number
}

type IndicatorSpec = {
  wbId: string
  fieldPath: string
  unit: string
  confidence: number
}

const INDICATOR_SPECS: IndicatorSpec[] = [
  {
    wbId: WORLD_BANK_INDICATORS.population,
    fieldPath: FIELD_GENERAL_POPULATION_TOTAL,
    unit: 'persons',
    confidence: 0.92,
  },
  {
    wbId: WORLD_BANK_INDICATORS.gdpUsd,
    fieldPath: FIELD_ECONOMY_GDP_USD_CURRENT,
    unit: 'current_usd',
    confidence: 0.9,
  },
  {
    wbId: WORLD_BANK_INDICATORS.gdpPerCapitaUsd,
    fieldPath: FIELD_ECONOMY_GDP_PER_CAPITA_USD_CURRENT,
    unit: 'current_usd_per_capita',
    confidence: 0.88,
  },
  {
    wbId: WORLD_BANK_INDICATORS.lifeExpectancy,
    fieldPath: FIELD_QUALITY_LIFE_EXPECTANCY_YEARS,
    unit: 'years',
    confidence: 0.9,
  },
  {
    wbId: WORLD_BANK_INDICATORS.unemploymentTotalLaborForce,
    fieldPath: FIELD_WORK_UNEMPLOYMENT_RATE_PCT,
    unit: 'percent_of_labor_force',
    confidence: 0.82,
  },
]

/**
 * Collecte indicateurs World Bank par **requêtes multi-pays** (lots ISO2), puis écrit `CountryObservation`.
 */
export async function runWorldBankCollector(
  runId: string,
  opts?: { limit?: number },
): Promise<WorldBankCollectorResult> {
  const source = await prisma.intelligenceSource.findUnique({
    where: { slug: 'world_bank_open_data' },
  })
  if (!source) {
    throw new Error('Missing IntelligenceSource world_bank_open_data — run npm run intelligence:seed-sources')
  }

  const wbMap = await fetchWorldBankCountryIso2Map()
  const countries = await prisma.country.findMany({
    orderBy: { id: 'asc' },
    ...(opts?.limit !== undefined ? { take: opts.limit } : {}),
    select: { id: true, name: true },
  })

  const resolved: Array<{ countryId: number; iso2: string }> = []
  let countriesSkippedNoIso = 0

  for (const c of countries) {
    const iso2 = resolveIso2ForBabilCountryName(c.name, wbMap)
    if (!iso2) {
      countriesSkippedNoIso += 1
      continue
    }
    resolved.push({ countryId: c.id, iso2 })
  }

  const countriesMatched = resolved.length
  const uniqueIso2 = Array.from(new Set(resolved.map((r) => r.iso2)))
  const isoChunks = chunkIso2ForWorldBank(uniqueIso2, ISO2_PER_BATCH)

  let observationsWritten = 0
  let errors = 0
  let apiBatchCalls = 0
  const observedAt = new Date()

  for (const spec of INDICATOR_SPECS) {
    for (const chunk of isoChunks) {
      try {
        await sleep(BATCH_DELAY_MS)
        apiBatchCalls += 1
        const dataMap = await fetchWorldBankLatestDataForCountriesBatch(chunk, spec.wbId)
        const chunkSet = new Set(chunk)
        for (const { countryId, iso2 } of resolved) {
          if (!chunkSet.has(iso2)) continue
          const d = dataMap.get(iso2)
          if (!d || d.value == null || !Number.isFinite(d.value)) continue

          await prisma.countryObservation.create({
            data: {
              countryId,
              fieldPath: spec.fieldPath,
              valueJson: JSON.stringify({
                value: d.value,
                year: Number(d.date),
                indicator: spec.wbId,
                iso2,
              }),
              valueNumeric: d.value,
              unit: spec.unit,
              confidence: spec.confidence,
              observedAt,
              sourceId: source.id,
              runId,
              rawPayload: JSON.stringify({ wb: d }),
            },
          })
          observationsWritten += 1
        }
      } catch {
        errors += 1
      }
    }
  }

  return {
    observationsWritten,
    countriesMatched,
    countriesSkippedNoIso,
    errors,
    apiBatchCalls,
  }
}
