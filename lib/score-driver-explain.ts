/**
 * B.26 — Contributions marginales simplifiées (référence neutre : 50 sur chaque pilier interne).
 * Tri par |contribution| ; les 3 premiers = « facteurs qui ont le plus bougé » le score final.
 * B.38 — Libellés issus du catalogue i18n (`lib/i18n/catalog-scoring.ts`).
 */

import { scoringMessages } from '@/lib/i18n/catalog-scoring'
import { interpolate } from '@/lib/i18n/interpolate'
import type { BabilLocale } from '@/lib/i18n/locale'

export type ScoreDriver = {
  key: string
  label: string
  /** Effet signé sur le score 0–100 final vs baseline neutre (tous piliers à 50). */
  deltaPoints: number
}

const RECO_WEIGHTS = {
  visa: 0.4,
  friction: 0.2,
  goalMatch: 0.25,
  /** Terme agrégé : (100 - risk) dans le score, baseline risk = 50 → terme baseline = 50. */
  antiRisk: 0.15,
} as const

export function computeRecommendationTopDrivers(
  breakdown: {
    visa: number
    friction: number
    goalMatch: number
    risk: number
  },
  locale: BabilLocale = 'fr',
): ScoreDriver[] {
  const msg = scoringMessages(locale).reco
  const neutral = 50
  const antiRiskValue = 100 - breakdown.risk
  const contributions: ScoreDriver[] = [
    {
      key: 'visa',
      label: msg.visa,
      deltaPoints: RECO_WEIGHTS.visa * (breakdown.visa - neutral),
    },
    {
      key: 'friction',
      label: msg.friction,
      deltaPoints: RECO_WEIGHTS.friction * (breakdown.friction - neutral),
    },
    {
      key: 'goalMatch',
      label: msg.goalMatch,
      deltaPoints: RECO_WEIGHTS.goalMatch * (breakdown.goalMatch - neutral),
    },
    {
      key: 'antiRisk',
      label: msg.antiRisk,
      deltaPoints: RECO_WEIGHTS.antiRisk * (antiRiskValue - neutral),
    },
  ]
  return pickTop3ByAbs(contributions)
}

type ProbabilityBreakdownForDrivers = {
  finance: number
  profession: number
  social: number
  countryContext: number
  appointmentEase: number
  riskImmigration: number
}

const PROBA_FACTOR_KEYS: Array<{
  key: string
  weight: number
  breakdownKey: keyof ProbabilityBreakdownForDrivers
  labelKey: keyof ReturnType<typeof scoringMessages>['proba']
}> = [
  { key: 'finance', weight: 0.2, breakdownKey: 'finance', labelKey: 'finance' },
  { key: 'profession', weight: 0.2, breakdownKey: 'profession', labelKey: 'profession' },
  { key: 'social', weight: 0.2, breakdownKey: 'social', labelKey: 'social' },
  { key: 'countryContext', weight: 0.2, breakdownKey: 'countryContext', labelKey: 'countryContext' },
  { key: 'appointmentEase', weight: 0.1, breakdownKey: 'appointmentEase', labelKey: 'appointmentEase' },
  { key: 'riskImmigration', weight: 0.1, breakdownKey: 'riskImmigration', labelKey: 'riskImmigration' },
]

export function computeProbabilityTopDrivers(
  breakdown: ProbabilityBreakdownForDrivers,
  locale: BabilLocale = 'fr',
): ScoreDriver[] {
  const neutral = 50
  const proba = scoringMessages(locale).proba
  const contributions: ScoreDriver[] = PROBA_FACTOR_KEYS.map((f) => ({
    key: f.key,
    label: proba[f.labelKey],
    deltaPoints: f.weight * (breakdown[f.breakdownKey] - neutral),
  }))
  return pickTop3ByAbs(contributions)
}

function pickTop3ByAbs(drivers: ScoreDriver[]): ScoreDriver[] {
  const sorted = [...drivers].sort((a, b) => Math.abs(b.deltaPoints) - Math.abs(a.deltaPoints))
  return sorted.slice(0, 3)
}

export function formatScoreDrivers(drivers: ScoreDriver[], locale: BabilLocale = 'fr'): string[] {
  const template = scoringMessages(locale).driverLine
  return drivers.map((d) => {
    const rounded = Math.round(d.deltaPoints * 10) / 10
    const sign = rounded > 0 ? '+' : ''
    return interpolate(template, { label: d.label, sign, points: rounded })
  })
}

export function formatScoreDriversFrench(drivers: ScoreDriver[]): string[] {
  return formatScoreDrivers(drivers, 'fr')
}
