import { explorerCountryIsSchengenMember } from '@/lib/explorer-filters'
import type { ExplorerRegionFilter } from '@/lib/explorer-filters'

/** Couleurs Stitch PAGE 02 (Atlas) — réutilisées côté Tailwind via `style` ou classes arbitraires. */
export const ATLAS_NAVY = '#0D1B3E'
export const ATLAS_CREAM = '#FDFBF4'

const REGION_LOWER_TO_FR: Record<string, string> = {
  europe: 'Europe',
  asia: 'Asie',
  africa: 'Afrique',
  americas: 'Amériques',
  oceania: 'Océanie',
  schengen: 'Schengen',
}

/**
 * Libellé catégorie carte type Stitch : Schengen si pays membre, sinon zone FR.
 */
export function atlasCategoryLabel(name: string, region: string): string {
  if (explorerCountryIsSchengenMember(String(name ?? ''))) return 'Schengen'
  const db = String(region ?? '').trim()
  const fr = REGION_LOWER_TO_FR[db.toLowerCase()]
  return fr ?? (db || '—')
}

/**
 * Délai visa affiché (jours) : extrait `visa_processing_time` du full_data si possible, sinon valeur stable par id.
 */
export function atlasVisaDelayDays(full: Record<string, unknown>, countryId: number): number {
  const raw = full.visa_processing_time
  if (typeof raw === 'string') {
    const t = raw.trim()
    if (!t || /unknown|n\/a|—/i.test(t)) {
      /* fall through */
    } else {
      const first = t.match(/\d+/)
      if (first) {
        const n = parseInt(first[0]!, 10)
        if (Number.isFinite(n)) return Math.min(120, Math.max(1, n))
      }
    }
  }
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return Math.min(120, Math.max(1, Math.round(raw)))
  }
  const id = Number.isFinite(countryId) ? Math.abs(countryId) : 0
  return 12 + (id % 35)
}

/** Région filtre → clé bucket affichée dans la strip 4 tuiles (Europe, Amériques, Asie, Océanie). */
export function explorerRegionToAtlasScoreBucketKey(region: ExplorerRegionFilter): string | null {
  if (region === 'Europe') return 'europe'
  if (region === 'Americas') return 'americas'
  if (region === 'Asia') return 'asia'
  if (region === 'Oceania') return 'oceania'
  return null
}
