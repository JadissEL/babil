import { parseCountryFullData } from '@/lib/country-full-data-json'
import { appendFullDataChangelog } from '@/lib/full-data-changelog'
import prisma from '@/lib/prisma'
import { setDeep } from './merge-observations'
import { INTELLIGENCE_TAXONOMY_VERSION, MATERIALIZE_TARGETS } from './taxonomy-v1'

/**
 * Applique les dernières observations intelligence (économie, population WB, espérance de vie, etc.)
 * définies dans `MATERIALIZE_TARGETS` vers `full_data`.
 */
export async function materializeEconomyObservationsForCountry(countryId: number): Promise<boolean> {
  const paths = Object.keys(MATERIALIZE_TARGETS)
  const obs = await prisma.countryObservation.findMany({
    where: { countryId, fieldPath: { in: paths } },
    orderBy: { observedAt: 'desc' },
  })
  const best = new Map<string, (typeof obs)[0]>()
  for (const o of obs) {
    if (!best.has(o.fieldPath)) best.set(o.fieldPath, o)
  }
  if (best.size === 0) return false

  const row = await prisma.country.findUnique({ where: { id: countryId } })
  if (!row) return false

  const full = parseCountryFullData(row.full_data)
  let changed = false
  best.forEach((o, fieldPath) => {
    const target = MATERIALIZE_TARGETS[fieldPath]
    if (!target || target.kind !== 'number') return
    let num = o.valueNumeric
    if (num == null || !Number.isFinite(num)) {
      try {
        const j = JSON.parse(o.valueJson) as { value?: number }
        if (typeof j.value === 'number' && Number.isFinite(j.value)) num = j.value
      } catch {
        return
      }
    }
    if (num == null || !Number.isFinite(num)) return
    setDeep(full, target.fullDataPath, num)
    changed = true
  })
  if (!changed) return false

  setDeep(full, '_intelligence.economy_materialized_at', new Date().toISOString())
  setDeep(full, '_intelligence.taxonomy', INTELLIGENCE_TAXONOMY_VERSION)

  const appliedPaths = Array.from(best.keys()).join(',')
  const withChangelog = appendFullDataChangelog(full, {
    actor: 'pipeline',
    action: 'intelligence.materialize_economy',
    detail: appliedPaths || 'none',
  })

  await prisma.country.update({
    where: { id: countryId },
    data: { full_data: JSON.stringify(withChangelog) },
  })
  return true
}

export async function materializeEconomyObservationsForAllCountries(): Promise<{ updated: number }> {
  const rows = await prisma.country.findMany({ select: { id: true } })
  let updated = 0
  for (const r of rows) {
    if (await materializeEconomyObservationsForCountry(r.id)) updated += 1
  }
  return { updated }
}
