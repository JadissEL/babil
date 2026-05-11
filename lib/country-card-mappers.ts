import type { CountryCardProps, MobilityTier } from '@/components/country/CountryCard'
import { schengenCanonicalEnglishName, schengenNormalizedNameKey } from '@/lib/schengen-members'

/** Typical ISO mappings for French-facing country names — extend as needed */
export const countryNameToIso: Record<string, string> = {
  France: 'fr',
  Italie: 'it',
  Italy: 'it',
  Spain: 'es',
  Espagne: 'es',
  Germany: 'de',
  Allemagne: 'de',
  Portugal: 'pt',
  Netherlands: 'nl',
  'The Netherlands': 'nl',
  'Pays-Bas': 'nl',
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
  Autriche: 'at',
  Greece: 'gr',
  Grèce: 'gr',
  Grece: 'gr',
  Sweden: 'se',
  Suède: 'se',
  Suede: 'se',
  Denmark: 'dk',
  Danemark: 'dk',
  Finland: 'fi',
  Finlande: 'fi',
  Poland: 'pl',
  Pologne: 'pl',
  Czechia: 'cz',
  'Czech Republic': 'cz',
  Hungary: 'hu',
  Hongrie: 'hu',
  Slovakia: 'sk',
  Slovaquie: 'sk',
  Slovenia: 'si',
  Slovénie: 'si',
  Slovenie: 'si',
  Croatia: 'hr',
  Croatie: 'hr',
  Malta: 'mt',
  Malte: 'mt',
  Luxembourg: 'lu',
  Estonia: 'ee',
  Estonie: 'ee',
  Latvia: 'lv',
  Lettonie: 'lv',
  Lithuania: 'lt',
  Lituanie: 'lt',
  Romania: 'ro',
  Roumanie: 'ro',
  Bulgaria: 'bg',
  Bulgarie: 'bg',
  Iceland: 'is',
  Islande: 'is',
  Norway: 'no',
  Norvège: 'no',
  Norvege: 'no',
  Liechtenstein: 'li',
  Ireland: 'ie',
}

function buildIso2ByNormalizedLabel(): Map<string, string> {
  const m = new Map<string, string>()
  for (const [label, iso] of Object.entries(countryNameToIso)) {
    m.set(schengenNormalizedNameKey(label), iso.toLowerCase())
  }
  return m
}

const ISO2_BY_NORMALIZED_LABEL = buildIso2ByNormalizedLabel()

/** ISO 3166-1 alpha-2 for flag-icons (`fi fi-xx`), with Schengen canonical EN fallback. */
export function iso2ForCountryNameOrEmpty(name: string): string {
  const trimmed = name.normalize('NFC').trim().replace(/\s+/g, ' ')
  if (!trimmed) return ''
  const direct = countryNameToIso[trimmed]
  if (direct) return direct.toLowerCase()
  const byNorm = ISO2_BY_NORMALIZED_LABEL.get(schengenNormalizedNameKey(trimmed))
  if (byNorm) return byNorm
  const canon = schengenCanonicalEnglishName(trimmed)
  if (canon) {
    const fromCanon = countryNameToIso[canon]
    if (fromCanon) return fromCanon.toLowerCase()
    const fromCanonNorm = ISO2_BY_NORMALIZED_LABEL.get(schengenNormalizedNameKey(canon))
    if (fromCanonNorm) return fromCanonNorm
  }
  return ''
}

export function isoForCountryName(name: string): string {
  return iso2ForCountryNameOrEmpty(name)
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
