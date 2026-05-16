/**
 * Public country detail merge (static JSON overlay on DB) — safe to import from Node scripts (no React `cache()`).
 */

import type { LegacyCountryRecord } from '@/lib/countries-fallback';
import { parseCountryFullData } from '@/lib/country-full-data-json';
import { materializePublicFullDataForApi } from '@/lib/country-full-data-materialize';
import { mergeDisplayedFullData } from '@/lib/merge-displayed-full-data';
import { isSchengenMember } from '@/lib/schengen-members';

/** Match static JSON row to a Prisma country: **name first** (IDs often diverge from countries.json order), then id. */
export function countryNameMergeKey(name: string): string {
  return name.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function findLegacyCountryMatch(
  fallback: LegacyCountryRecord[],
  db: { id: number; name: string },
): LegacyCountryRecord | null {
  const nk = countryNameMergeKey(db.name);
  const byName = fallback.find((f) => countryNameMergeKey(f.name) === nk);
  if (byName) return byName;
  return fallback.find((f) => f.id === db.id) ?? null;
}

function pickMergedScore(dbVal: unknown, staticVal: unknown): number {
  if (typeof dbVal === 'number' && Number.isFinite(dbVal)) return dbVal;
  if (typeof staticVal === 'number' && Number.isFinite(staticVal)) return staticVal;
  return 5;
}

/**
 * Single-country API: same guarantees as `buildMergedCountriesList` — overlay static `data/countries.json`
 * on DB by **country name**, fill null visa columns from static, coalesce friction score.
 */
export function augmentCountryDetailPayload<T extends Record<string, unknown>>(
  country: T,
  fallback: LegacyCountryRecord[],
): T & { full_data: Record<string, unknown> } {
  const staticRow = findLegacyCountryMatch(fallback, {
    id: country.id as number,
    name: String(country.name ?? ''),
  });

  let full_data = parseCountryFullData(country.full_data);
  if (staticRow) {
    const staticFull =
      staticRow.full_data &&
      typeof staticRow.full_data === 'object' &&
      !Array.isArray(staticRow.full_data)
        ? (staticRow.full_data as Record<string, unknown>)
        : {};
    full_data = materializePublicFullDataForApi(mergeDisplayedFullData(staticFull, full_data));
  } else {
    full_data = materializePublicFullDataForApi(country.full_data);
  }

  const appt =
    typeof country.appointment_difficulty === 'string' &&
    country.appointment_difficulty.trim() !== ''
      ? country.appointment_difficulty
      : staticRow?.appointment_difficulty;

  const name = String(country.name ?? '');
  return {
    ...country,
    schengen_flag: isSchengenMember(name),
    tourist_visa_score: pickMergedScore(country.tourist_visa_score, staticRow?.tourist_visa_score),
    study_visa_score: pickMergedScore(country.study_visa_score, staticRow?.study_visa_score),
    work_visa_score: pickMergedScore(country.work_visa_score, staticRow?.work_visa_score),
    business_visa_score: pickMergedScore(
      country.business_visa_score,
      staticRow?.business_visa_score,
    ),
    appointment_difficulty: appt ?? 'Medium',
    full_data,
  };
}

/** Batch form of `augmentCountryDetailPayload` for `findMany` + `include: { country: true }`. */
export function augmentPrismaCountriesForPublicPayload<T extends Record<string, unknown>>(
  rows: readonly T[],
  fallback: LegacyCountryRecord[],
): Array<T & { full_data: Record<string, unknown> }> {
  return rows.map((row) => augmentCountryDetailPayload(row, fallback));
}
