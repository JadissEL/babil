import prisma from '@/lib/prisma';
import { capObservationRawPayloadJson } from './observation-raw-payload';
import { isIntelligenceSourceCollectionEnabled } from './source-collection-flags';
import {
  FIELD_DEMOGRAPHICS_URBAN_POPULATION_PCT,
  FIELD_ECONOMY_GDP_USD_CURRENT,
  FIELD_ECONOMY_GDP_PER_CAPITA_USD_CURRENT,
  FIELD_GENERAL_POPULATION_TOTAL,
  FIELD_QUALITY_LIFE_EXPECTANCY_YEARS,
  FIELD_WORK_UNEMPLOYMENT_RATE_PCT,
  WORLD_BANK_INDICATORS,
} from './taxonomy-v1';
import {
  chunkIso2ForWorldBank,
  fetchWorldBankCountryIso2Map,
  fetchWorldBankLatestDataForCountriesBatch,
  resolveIso2ForBabilCountryName,
} from './world-bank-client';
import { worldBankObservationDedupeKey } from './world-bank-dedupe';

const BATCH_DELAY_MS = 200;
const ISO2_PER_BATCH = 40;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export type WorldBankCollectorResult = {
  observationsWritten: number;
  countriesMatched: number;
  countriesSkippedNoIso: number;
  errors: number;
  /** Nombre d’appels HTTP indicateur×lot (plus bas que 1 requête / pays / indicateur). */
  apiBatchCalls: number;
  /** C.52 — collecte désactivée par `INTELLIGENCE_SOURCE_DISABLED_SLUGS`. */
  skippedByConfig?: boolean;
  skipReason?: string;
};

type IndicatorSpec = {
  wbId: string;
  fieldPath: string;
  unit: string;
  confidence: number;
};

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
  {
    wbId: WORLD_BANK_INDICATORS.urbanPopulationPct,
    fieldPath: FIELD_DEMOGRAPHICS_URBAN_POPULATION_PCT,
    unit: 'percent_of_total_population',
    confidence: 0.85,
  },
];

/**
 * Collecte indicateurs World Bank par **requêtes multi-pays** (lots ISO2), puis écrit `CountryObservation`.
 */
export async function runWorldBankCollector(
  runId: string,
  opts?: { limit?: number },
): Promise<WorldBankCollectorResult> {
  if (!isIntelligenceSourceCollectionEnabled('world_bank_open_data')) {
    return {
      observationsWritten: 0,
      countriesMatched: 0,
      countriesSkippedNoIso: 0,
      errors: 0,
      apiBatchCalls: 0,
      skippedByConfig: true,
      skipReason:
        'Collecte World Bank désactivée (slug dans INTELLIGENCE_SOURCE_DISABLED_SLUGS). Aucun appel réseau.',
    };
  }

  const source = await prisma.intelligenceSource.findUnique({
    where: { slug: 'world_bank_open_data' },
  });
  if (!source) {
    throw new Error(
      'Missing IntelligenceSource world_bank_open_data — run npm run intelligence:seed-sources',
    );
  }

  const wbMap = await fetchWorldBankCountryIso2Map();
  const countries = await prisma.country.findMany({
    orderBy: { id: 'asc' },
    ...(opts?.limit !== undefined ? { take: opts.limit } : {}),
    select: { id: true, name: true },
  });

  const resolved: Array<{ countryId: number; iso2: string }> = [];
  let countriesSkippedNoIso = 0;

  for (const c of countries) {
    const iso2 = resolveIso2ForBabilCountryName(c.name, wbMap);
    if (!iso2) {
      countriesSkippedNoIso += 1;
      continue;
    }
    resolved.push({ countryId: c.id, iso2 });
  }

  const countriesMatched = resolved.length;
  const uniqueIso2 = Array.from(new Set(resolved.map((r) => r.iso2)));
  const isoChunks = chunkIso2ForWorldBank(uniqueIso2, ISO2_PER_BATCH);

  let observationsWritten = 0;
  let errors = 0;
  let apiBatchCalls = 0;
  const observedAt = new Date();

  for (const spec of INDICATOR_SPECS) {
    for (const chunk of isoChunks) {
      try {
        await sleep(BATCH_DELAY_MS);
        apiBatchCalls += 1;
        const dataMap = await fetchWorldBankLatestDataForCountriesBatch(chunk, spec.wbId);
        const chunkSet = new Set(chunk);
        for (const { countryId, iso2 } of resolved) {
          if (!chunkSet.has(iso2)) continue;
          const d = dataMap.get(iso2);
          if (!d || d.value == null || !Number.isFinite(d.value)) continue;

          const dedupeKey = worldBankObservationDedupeKey(spec.wbId, iso2, d.date);
          const rawPayload = capObservationRawPayloadJson(JSON.stringify({ wb: d }));

          await prisma.countryObservation.upsert({
            where: { dedupeKey },
            create: {
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
              rawPayload,
              dedupeKey,
              verificationStatus: 'estimated',
              sourcesConfirmed: 1,
            },
            update: {
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
              runId,
              rawPayload,
              verificationStatus: 'estimated',
            },
          });
          observationsWritten += 1;
        }
      } catch {
        errors += 1;
      }
    }
  }

  return {
    observationsWritten,
    countriesMatched,
    countriesSkippedNoIso,
    errors,
    apiBatchCalls,
  };
}
