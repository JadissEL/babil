
import type { CompareKpiColumnKey } from '@/lib/compare-objectives'
import {
  buildKpiCells,
  objectiveWeightedScore,
  type CompareObjectiveDefinition,
} from '@/lib/compare-objectives'
import { isoForCountryName } from '@/lib/country-card-mappers'
import type { EnrichedCountryApi } from '@/lib/enrich-country-api'

export type CompareKpiCell = {
  key: CompareKpiColumnKey
  header: string
  tooltip: string
  value: string
}

export type CompareRow = {
  id: number
  name: string
  code: string
  /** Score 0–100 pour l’objectif choisi (poids configurables). */
  composite: number
  kpis: CompareKpiCell[]
}

export function enrichedToCompareRow(
  c: EnrichedCountryApi,
  objective: CompareObjectiveDefinition,
): CompareRow {
  return {
    id: c.id,
    name: c.name,
    code: isoForCountryName(c.name),
    composite: objectiveWeightedScore(c, objective),
    kpis: buildKpiCells(c, objective.kpiColumns),
  }
}
