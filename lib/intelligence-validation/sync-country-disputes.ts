/**
 * Persist disputed field paths on Country.full_data for orchestration / UI.
 */

import { parseCountryFullData } from '@/lib/country-full-data-json';
import prisma from '@/lib/prisma';

export async function syncDisputedFieldPathsToCountry(
  countryId: number,
  disputedPaths: string[],
): Promise<void> {
  const row = await prisma.country.findUnique({
    where: { id: countryId },
    select: { full_data: true },
  });
  if (!row) return;

  const full = parseCountryFullData(row.full_data);
  const intel = (full._intelligence ?? {}) as Record<string, unknown>;
  if (disputedPaths.length === 0) {
    delete intel.disputed_field_paths;
  } else {
    intel.disputed_field_paths = disputedPaths;
  }
  full._intelligence = intel;

  await prisma.country.update({
    where: { id: countryId },
    data: { full_data: JSON.stringify(full) },
  });
}
