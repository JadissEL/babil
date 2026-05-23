/**
 * C.52 — Désactiver la **collecte** (écriture d’observations) par slug de source sans retirer la ligne `IntelligenceSource`.
 *
 * Variable : `INTELLIGENCE_SOURCE_DISABLED_SLUGS` — liste séparée par des virgules (ex. `world_bank_open_data,oecd`).
 * Les slugs sont comparés en **insensible à la casse** après trim.
 *
 * La matérialisation (`materializeEconomy`) n’est pas couverte ici : elle relit les observations existantes.
 */

const ENV_KEY = 'INTELLIGENCE_SOURCE_DISABLED_SLUGS';

export function parseDisabledIntelligenceSourceSlugs(envValue: string | undefined): Set<string> {
  const out = new Set<string>();
  if (!envValue?.trim()) return out;
  for (const part of envValue.split(',')) {
    const s = part.trim().toLowerCase();
    if (s) out.add(s);
  }
  return out;
}

let cached: { raw: string | undefined; set: Set<string> } | null = null;

function disabledSet(): Set<string> {
  const raw = process.env[ENV_KEY];
  if (cached && cached.raw === raw) return cached.set;
  const set = parseDisabledIntelligenceSourceSlugs(raw);
  cached = { raw, set };
  return set;
}

/** Réinitialise le cache (tests uniquement). */
export function resetIntelligenceSourceDisabledCacheForTests(): void {
  cached = null;
}

/** `true` si la collecte pour ce slug est autorisée (absent de la liste de désactivation). */
export function isIntelligenceSourceCollectionEnabled(slug: string): boolean {
  const key = slug.trim().toLowerCase();
  if (!key) return true;
  return !disabledSet().has(key);
}
