/**
 * C.43 — Clé métier stable pour idempotence World Bank (indicateur × pays × année de série).
 * Format versionné pour migrations futures du connecteur.
 */
export function worldBankObservationDedupeKey(
  wbIndicatorId: string,
  iso2: string,
  observationYear: string | number,
): string {
  const y = String(observationYear).trim();
  const iso = iso2.trim().toUpperCase();
  return `wb:v1:${wbIndicatorId}:${iso}:${y}`;
}
