/**
 * Persist heuristic second-pass conflicts into Country disputed paths + observation tags.
 */

import { parseCountryFullData } from '@/lib/country-full-data-json';
import prisma from '@/lib/prisma';

/** Parse `heuristic:{countryId}:{fieldPath}:...` or `llm:{countryId}:{fieldPath}:...` lines. */
export function parseHeuristicConflictLines(conflicts: string[]): Map<number, string[]> {
  const byCountry = new Map<number, Set<string>>();
  for (const line of conflicts) {
    const m = /^(?:heuristic|llm):(\d+):([^:]+):/.exec(line);
    if (!m) continue;
    const countryId = Number(m[1]);
    const fieldPath = m[2];
    if (!Number.isFinite(countryId) || countryId <= 0 || !fieldPath) continue;
    const set = byCountry.get(countryId) ?? new Set<string>();
    set.add(fieldPath);
    byCountry.set(countryId, set);
  }
  const out = new Map<number, string[]>();
  for (const [id, set] of Array.from(byCountry.entries())) {
    out.set(id, Array.from(set));
  }
  return out;
}

export async function applyHeuristicContradictionConflicts(conflicts: string[]): Promise<{
  countriesUpdated: number;
  pathsFlagged: number;
}> {
  const grouped = parseHeuristicConflictLines(conflicts);
  let countriesUpdated = 0;
  let pathsFlagged = 0;

  for (const [countryId, newPaths] of Array.from(grouped.entries())) {
    pathsFlagged += newPaths.length;

    const row = await prisma.country.findUnique({
      where: { id: countryId },
      select: { full_data: true },
    });
    if (!row) continue;

    const full = parseCountryFullData(row.full_data);
    const intel = (full._intelligence ?? {}) as Record<string, unknown>;
    const existing = Array.isArray(intel.disputed_field_paths)
      ? (intel.disputed_field_paths as string[])
      : [];
    const merged = Array.from(new Set([...existing, ...newPaths]));
    intel.disputed_field_paths = merged;
    full._intelligence = intel;

    await prisma.country.update({
      where: { id: countryId },
      data: { full_data: JSON.stringify(full) },
    });

    await prisma.countryObservation.updateMany({
      where: { countryId, fieldPath: { in: newPaths } },
      data: { verificationStatus: 'disputed' },
    });

    countriesUpdated += 1;
  }

  return { countriesUpdated, pathsFlagged };
}
