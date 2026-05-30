/**
 * Libellés français pour l’affichage utilisateur (cartes pays, filtres, scores).
 * Les APIs gardent souvent des codes EN — ne pas les exposer tels quels dans l’UI.
 */

export type MobilityTier = 'Strong' | 'Medium' | 'Weak'
export type FrictionBand = 'Low' | 'Medium' | 'High'

const MOBILITY_TIER_FR: Record<MobilityTier, string> = {
  Strong: 'Favorable',
  Medium: 'Moyen',
  Weak: 'Limité',
}

const FRICTION_BAND_FR: Record<FrictionBand, string> = {
  Low: 'Démarches faciles',
  Medium: 'Démarches moyennes',
  High: 'Démarches difficiles',
}

const APPOINTMENT_DIFFICULTY_FR: Record<string, string> = {
  Low: 'Facile',
  Medium: 'Moyenne',
  High: 'Difficile',
  Extreme: 'Très difficile',
}

const EN_SCORE_LEVEL_FR: Record<string, string> = {
  'Very High': 'Très élevé',
  High: 'Élevé',
  Medium: 'Moyen',
  Low: 'Faible',
  'Very Low': 'Très faible',
}

const EDUCATION_ACCESS_FR: Record<string, string> = {
  high: 'Élevé',
  eleve: 'Élevé',
  élevé: 'Élevé',
  medium: 'Moyen',
  moyen: 'Moyen',
  low: 'Faible',
  bas: 'Faible',
  faible: 'Faible',
}

/** Niveau mobilité (cartes pays) — évite Strong / Medium / Weak. */
export function mobilityTierLabelFr(tier: MobilityTier | string | undefined | null): string {
  if (!tier) return '—'
  const key = String(tier) as MobilityTier
  return MOBILITY_TIER_FR[key] ?? displayTokenFr(String(tier))
}

/** Bandeau friction administrative (cartes pays). */
export function frictionBandLabelFr(band: FrictionBand | string | undefined | null): string {
  if (!band) return '—'
  const key = String(band) as FrictionBand
  return FRICTION_BAND_FR[key] ?? displayTokenFr(String(band))
}

/** Difficulté rendez-vous / visa (filtres, fiches). */
export function appointmentDifficultyLabelFr(level: string | undefined | null): string {
  if (!level || level === 'all') return 'Toutes'
  return APPOINTMENT_DIFFICULTY_FR[level] ?? displayTokenFr(level)
}

/** Niveaux reco / probabilité (Very High, High, …). */
export function englishScoreLevelToFr(level: string | undefined | null): string | undefined {
  if (level == null || level === '') return undefined
  return EN_SCORE_LEVEL_FR[level] ?? displayTokenFr(level)
}

/** Accès programme éducation (high / medium / low). */
export function educationAccessLabelFr(access: string | undefined | null): string {
  if (!access?.trim()) return '—'
  const key = access.trim().toLowerCase()
  return EDUCATION_ACCESS_FR[key] ?? displayTokenFr(access.trim())
}

/** Parties score pour affichage empilé (cartes étroites). */
export function scoreSur100Parts(score: number): { value: string; scale: string } {
  const n = Math.round(score)
  return { value: String(n), scale: 'sur 100' }
}

/** Score 0–100 lisible (évite « 63/100 » sans contexte). */
export function formatScoreSur100(score: number): string {
  const { value, scale } = scoreSur100Parts(score)
  return `${value} ${scale}`
}

/** Score ou friction sur échelle 0–10. */
export function formatScalarSur10(value: number | string): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  const rounded = Math.round(n * 10) / 10
  return `${rounded} sur 10`
}

/** Pourcentage affiché (acceptation visa, etc.). */
export function formatPercent(value: number): string {
  const n = Math.round(value)
  return `${n} %`
}

/** Délai en jours (évite « 21j »). */
export function formatDelaiJours(days: number): string {
  const n = Math.max(0, Math.round(days))
  if (n <= 1) return `${n} jour`
  return `${n} jours`
}

/** Libellé lieu sur carte pays. */
export function scenicPlaceLabelFr(countryName: string, place?: string | null): string {
  const p = place?.trim()
  if (p) return p
  return `Lieu emblématique — ${countryName}`
}

/** Badge image de remplacement (évite « Gén. »). */
export const GENERIC_IMAGE_LABEL_FR = 'Photo illustrative'

/** Libellé court pour overlays très petits (pastille sur vignette). */
export const GENERIC_IMAGE_LABEL_SHORT_FR = 'Illustration'

/** Dernier recours : tente une traduction connue, sinon renvoie tel quel. */
export function displayTokenFr(token: string): string {
  const t = token.trim()
  if (!t) return '—'
  const level = englishScoreLevelToFr(t)
  if (level && level !== t) return level
  const mob = MOBILITY_TIER_FR[t as MobilityTier]
  if (mob) return mob
  const fric = FRICTION_BAND_FR[t as FrictionBand]
  if (fric) return fric
  const appt = APPOINTMENT_DIFFICULTY_FR[t]
  if (appt) return appt
  return t
}
