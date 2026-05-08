import { normalizeCountryMatchKey } from './country-match-key'

/**
 * Quand le nom en base / JSON ne correspond pas au libellé anglais World Bank.
 * Clés = {@link normalizeCountryMatchKey} du nom affiché ; valeurs = ISO 3166-1 alpha-2 minuscules.
 */
export const COUNTRY_ISO2_OVERRIDES: Record<string, string> = {
  'dr congo': 'cd',
  'republic of the congo': 'cg',
  'north korea': 'kp',
  'south korea': 'kr',
  iran: 'ir',
  russia: 'ru',
  laos: 'la',
  micronesia: 'fm',
  moldova: 'md',
  syria: 'sy',
  tanzania: 'tz',
  vietnam: 'vn',
  bolivia: 'bo',
  venezuela: 've',
  'united states': 'us',
  'cape verde': 'cv',
  eswatini: 'sz',
  palestine: 'ps',
  taiwan: 'tw',
  kosovo: 'xk',
  'western sahara': 'eh',
  'british virgin islands': 'vg',
  curaçao: 'cw',
  réunion: 're',
  reunion: 're',
  'saint barthélemy': 'bl',
  'saint barthelemy': 'bl',
  'caribbean netherlands': 'bq',
}

export function iso2FromIntelligenceOverride(name: string): string | null {
  const iso = COUNTRY_ISO2_OVERRIDES[normalizeCountryMatchKey(name)]
  return iso ? iso.toLowerCase() : null
}
