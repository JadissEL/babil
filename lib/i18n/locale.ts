/**
 * Locales produit (B.38). Étendre ici si nouvelles langues.
 */
export type BabilLocale = 'fr' | 'en'

const LOCALES: ReadonlySet<string> = new Set(['fr', 'en'])

export function parseBabilLocale(value: string | undefined | null): BabilLocale | null {
  if (!value) return null
  const v = value.trim().toLowerCase()
  return LOCALES.has(v) ? (v as BabilLocale) : null
}

/** Serveur / scripts : `BABIL_LOCALE`. Client futur : `NEXT_PUBLIC_BABIL_LOCALE`. */
export function resolveServerBabilLocale(): BabilLocale {
  const fromEnv =
    parseBabilLocale(process.env.BABIL_LOCALE) ??
    parseBabilLocale(process.env.NEXT_PUBLIC_BABIL_LOCALE)
  return fromEnv ?? 'fr'
}
