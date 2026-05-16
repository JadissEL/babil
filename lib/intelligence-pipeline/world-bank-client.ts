import { iso2ForCountryNameOrEmpty } from '@/lib/country-card-mappers'
import { intelligencePipelineFetch } from '@/lib/intelligence-pipeline/http-fetch'
import { schengenCanonicalEnglishName } from '@/lib/schengen-members'
import { iso2FromIntelligenceOverride } from './country-iso-overrides'
import { normalizeCountryMatchKey } from './country-match-key'

type WbCountryRow = {
  id: string
  iso2Code: string
  name: string
  capitalCity?: string
  region?: { id: string; value: string }
}

/**
 * Télécharge le répertoire pays World Bank (API officielle, sans clé).
 * Exclut les entrées sans code ISO2 valide.
 */
export async function fetchWorldBankCountryIso2Map(): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  let page = 1
  const maxPages = 30
  for (; page <= maxPages; page += 1) {
    const url = `https://api.worldbank.org/v2/country?format=json&per_page=100&page=${page}`
    const res = await intelligencePipelineFetch(url)
    if (!res.ok) throw new Error(`World Bank country list HTTP ${res.status}`)
    const data = (await res.json()) as [unknown, WbCountryRow[] | null]
    const rows = data[1]
    if (!rows || rows.length === 0) break
    for (const c of rows) {
      const iso2 = (c.iso2Code ?? '').trim().toLowerCase()
      if (iso2.length !== 2) continue
      const id = (c.id ?? '').trim().toUpperCase()
      if (id === 'WLD' || id === 'EUU') continue
      map.set(normalizeCountryMatchKey(c.name), iso2)
    }
  }
  return map
}

/**
 * Résout ISO2 World Bank pour un nom tel qu’en base Babil (FR/EN, Schengen canonique, répertoire WB).
 */
export function resolveIso2ForBabilCountryName(
  name: string,
  wbByNormalizedName: Map<string, string>,
): string | null {
  const fromCard = iso2ForCountryNameOrEmpty(name)
  if (fromCard) return fromCard

  const fromOverride = iso2FromIntelligenceOverride(name)
  if (fromOverride) return fromOverride

  const direct = wbByNormalizedName.get(normalizeCountryMatchKey(name))
  if (direct) return direct

  const canon = schengenCanonicalEnglishName(name)
  if (canon) {
    const fromCanon = wbByNormalizedName.get(normalizeCountryMatchKey(canon))
    if (fromCanon) return fromCanon
  }

  return null
}

export type WbDatum = { value: number | null; date: string }

type WbIndicatorObservationRow = {
  country?: { id?: string }
  date: string
  value: number | null
}

/** Parse la liste d’observations WB (multi-pays) en carte ISO2 minuscule → dernière valeur **numérique**. */
export function wbBatchRowsToDatumMap(rows: WbIndicatorObservationRow[]): Map<string, WbDatum> {
  const byId = new Map<string, WbIndicatorObservationRow[]>()
  for (const row of rows) {
    const id = row.country?.id?.trim().toLowerCase()
    if (!id || id.length !== 2) continue
    const list = byId.get(id) ?? []
    list.push(row)
    byId.set(id, list)
  }
  const out = new Map<string, WbDatum>()
  for (const [id, list] of Array.from(byId.entries())) {
    const withValue = list.find((r) => typeof r.value === 'number' && Number.isFinite(r.value))
    if (withValue) {
      out.set(id, { value: withValue.value, date: withValue.date })
    }
  }
  return out
}

/**
 * Une requête pour plusieurs pays (codes ISO2) et un indicateur — `MRV=n` (n dernières années par pays ; voir {@link wbBatchRowsToDatumMap} pour sauter les valeurs nulles provisionnelles).
 * @see https://datahelpdesk.worldbank.org/knowledgebase/articles/898581
 */
export async function fetchWorldBankLatestDataForCountriesBatch(
  iso2LowercaseList: readonly string[],
  indicator: string,
): Promise<Map<string, WbDatum>> {
  if (iso2LowercaseList.length === 0) return new Map()
  const codes = iso2LowercaseList.map((c) => c.trim().toUpperCase()).join(';')
  const mrv = 20
  const url = `https://api.worldbank.org/v2/country/${codes}/indicator/${encodeURIComponent(indicator)}?format=json&per_page=20000&MRV=${mrv}`
  const res = await intelligencePipelineFetch(url)
  if (!res.ok) throw new Error(`World Bank batch ${indicator} HTTP ${res.status}`)
  const data = (await res.json()) as [unknown, WbIndicatorObservationRow[] | null]
  const rows = data[1] ?? []
  return wbBatchRowsToDatumMap(rows)
}

export function chunkIso2ForWorldBank(iso2List: readonly string[], maxPerChunk = 40): string[][] {
  const chunks: string[][] = []
  for (let i = 0; i < iso2List.length; i += maxPerChunk) {
    chunks.push(iso2List.slice(i, i + maxPerChunk))
  }
  return chunks
}

/** Dernière valeur **numérique** disponible (la série WB peut avoir une année récente avec `value: null` provisionnel). */
export async function fetchWorldBankLatestDatum(
  iso2: string,
  indicator: string,
): Promise<WbDatum | null> {
  const cc = iso2.trim().toLowerCase()
  const perPage = 40
  const url = `https://api.worldbank.org/v2/country/${encodeURIComponent(cc)}/indicator/${encodeURIComponent(indicator)}?format=json&per_page=${perPage}`
  const res = await intelligencePipelineFetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as [
    { page: number; pages: number },
    Array<{ value: number | null; date: string; indicator?: { id: string; value: string } }> | null,
  ]
  const rows = data[1] ?? []
  for (const row of rows) {
    if (typeof row.value === 'number' && Number.isFinite(row.value)) {
      return { value: row.value, date: row.date }
    }
  }
  return null
}

export { normalizeCountryMatchKey } from './country-match-key'
