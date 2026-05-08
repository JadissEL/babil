/** Clé stable pour rapprocher un nom pays Babil avec le répertoire World Bank (anglais). */
export function normalizeCountryMatchKey(name: string): string {
  return name
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}
