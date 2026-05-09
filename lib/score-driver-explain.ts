/**
 * B.26 — Contributions marginales simplifiées (référence neutre : 50 sur chaque pilier interne).
 * Tri par |contribution| ; les 3 premiers = « facteurs qui ont le plus bougé » le score final.
 */

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

const RECO_LABELS: Record<keyof typeof RECO_WEIGHTS, string> = {
  visa: 'Pilier visa (objectif + profil)',
  friction: 'Friction / rendez-vous',
  goalMatch: 'Adéquation objectif',
  antiRisk: 'Marge vs risque de refus',
}

export function computeRecommendationTopDrivers(breakdown: {
  visa: number
  friction: number
  goalMatch: number
  risk: number
}): ScoreDriver[] {
  const neutral = 50
  const antiRiskValue = 100 - breakdown.risk
  const contributions: ScoreDriver[] = [
    {
      key: 'visa',
      label: RECO_LABELS.visa,
      deltaPoints: RECO_WEIGHTS.visa * (breakdown.visa - neutral),
    },
    {
      key: 'friction',
      label: RECO_LABELS.friction,
      deltaPoints: RECO_WEIGHTS.friction * (breakdown.friction - neutral),
    },
    {
      key: 'goalMatch',
      label: RECO_LABELS.goalMatch,
      deltaPoints: RECO_WEIGHTS.goalMatch * (breakdown.goalMatch - neutral),
    },
    {
      key: 'antiRisk',
      label: RECO_LABELS.antiRisk,
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

const PROBA_FACTORS: Array<{
  key: string
  weight: number
  label: string
  breakdownKey: keyof ProbabilityBreakdownForDrivers
}> = [
  { key: 'finance', weight: 0.2, label: 'Profil financier', breakdownKey: 'finance' },
  { key: 'profession', weight: 0.2, label: 'Situation professionnelle', breakdownKey: 'profession' },
  { key: 'social', weight: 0.2, label: 'Liens sociaux / famille', breakdownKey: 'social' },
  { key: 'countryContext', weight: 0.2, label: 'Contexte pays (acceptation + visa)', breakdownKey: 'countryContext' },
  { key: 'appointmentEase', weight: 0.1, label: 'Facilité RDV / admin', breakdownKey: 'appointmentEase' },
  { key: 'riskImmigration', weight: 0.1, label: 'Risque immigration perçu', breakdownKey: 'riskImmigration' },
]

export function computeProbabilityTopDrivers(breakdown: ProbabilityBreakdownForDrivers): ScoreDriver[] {
  const neutral = 50
  const contributions: ScoreDriver[] = PROBA_FACTORS.map((f) => ({
    key: f.key,
    label: f.label,
    deltaPoints: f.weight * (breakdown[f.breakdownKey] - neutral),
  }))
  return pickTop3ByAbs(contributions)
}

function pickTop3ByAbs(drivers: ScoreDriver[]): ScoreDriver[] {
  const sorted = [...drivers].sort((a, b) => Math.abs(b.deltaPoints) - Math.abs(a.deltaPoints))
  return sorted.slice(0, 3)
}

export function formatScoreDriversFrench(drivers: ScoreDriver[]): string[] {
  return drivers.map((d) => {
    const rounded = Math.round(d.deltaPoints * 10) / 10
    const sign = rounded > 0 ? '+' : ''
    return `${d.label} : ${sign}${rounded} pt (vs profil de référence neutre)`
  })
}
