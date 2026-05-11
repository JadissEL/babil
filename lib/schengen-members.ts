/**
 * États membres de l'espace Schengen (noms officiels EN utilisés dans le jeu de données principal).
 * Micro-États / cas limites hors liste : traitement aligné avec l'ex-agent (runner).
 */

const SCHENGEN_COUNTRIES_ENGLISH = new Set([
  'Austria',
  'Belgium',
  'Bulgaria',
  'Croatia',
  'Czechia',
  'Denmark',
  'Estonia',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'Hungary',
  'Iceland',
  'Italy',
  'Latvia',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Netherlands',
  'Norway',
  'Poland',
  'Portugal',
  'Romania',
  'Slovakia',
  'Slovenia',
  'Spain',
  'Sweden',
  'Switzerland',
])

/** Clé comparable à {@link countryNameMergeKey} sans importer prisma-merge (évite dépendances lourdes). */
function normalizedNameLookupKey(name: string): string {
  return name.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase()
}

/** Même normalisation que le merge Prisma / JSON — drapeaux, ISO, dédup Schengen. */
export function schengenNormalizedNameKey(name: string): string {
  return normalizedNameLookupKey(name)
}

/**
 * Alias fréquent (FR ou variantes JSON) vers le nom canonique EN présent dans SCHENGEN_COUNTRIES_ENGLISH.
 */
const MERGE_KEY_TO_CANONICAL_EN: Record<string, string> = {
  'czech republic': 'Czechia',
  tchéquie: 'Czechia',
  allemagne: 'Germany',
  autriche: 'Austria',
  belgique: 'Belgium',
  bulgarie: 'Bulgaria',
  'république tchèque': 'Czechia',
  'republique tcheque': 'Czechia',
  tchequie: 'Czechia',
  croatie: 'Croatia',
  danemark: 'Denmark',
  espagne: 'Spain',
  estonie: 'Estonia',
  finlande: 'Finland',
  hellas: 'Greece',
  grèce: 'Greece',
  grece: 'Greece',
  hongrie: 'Hungary',
  islande: 'Iceland',
  italie: 'Italy',
  lettonie: 'Latvia',
  liechtenstein: 'Liechtenstein',
  lituanie: 'Lithuania',
  luxembourg: 'Luxembourg',
  malte: 'Malta',
  'pays-bas': 'Netherlands',
  'pays bas': 'Netherlands',
  'the netherlands': 'Netherlands',
  norvège: 'Norway',
  norvege: 'Norway',
  pologne: 'Poland',
  roumanie: 'Romania',
  romania: 'Romania',
  slovaquie: 'Slovakia',
  slovénie: 'Slovenia',
  slovenie: 'Slovenia',
  espana: 'Spain',
  suede: 'Sweden',
  suède: 'Sweden',
  suisse: 'Switzerland',
}

/**
 * All normalized name keys (EN display names + FR aliases) accepted by {@link isSchengenMember}.
 * Regenerate `data/schengen-lookup-keys.json` via `npm run export:schengen-keys` after editing members.
 */
export function listSchengenNormalizedLookupKeys(): string[] {
  const keys = new Set<string>()
  SCHENGEN_COUNTRIES_ENGLISH.forEach((en) => {
    keys.add(normalizedNameLookupKey(en))
  })
  for (const alias of Object.keys(MERGE_KEY_TO_CANONICAL_EN)) {
    keys.add(alias)
  }
  return Array.from(keys).sort((a, b) => a.localeCompare(b))
}

export function listSchengenCanonicalEnglish(): readonly string[] {
  return Array.from(SCHENGEN_COUNTRIES_ENGLISH).sort((a, b) => a.localeCompare(b))
}

/**
 * Nom anglais canonique (ensemble SCHENGEN_COUNTRIES_ENGLISH) si le pays est membre Schengen, sinon null.
 * Utilisé pour dédupliquer les lignes fusionnées (ex. Allemagne vs Germany).
 */
export function schengenCanonicalEnglishName(countryName: string): string | null {
  const trimmed = countryName.normalize('NFC').trim().replace(/\s+/g, ' ')
  if (!trimmed) return null

  if (SCHENGEN_COUNTRIES_ENGLISH.has(trimmed)) return trimmed

  const k = normalizedNameLookupKey(trimmed)
  const canonicalViaAlias = MERGE_KEY_TO_CANONICAL_EN[k]
  if (canonicalViaAlias && SCHENGEN_COUNTRIES_ENGLISH.has(canonicalViaAlias)) return canonicalViaAlias

  for (const en of SCHENGEN_COUNTRIES_ENGLISH) {
    if (normalizedNameLookupKey(en) === k) return en
  }

  return null
}

/**
 * Membre Schengen à partir du nom pays affiché en base ou dans les JSON statiques (FR / EN).
 */
export function isSchengenMember(countryName: string): boolean {
  return schengenCanonicalEnglishName(countryName) !== null
}
