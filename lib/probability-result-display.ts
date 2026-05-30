/** Affichage UI pour les réponses `POST /api/probability` (transparence + breakdown). */

import { formatScalarSur10, formatScoreSur100 } from '@/lib/ui-display-fr'

/** Champs fiche pays absents → le moteur utilise une valeur neutre (50). */
export type ProbabilitySheetFieldDefault =
  | 'acceptance_rate_morocco'
  | 'friction_score'
  | 'brutal_reality_score'

export const PROBABILITY_DEFAULT_FIELD_LABELS_FR: Record<ProbabilitySheetFieldDefault, string> = {
  acceptance_rate_morocco: "indicateur d'acceptation (fiche)",
  friction_score: 'friction administrative (fiche)',
  brutal_reality_score: 'score « réalité terrain » (fiche)',
}

export type ProbabilityCountrySignals = {
  acceptance_rate_morocco: string | null
  friction_score: number | null
  brutal_reality_score: number | null
}

/** Extrait les signaux « fiche pays » depuis `full_data` matérialisé (probabilités + recommandations). */
export function buildCountrySheetSignals(full: Record<string, unknown>): ProbabilityCountrySignals {
  const acceptanceLabel =
    typeof full.acceptance_rate_morocco === 'string' && full.acceptance_rate_morocco.trim()
      ? full.acceptance_rate_morocco.trim()
      : null
  const friction = Number(full.friction_score)
  const brutal = Number(full.brutal_reality_score)
  return {
    acceptance_rate_morocco: acceptanceLabel,
    friction_score: Number.isFinite(friction) ? Math.round(friction) : null,
    brutal_reality_score: Number.isFinite(brutal) ? brutal : null,
  }
}

/** Champs utilisés par `POST /api/probability` avec repli neutre 50 si absents. */
export function inferProbabilitySheetDefaultsFromFull(full: Record<string, unknown>): ProbabilitySheetFieldDefault[] {
  const out: ProbabilitySheetFieldDefault[] = []
  const acc = full.acceptance_rate_morocco
  if (acc === null || acc === undefined || String(acc).trim() === '') {
    out.push('acceptance_rate_morocco')
  }
  if (!Number.isFinite(Number(full.friction_score))) out.push('friction_score')
  if (!Number.isFinite(Number(full.brutal_reality_score))) out.push('brutal_reality_score')
  return out
}

/** Résumé pour listes / fiche : mentionne explicitement les trous de données (B.30). */
export function formatCountrySheetSignalsSummary(
  signals: ProbabilityCountrySignals | null | undefined,
): string | null {
  if (!signals) return null
  const parts: string[] = []
  if (signals.acceptance_rate_morocco) {
    parts.push(`Indicateur d'acceptation (fiche) : ${signals.acceptance_rate_morocco}.`)
  } else {
    parts.push(
      `Indicateur d'acceptation (fiche) : non renseigné — le score utilise une valeur neutre (50).`,
    )
  }
  if (signals.friction_score != null) {
    parts.push(
      `Friction administrative : ${formatScoreSur100(signals.friction_score)} — plus bas = parcours plus fluide.`,
    )
  } else {
    parts.push(`Friction administrative : non renseignée — valeur neutre ${formatScoreSur100(50)} utilisée dans le score.`)
  }
  if (signals.brutal_reality_score != null) {
    parts.push(`« Réalité terrain » : ${formatScalarSur10(signals.brutal_reality_score)}.`)
  } else {
    parts.push(
      `« Réalité terrain » : non renseigné — valeur neutre utilisée dans le score (milieu d’échelle).`,
    )
  }
  return parts.join(' ')
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
  appointmentEase: 'Facilité des rendez-vous',
  riskImmigration: 'Marge vs risque migratoire perçu',
}

export function probabilityBreakdownLabel(key: string): string {
  return LABELS[key as ProbabilityBreakdownKey] ?? key
}

function breakdownLabelWithDefaultHints(
  key: ProbabilityBreakdownKey,
  baseLabel: string,
  defaultsUsed: ReadonlySet<ProbabilitySheetFieldDefault>,
): string {
  if (defaultsUsed.has('acceptance_rate_morocco')) {
    if (key === 'acceptance') return `${baseLabel} · fiche non renseignée → neutre`
    if (key === 'countryContext') return `${baseLabel} · acceptation fiche neutre`
  }
  if (key === 'appointmentEase' && defaultsUsed.has('friction_score')) {
    return `${baseLabel} · fiche non renseignée → neutre`
  }
  if (key === 'riskImmigration' && defaultsUsed.has('brutal_reality_score')) {
    return `${baseLabel} · fiche non renseignée → neutre`
  }
  return baseLabel
}

export function orderedProbabilityBreakdown(
  breakdown: Record<string, unknown> | null | undefined,
  defaultsUsed?: readonly ProbabilitySheetFieldDefault[],
): Array<{ key: ProbabilityBreakdownKey; label: string; value: number }> {
  if (!breakdown || typeof breakdown !== 'object') return []
  const d = defaultsUsed?.length ? new Set(defaultsUsed) : null
  const out: Array<{ key: ProbabilityBreakdownKey; label: string; value: number }> = []
  for (const key of BREAKDOWN_ORDER) {
    const raw = breakdown[key]
    const n = typeof raw === 'number' && Number.isFinite(raw) ? raw : Number(raw)
    if (!Number.isFinite(n)) continue
    const base = LABELS[key]
    const label = d ? breakdownLabelWithDefaultHints(key, base, d) : base
    out.push({ key, label, value: Math.round(n) })
  }
  return out
}

export function describeTopCountrySignals(signals: ProbabilityCountrySignals | null | undefined): string {
  if (!signals) {
    return "Les scores combinent votre profil et les signaux disponibles sur chaque pays (visa, friction, acceptation)."
  }
  const summary = formatCountrySheetSignalsSummary(signals)
  return summary ?? "Les scores combinent votre profil et les signaux disponibles sur chaque pays (visa, friction, acceptation)."
}
