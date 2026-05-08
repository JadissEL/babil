import prisma from '@/lib/prisma'
import {
  FIELD_ECONOMY_GDP_USD_CURRENT,
  FIELD_GENERAL_POPULATION_TOTAL,
  WORLD_BANK_INDICATORS,
} from './taxonomy-v1'
import {
  fetchWorldBankCountryIso2Map,
  fetchWorldBankLatestDatum,
  resolveIso2ForBabilCountryName,
} from './world-bank-client'

const DELAY_MS = 120

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export type WorldBankCollectorResult = {
  observationsWritten: number
  countriesMatched: number
  countriesSkippedNoIso: number
  errors: number
}

/**
 * Collecte population + PIB nominal (USD) depuis l’API World Bank pour chaque pays en base.
 * Écrit des `CountryObservation` (append-only). Idempotent côté données : nouvelle ligne par run.
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

  let observationsWritten = 0
  let countriesMatched = 0
  let countriesSkippedNoIso = 0
  let errors = 0
  const observedAt = new Date()

  for (const c of countries) {
    const iso2 = resolveIso2ForBabilCountryName(c.name, wbMap)
    if (!iso2) {
      countriesSkippedNoIso += 1
      continue
    }
    countriesMatched += 1

    try {
      await sleep(DELAY_MS)
      const pop = await fetchWorldBankLatestDatum(iso2, WORLD_BANK_INDICATORS.population)
      await sleep(DELAY_MS)
      const gdp = await fetchWorldBankLatestDatum(iso2, WORLD_BANK_INDICATORS.gdpUsd)

      if (pop && pop.value != null && Number.isFinite(pop.value)) {
        await prisma.countryObservation.create({
          data: {
            countryId: c.id,
            fieldPath: FIELD_GENERAL_POPULATION_TOTAL,
            valueJson: JSON.stringify({
              value: pop.value,
              year: Number(pop.date),
              indicator: WORLD_BANK_INDICATORS.population,
              iso2,
            }),
            valueNumeric: pop.value,
            unit: 'persons',
            confidence: 0.92,
            observedAt,
            sourceId: source.id,
            runId,
            rawPayload: JSON.stringify({ wb: pop }),
          },
        })
        observationsWritten += 1
      }

      if (gdp && gdp.value != null && Number.isFinite(gdp.value)) {
        await prisma.countryObservation.create({
          data: {
            countryId: c.id,
            fieldPath: FIELD_ECONOMY_GDP_USD_CURRENT,
            valueJson: JSON.stringify({
              value: gdp.value,
              year: Number(gdp.date),
              indicator: WORLD_BANK_INDICATORS.gdpUsd,
              iso2,
            }),
            valueNumeric: gdp.value,
            unit: 'current_usd',
            confidence: 0.9,
            observedAt,
            sourceId: source.id,
            runId,
            rawPayload: JSON.stringify({ wb: gdp }),
          },
        })
        observationsWritten += 1
      }
    } catch {
      errors += 1
    }
  }

  return {
    observationsWritten,
    countriesMatched,
    countriesSkippedNoIso,
    errors,
  }
}
