/**
 * Infer countryId from scraped page URL, title, and excerpt.
 */

import { orchestrationSlugForCountry } from '@/lib/agent-run-memory'
import { iso2ForCountryNameOrEmpty } from '@/lib/country-card-mappers'
import { schengenNormalizedNameKey } from '@/lib/schengen-members'

export type CountryLookupRow = {
  id: number
  name: string
  slug: string
  iso2: string
  normName: string
}

export function buildCountryLookup(rows: { id: number; name: string }[]): CountryLookupRow[] {
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: orchestrationSlugForCountry(r.name),
    iso2: iso2ForCountryNameOrEmpty(r.name),
    normName: schengenNormalizedNameKey(r.name),
  }))
}

const URL_COUNTRY_PATTERNS = [
  /\/country\/([a-z]{2,3})(?:\/|$|\?)/i,
  /\/countries\/([a-z][a-z-]+)(?:\/|$|\?)/i,
  /country=([A-Za-z+%20-]+)/i,
  /\/wiki\/([A-Za-z_%()-]+)/i,
  /\/en\/Countries\/([A-Za-z-]+)/i,
  /\/name\/([A-Za-z%20-]+)/i,
]

function tokenInText(token: string, haystack: string): boolean {
  if (!token || token.length < 3) return false
  const norm = schengenNormalizedNameKey(haystack)
  const t = schengenNormalizedNameKey(token)
  return norm.includes(t) || t.includes(norm)
}

/** Match a single page to zero or more country IDs. */
/** Host / source-name hints for corridor sites (visa portals without country in URL). */
const HOST_COUNTRY_HINTS: Record<string, string[]> = {
  'france-visas.gouv.fr': ['France'],
  'france-visas': ['France'],
  'vfsglobal.com': [],
  'tlscontact.com': [],
  'campusfrance.org': ['France'],
  'gov.uk': ['United Kingdom', 'UK'],
  'canada.ca': ['Canada'],
  'uscis.gov': ['United States', 'USA'],
  'homeaffairs.gov.au': ['Australia'],
  'immigration.govt.nz': ['New Zealand'],
}

export function matchCountriesFromSourceHint(
  lookup: CountryLookupRow[],
  sourceName: string,
  baseUrl: string,
): number[] {
  const hits = new Set<number>()
  let host = ''
  try {
    host = new URL(baseUrl).hostname.toLowerCase()
  } catch {
    /* ignore */
  }

  const names =
    HOST_COUNTRY_HINTS[host] ??
    HOST_COUNTRY_HINTS[host.replace(/^www\./, '')] ??
    (() => {
      const n = sourceName.toLowerCase()
      if (n.includes('france')) return ['France']
      if (n.includes('canada') || n.includes('ircc')) return ['Canada']
      if (n.includes('uk ') || n.includes('united kingdom') || n.includes('britain'))
        return ['United Kingdom']
      if (n.includes('germany') || n.includes('allemagne')) return ['Germany']
      if (n.includes('spain') || n.includes('espagne')) return ['Spain']
      if (n.includes('italy') || n.includes('italie')) return ['Italy']
      return []
    })()

  for (const label of names) {
    for (const row of lookup) {
      if (tokenInText(label, row.name)) hits.add(row.id)
    }
  }
  return [...hits]
}

export function isLowSignalScrapePage(url: string, excerpt: string | null): boolean {
  if (/sitemap\.xml/i.test(url)) return true
  if (!excerpt) return true
  if (excerpt.length < 80) return true
  const urlCount = (excerpt.match(/https?:\/\//gi) ?? []).length
  return urlCount >= 5
}

export function matchCountriesFromPage(
  lookup: CountryLookupRow[],
  args: { url: string; title?: string | null; excerpt?: string | null },
): number[] {
  const hits = new Set<number>()
  const url = args.url
  const text = `${args.title ?? ''} ${args.excerpt ?? ''}`.slice(0, 8000)

  for (const re of URL_COUNTRY_PATTERNS) {
    const m = re.exec(url)
    if (!m?.[1]) continue
    const raw = decodeURIComponent(m[1].replace(/\+/g, ' ')).toLowerCase()
    for (const row of lookup) {
      if (row.iso2 && raw === row.iso2) hits.add(row.id)
      if (raw === row.slug || raw.replace(/-/g, ' ') === row.normName) hits.add(row.id)
      if (tokenInText(raw, row.name)) hits.add(row.id)
    }
  }

  if (hits.size === 0 && text.length > 20) {
    for (const row of lookup) {
      if (tokenInText(row.name, text)) hits.add(row.id)
    }
  }

  return [...hits].slice(0, 3)
}
