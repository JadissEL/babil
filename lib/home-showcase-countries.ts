/**
 * Homepage “Top Countries” — derives card metrics from the same merged list as `/api/countries`
 * (`buildMergedCountriesList`), with sane fallbacks when a row is missing.
 */

import type { CountryGridItem } from '@/components/country/CountryGrid'
import { loadFallbackCountries } from '@/lib/countries-fallback'
import { countryNameMergeKey, getMergedCountriesListCached } from '@/lib/countries-prisma-merge'
import { frictionTierFromCountry, isoForCountryName, scoreToMobilityTier } from '@/lib/country-card-mappers'
import { enrichCountryApiRecord } from '@/lib/enrich-country-api'
import {
  applyPerspectiveToShowcaseItems,
  type ShowcaseVisaBreakdown,
} from '@/lib/home-showcase-perspective'

export { applyPerspectiveToShowcaseItems, type ShowcaseVisaBreakdown } from '@/lib/home-showcase-perspective'

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
    tourism: 'Medium',
    visaBreakdown: { tourism: 70, study: 70, work: 70, business: 70 },
  }
}

export async function resolveHomeShowcaseCountries(
  primarySlug?: string | null,
): Promise<CountryGridItem[]> {
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

  const items = SHOWCASE.map((template) => {
    const key = countryNameMergeKey(template.name)
    const row = mergedByName.get(key) ?? staticByName.get(key)
    if (!row) return fallbackItem(template)

    const enriched = enrichCountryApiRecord(row as Record<string, unknown>)
    const friction = frictionTierFromCountry(
      enriched.appointment_difficulty ?? enriched._difficultyLabel,
      enriched._full.friction_score,
    )
    const visaBreakdown: ShowcaseVisaBreakdown = {
      tourism: enriched._visa.tourism,
      study: enriched._visa.study,
      work: enriched._visa.work,
      business: enriched._visa.business,
    }

    const code = isoForCountryName(enriched.name) || template.fallbackCode
    const routeId = row.id

    return {
      id: `showcase-${routeId}`,
      countryRouteId: routeId,
      name: enriched.name,
      code,
      score: enriched._finalScore,
      visaScore: Math.max(
        0,
        Math.min(
          100,
          Math.round(
            (visaBreakdown.tourism +
              visaBreakdown.study +
              visaBreakdown.work +
              visaBreakdown.business) /
              4,
          ),
        ),
      ),
      friction,
      study: scoreToMobilityTier(visaBreakdown.study),
      business: scoreToMobilityTier(visaBreakdown.business),
      tourism: scoreToMobilityTier(visaBreakdown.tourism),
      work: scoreToMobilityTier(visaBreakdown.work),
      visaBreakdown,
      ...(enriched._highlightPlace ? { highlightPlace: enriched._highlightPlace } : {}),
      ...(enriched._highlightImageUrl ? { highlightImageUrl: enriched._highlightImageUrl } : {}),
    }
  })

  return applyPerspectiveToShowcaseItems(items, primarySlug)
}
