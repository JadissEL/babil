import { schengenCanonicalEnglishName } from '@/lib/schengen-members'
import { iso2ForCountryNameOrEmpty } from '@/lib/country-card-mappers'

/** Clé stable pour rapprocher un nom pays Babil avec le répertoire World Bank (anglais). */
export function normalizeCountryMatchKey(name: string): string {
  return name
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

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
    const res = await fetch(url)
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

/** Dernière valeur disponible pour un indicateur (MRV = most recent values). */
export async function fetchWorldBankLatestDatum(
  iso2: string,
  indicator: string,
): Promise<WbDatum | null> {
  const cc = iso2.trim().toLowerCase()
  const url = `https://api.worldbank.org/v2/country/${encodeURIComponent(cc)}/indicator/${encodeURIComponent(indicator)}?format=json&per_page=1&MRV=1`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = (await res.json()) as [
    { page: number; pages: number },
    Array<{ value: number | null; date: string; indicator?: { id: string; value: string } }> | null,
  ]
  const row = data[1]?.[0]
  if (!row) return null
  return { value: row.value, date: row.date }
}
