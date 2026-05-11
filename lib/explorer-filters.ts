/**
 * Single source of truth for Explorer Global list filters (region + Schengen toggle).
 * Region matching is name-based for Schengen (see lib/schengen-members), not dataset `region`.
 */

import { isSchengenMember } from '@/lib/schengen-members'

export type ExplorerRegionFilter =
  | 'all'
  | 'Schengen'
  | 'Europe'
  | 'Asia'
  | 'Africa'
  | 'Americas'
  | 'Oceania'
  /** e.g. Other when deep-linked via `?region=` */
  | (string & {})

export function normalizeExplorerDatasetRegion(region: string): string {
  return region.normalize('NFC').trim().replace(/\s+/g, ' ')
}

function regionKeysEqual(a: string, b: string): boolean {
  return (
    normalizeExplorerDatasetRegion(a).toLowerCase() === normalizeExplorerDatasetRegion(b).toLowerCase()
  )
}

/** Official Schengen membership from country display name (FR/EN aliases). */
export function explorerCountryIsSchengenMember(name: string): boolean {
  return isSchengenMember(name)
}

/**
 * Geographic region filter. Schengen uses only the canonical membership list.
 * Europe includes rows tagged `Europe` or mis-tagged `Schengen` only when the country is a real Schengen member.
 */
export function matchesExplorerRegionFilter(
  selected: ExplorerRegionFilter,
  row: { name: string; region: string },
): boolean {
  if (selected === 'all') return true
  const name = String(row.name ?? '')
  const dbRegion = String(row.region ?? '')

  if (selected === 'Schengen') {
    return explorerCountryIsSchengenMember(name)
  }

  if (selected === 'Europe') {
    return (
      regionKeysEqual(dbRegion, 'Europe') ||
      (regionKeysEqual(dbRegion, 'Schengen') && explorerCountryIsSchengenMember(name))
    )
  }

  return regionKeysEqual(dbRegion, selected)
}

export function matchesExplorerSchengenOnlyToggle(active: boolean, row: { name: string }): boolean {
  if (!active) return true
  return explorerCountryIsSchengenMember(String(row.name ?? ''))
}

const REGION_FROM_URL: Record<string, ExplorerRegionFilter> = {
  all: 'all',
  schengen: 'Schengen',
  europe: 'Europe',
  asia: 'Asia',
  africa: 'Africa',
  americas: 'Americas',
  oceania: 'Oceania',
}

/** Parse `region` query param or FilterBar value into internal Explorer region state. */
export function parseExplorerRegionFilter(v: string): ExplorerRegionFilter {
  const t = v.trim()
  if (!t || t.toLowerCase() === 'all') return 'all'
  const key = t.toLowerCase()
  if (REGION_FROM_URL[key]) return REGION_FROM_URL[key]
  return (t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()) as ExplorerRegionFilter
}

/** Value for URL query `region` (omit param entirely when `all`). */
export function explorerRegionToUrlParam(region: ExplorerRegionFilter): string {
  if (region === 'all') return 'all'
  if (region === 'Schengen') return 'schengen'
  return normalizeExplorerDatasetRegion(region).toLowerCase()
}

/** Controlled Select value in FilterBar (non-empty sentinel for “all”). */
export function explorerRegionToFilterBarValue(region: ExplorerRegionFilter): string {
  return region === 'all' ? 'all' : explorerRegionToUrlParam(region)
}
