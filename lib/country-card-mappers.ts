import type { CountryCardProps, MobilityTier } from '@/components/country/CountryCard'

/** Typical ISO mappings for French-facing country names — extend as needed */
export const countryNameToIso: Record<string, string> = {
  France: 'fr',
  Italie: 'it',
  Spain: 'es',
  Espagne: 'es',
  Germany: 'de',
  Allemagne: 'de',
  Portugal: 'pt',
  Netherlands: 'nl',
  Belgique: 'be',
  Belgium: 'be',
  Switzerland: 'ch',
  Suisse: 'ch',
  Canada: 'ca',
  USA: 'us',
  'United States': 'us',
  UK: 'gb',
  'United Kingdom': 'gb',
  Japan: 'jp',
  Japon: 'jp',
  Turkey: 'tr',
  Turquie: 'tr',
  Morocco: 'ma',
  Maroc: 'ma',
  Austria: 'at',
  Greece: 'gr',
  Grèce: 'gr',
  Sweden: 'se',
  Denmark: 'dk',
  Finland: 'fi',
  Poland: 'pl',
  Czechia: 'cz',
  Hungary: 'hu',
  Slovakia: 'sk',
  Slovenia: 'si',
  Croatia: 'hr',
  Malta: 'mt',
  Luxembourg: 'lu',
  Estonia: 'ee',
  Latvia: 'lv',
  Lithuania: 'lt',
  Romania: 'ro',
  Bulgaria: 'bg',
}

export function isoForCountryName(name: string): string {
  return countryNameToIso[name]?.toLowerCase() ?? ''
}

/** Map 0–100 visa-ish score bands to card tiers */
export function scoreToMobilityTier(score: number): MobilityTier {
  if (score >= 70) return 'Strong'
  if (score >= 45) return 'Medium'
  return 'Weak'
}

type FrictionBand = CountryCardProps['friction']

/**
 * Appointment label + raw friction_score from dataset.
 * Dataset: higher friction_score means heavier bureaucracy / more friction for the traveller.
 */
export function frictionTierFromCountry(
  appointmentDifficulty: unknown,
  frictionScoreDb: unknown,
): FrictionBand {
  const lbl = String(appointmentDifficulty ?? '').toLowerCase()

  if (/(easy|facile|\blow\b)/.test(lbl)) return 'Low'
  if (/(critical|extreme|very\s*high|\bhigh\b|\bhard\b|severe|difficult)/.test(lbl))
    return 'High'
  if (/(medium|moyen|moderate|\bmedian\b)/.test(lbl)) return 'Medium'

  const n = frictionScoreDb == null ? NaN : Number(frictionScoreDb)
  if (Number.isFinite(n)) {
    if (n >= 75) return 'High'
    if (n >= 40) return 'Medium'
    return 'Low'
  }

  return 'Medium'
}
