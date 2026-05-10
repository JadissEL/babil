/**
 * Homepage “Top Countries” — derives card metrics from the same merged list as `/api/countries`
 * (`buildMergedCountriesList`), with sane fallbacks when a row is missing.
 */

import type { CountryGridItem } from '@/components/country/CountryGrid'
import { loadFallbackCountries } from '@/lib/countries-fallback'
import { countryNameMergeKey, getMergedCountriesListCached } from '@/lib/countries-prisma-merge'
import { frictionTierFromCountry, isoForCountryName, scoreToMobilityTier } from '@/lib/country-card-mappers'
import { enrichCountryApiRecord } from '@/lib/enrich-country-api'

/** Curated spotlight destinations (names must match `data/countries.json` / DB `Country.name`). */
export const SHOWCASE: { name: string; fallbackCode: string }[] = [
  { name: 'France', fallbackCode: 'fr' },
  { name: 'Canada', fallbackCode: 'ca' },
  { name: 'Germany', fallbackCode: 'de' },
  { name: 'Japan', fallbackCode: 'jp' },
  { name: 'United Kingdom', fallbackCode: 'gb' },
]

export const HOMEPAGE_SHOWCASE_NAMES = SHOWCASE.map((s) => s.name)

function fallbackItem(template: (typeof SHOWCASE)[number]): CountryGridItem {
  return {
    id: `${template.fallbackCode}-showcase`,
    name: template.name,
    code: isoForCountryName(template.name) || template.fallbackCode,
    score: 72,
    visaScore: 70,
    friction: 'Medium',
    study: 'Medium',
    business: 'Medium',
  }
}

export async function resolveHomeShowcaseCountries(): Promise<CountryGridItem[]> {
  let merged: Awaited<ReturnType<typeof getMergedCountriesListCached>> = []
  let staticRows: Awaited<ReturnType<typeof loadFallbackCountries>> = []
  try {
    merged = await getMergedCountriesListCached()
  } catch {
    merged = []
  }
  try {
    staticRows = await loadFallbackCountries()
  } catch {
    staticRows = []
  }

  const mergedByName = new Map(merged.map((c) => [countryNameMergeKey(c.name), c]))
  const staticByName = new Map(staticRows.map((c) => [countryNameMergeKey(c.name), c]))

  return SHOWCASE.map((template) => {
    const key = countryNameMergeKey(template.name)
    const row = mergedByName.get(key) ?? staticByName.get(key)
    if (!row) return fallbackItem(template)

    const enriched = enrichCountryApiRecord(row as Record<string, unknown>)
    const friction = frictionTierFromCountry(
      enriched.appointment_difficulty ?? enriched._difficultyLabel,
      enriched._full.friction_score,
    )
    const visaAvg = Math.round(
      (enriched._visa.tourism +
        enriched._visa.study +
        enriched._visa.work +
        enriched._visa.business) /
        4,
    )

    const code = isoForCountryName(enriched.name) || template.fallbackCode
    const routeId = row.id

    return {
      id: `showcase-${routeId}`,
      countryRouteId: routeId,
      name: enriched.name,
      code,
      score: enriched._finalScore,
      visaScore: Math.max(0, Math.min(100, visaAvg)),
      friction,
      study: scoreToMobilityTier(enriched._visa.study),
      business: scoreToMobilityTier(enriched._visa.business),
      ...(enriched._highlightPlace ? { highlightPlace: enriched._highlightPlace } : {}),
      ...(enriched._highlightImageUrl ? { highlightImageUrl: enriched._highlightImageUrl } : {}),
    }
  })
}
