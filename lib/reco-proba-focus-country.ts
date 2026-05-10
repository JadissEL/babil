/**
 * When the client sends `focusCountryId` (e.g. user arrived from a country page),
 * move that row to the front of the ranked list without changing scores.
 */
export function pinCountryFirst<T extends { id: number }>(
  rows: T[],
  focusCountryId: number | undefined,
): T[] {
  if (focusCountryId == null || !Number.isFinite(focusCountryId) || focusCountryId < 1) {
    return rows;
  }
  const idx = rows.findIndex((r) => r.id === focusCountryId);
  if (idx <= 0) return rows;
  const next = [...rows];
  const [row] = next.splice(idx, 1);
  next.unshift(row);
  return next;
}
