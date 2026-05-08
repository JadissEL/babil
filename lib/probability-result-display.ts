/** Affichage UI pour les réponses `POST /api/probability` (transparence + breakdown). */

export type ProbabilityCountrySignals = {
  acceptance_rate_morocco: string | null
  friction_score: number | null
  brutal_reality_score: number | null
}

const BREAKDOWN_ORDER = [
  'finance',
  'profession',
  'social',
  'acceptance',
  'visaEase',
  'countryContext',
  'appointmentEase',
  'riskImmigration',
] as const

export type ProbabilityBreakdownKey = (typeof BREAKDOWN_ORDER)[number]

const LABELS: Record<ProbabilityBreakdownKey, string> = {
  finance: 'Finance',
  profession: 'Profession / statut',
  social: 'Liens sociaux',
  acceptance: 'Acceptation (indicateur fiche)',
  visaEase: 'Facilité visa (moyenne)',
  countryContext: 'Contexte pays (agrégé)',
  appointmentEase: 'Facilité RDV / admin',
  riskImmigration: 'Marge vs risque migratoire perçu',
}

export function probabilityBreakdownLabel(key: string): string {
  return LABELS[key as ProbabilityBreakdownKey] ?? key
}

export function orderedProbabilityBreakdown(
  breakdown: Record<string, unknown> | null | undefined,
): Array<{ key: ProbabilityBreakdownKey; label: string; value: number }> {
  if (!breakdown || typeof breakdown !== 'object') return []
  const out: Array<{ key: ProbabilityBreakdownKey; label: string; value: number }> = []
  for (const key of BREAKDOWN_ORDER) {
    const raw = breakdown[key]
    const n = typeof raw === 'number' && Number.isFinite(raw) ? raw : Number(raw)
    if (!Number.isFinite(n)) continue
    out.push({ key, label: LABELS[key], value: Math.round(n) })
  }
  return out
}

export function describeTopCountrySignals(signals: ProbabilityCountrySignals | null | undefined): string {
  if (!signals) {
    return "Les scores combinent votre profil et les signaux disponibles sur chaque pays (visa, friction, acceptation)."
  }
  const parts: string[] = []
  if (signals.acceptance_rate_morocco) {
    parts.push(`Indicateur d'acceptation (fiche) : ${signals.acceptance_rate_morocco}.`)
  }
  if (signals.friction_score != null) {
    parts.push(`Friction administrative : ${signals.friction_score}/100 — plus bas = parcours plus fluide.`)
  }
  if (signals.brutal_reality_score != null) {
    parts.push(`« Réalité terrain » (échelle interne) : ${signals.brutal_reality_score}/10.`)
  }
  if (parts.length === 0) {
    return "Les scores combinent votre profil et les signaux disponibles sur chaque pays (visa, friction, acceptation)."
  }
  return parts.join(' ')
}
