import type { RecommendationResultRow } from '@/components/engine/RecommendationPanel'
import type { ProbabilityCountrySignals } from '@/lib/probability-result-display'
import { formatCountrySheetSignalsSummary } from '@/lib/probability-result-display'
import type { ScoreDriver } from '@/lib/score-driver-explain'
import { englishScoreLevelToFr } from '@/lib/score-level-fr'


/** Shape returned by `POST /api/recommendation` */
export type ApiRecommendation = {
  id: number | string
  name: string
  score: number
  level?: string
  reason?: string
  explanation?: string[]
  warnings?: string[]
  countrySignals?: ProbabilityCountrySignals
  hasPhdStudies?: boolean
  breakdown?: {
    visa: number
    friction: number
    goalMatch: number
    risk: number
  }
  /** B.26 — top contributions vs baseline neutre (50 sur chaque pilier). */
  topDrivers?: ScoreDriver[]
}

export function mapApiRecommendationToPanelRow(
  r: ApiRecommendation,
  rank: number,
): RecommendationResultRow {
  const lines: string[] = []
  if (r.reason) lines.push(r.reason)
  if (r.breakdown) {
    lines.push(
      `Piliers · visa ${r.breakdown.visa} · friction ${r.breakdown.friction} · objectif ${r.breakdown.goalMatch} · risque ${r.breakdown.risk}`,
    )
  }
  if (Array.isArray(r.explanation)) {
    lines.push(...r.explanation)
  }

  const sheetSummary = formatCountrySheetSignalsSummary(r.countrySignals)

  const levelFr = englishScoreLevelToFr(r.level)

  const cid = Number(r.id)
  const countryId = Number.isFinite(cid) ? cid : undefined

  return {
    country: r.name,
    countryId,
    score: r.score,
    rank,
    subtitle: levelFr ? `Niveau de correspondance : ${levelFr}` : undefined,
    sheetSignalsSummary: sheetSummary ?? undefined,
    hasPhdStudies: Boolean(r.hasPhdStudies),
    explanation: lines.length ? lines : ['Synthèse indisponible pour ce résultat.'],
    warnings: Array.isArray(r.warnings) ? r.warnings : undefined,
  }
}
