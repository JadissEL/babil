/**
 * Builds the public countries list/detail payload: merges Prisma (runner / seed truth)
 * with static `data/countries.json` as a coverage fallback when a DB row has no counterpart.
 *
 * **Consistency rule for public HTTP responses:** never return raw `parseCountryFullData(prismaRow)`
 * alone. Prefer `buildMergedCountriesList()` / `getMergedCountriesListCached()`, `augmentCountryDetailPayload()`, or
 * `augmentPrismaCountriesForPublicPayload()` with `loadFallbackCountries()` so:
 * - Static JSON is matched by **country name** first (Prisma `id` often ≠ countries.json index).
 * - Null visa columns are backfilled from static.
 * - `full_data.friction_score` is coalesced from `friction_analysis` when missing.
 * Client-side reads should use `materializePublicFullDataForApi` from `@/lib/country-full-data-materialize`.
 */

import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import type { LegacyCountryRecord } from '@/lib/countries-fallback';
import { loadFallbackCountries } from '@/lib/countries-fallback';
import { countryNameMergeKey, findLegacyCountryMatch } from '@/lib/country-detail-payload-augment';
import { parseCountryFullData } from '@/lib/country-full-data-json';
import { materializePublicFullDataForApi } from '@/lib/country-full-data-materialize';
import { mergeDisplayedFullData } from '@/lib/merge-displayed-full-data';
import prisma from '@/lib/prisma';
import {
  dedupeSchengenMembersByCanonicalName,
  warnIfSchengenCardinalityExceeded,
} from '@/lib/schengen-duplicate-merge';
import { isSchengenMember } from '@/lib/schengen-members';

export { mergeDisplayedFullData } from '@/lib/merge-displayed-full-data';

export {
  augmentCountryDetailPayload,
  augmentPrismaCountriesForPublicPayload,
  countryNameMergeKey,
  findLegacyCountryMatch,
} from '@/lib/country-detail-payload-augment';

const approvedComments = {
  where: { status: 'APPROVED' as const },
  include: { user: { select: { name: true } } },
  orderBy: { createdAt: 'desc' as const },
} as const;

function mergeFallbackRowWithDb(
  f: LegacyCountryRecord,
  db: {
    id: number;
    name: string;
    region: string;
    schengen_flag: boolean;
    tourist_visa_score: number | null;
    study_visa_score: number | null;
    work_visa_score: number | null;
    business_visa_score: number | null;
    appointment_difficulty: string | null;
    full_data: string | null;
    comments?: unknown[];
  },
): LegacyCountryRecord {
  const staticFull =
    f.full_data && typeof f.full_data === 'object' && !Array.isArray(f.full_data)
      ? (f.full_data as Record<string, unknown>)
      : {};
  const dbFull = parseCountryFullData(db.full_data);
  return {
    ...f,
    id: db.id,
    name: db.name,
    region: db.region,
    schengen_flag: isSchengenMember(db.name),
    tourist_visa_score:
      typeof db.tourist_visa_score === 'number' ? db.tourist_visa_score : f.tourist_visa_score,
    study_visa_score:
      typeof db.study_visa_score === 'number' ? db.study_visa_score : f.study_visa_score,
    work_visa_score:
      typeof db.work_visa_score === 'number' ? db.work_visa_score : f.work_visa_score,
    business_visa_score:
      typeof db.business_visa_score === 'number' ? db.business_visa_score : f.business_visa_score,
    appointment_difficulty: db.appointment_difficulty ?? f.appointment_difficulty,
    full_data: materializePublicFullDataForApi(mergeDisplayedFullData(staticFull, dbFull)),
    comments: (db.comments as LegacyCountryRecord['comments']) ?? [],
  };
}

export function prismaRowToLegacy(db: {
  id: number;
  name: string;
  region: string;
  schengen_flag: boolean;
  tourist_visa_score: number | null;
  study_visa_score: number | null;
  work_visa_score: number | null;
  business_visa_score: number | null;
  appointment_difficulty: string | null;
  full_data: string | null;
  comments?: unknown[];
}): LegacyCountryRecord {
  return {
    id: db.id,
    name: db.name,
    region: db.region,
    schengen_flag: isSchengenMember(db.name),
    tourist_visa_score: typeof db.tourist_visa_score === 'number' ? db.tourist_visa_score : 5,
    study_visa_score: typeof db.study_visa_score === 'number' ? db.study_visa_score : 5,
    work_visa_score: typeof db.work_visa_score === 'number' ? db.work_visa_score : 5,
    business_visa_score: typeof db.business_visa_score === 'number' ? db.business_visa_score : 5,
    appointment_difficulty: db.appointment_difficulty ?? 'Medium',
    full_data: materializePublicFullDataForApi(db.full_data),
    comments: (db.comments as LegacyCountryRecord['comments']) ?? [],
  };
}

async function fetchMergedCountriesListUncached(): Promise<LegacyCountryRecord[]> {
  let fallback: LegacyCountryRecord[] = [];
  try {
    fallback = await loadFallbackCountries();
  } catch {
    fallback = [];
  }

  try {
    const prismaRows = await prisma.country.findMany({
      include: { comments: approvedComments },
      orderBy: { id: 'asc' },
    });

    if (prismaRows.length === 0) {
      return dedupeSchengenMembersByCanonicalName(fallback);
    }

    const byName = new Map(prismaRows.map((r) => [countryNameMergeKey(r.name), r]));

    if (fallback.length === 0) {
      const onlyDb = prismaRows.map((db) => prismaRowToLegacy(db));
      const deduped = dedupeSchengenMembersByCanonicalName(onlyDb);
      warnIfSchengenCardinalityExceeded(deduped);
      return deduped;
    }

    const mergedBase = fallback.map((f) => {
      const key = countryNameMergeKey(f.name);
      const db = byName.get(key);
      if (!db) return f;
      byName.delete(key);
      return mergeFallbackRowWithDb(f, db);
    });

    const extras = Array.from(byName.values())
      .map((db) => prismaRowToLegacy(db))
      .sort((a, b) => a.id - b.id);

    const combined = [...mergedBase, ...extras];
    combined.sort((a, b) => a.id - b.id);
    const deduped = dedupeSchengenMembersByCanonicalName(combined);
    warnIfSchengenCardinalityExceeded(deduped);
    return deduped;
  } catch (err) {
    console.warn(
      '[buildMergedCountriesList] Prisma failed, using static fallback:',
      err instanceof Error ? err.message : err,
    );
    return fallback.length > 0 ? dedupeSchengenMembersByCanonicalName(fallback) : [];
  }
}

/** Invalidate via `revalidateTag` when merged list must drop `unstable_cache` immediately (e.g. admin country PATCH). */
export const MERGED_COUNTRIES_LIST_CACHE_TAG = 'babil-merged-countries-list';

const fetchMergedCountriesListCrossRequest = unstable_cache(
  fetchMergedCountriesListUncached,
  ['babil-merged-countries-list-v1'],
  { revalidate: 120, tags: [MERGED_COUNTRIES_LIST_CACHE_TAG] },
);

/**
 * Prefer DB rows keyed by country name when both exist (runner / seeded data).
 *
 * **D.56 / D.57:** `cache()` dedupes parallel reads during one Server Component render / request;
 * inner `unstable_cache` avoids re-running Prisma + merge for ~120s across Route Handlers and RSC (aligned with `GET /api/countries` edge TTL).
 */
export const getMergedCountriesListCached = cache(fetchMergedCountriesListCrossRequest);

/**
 * Same merged list as `getMergedCountriesListCached` — use this name when parity with older docs/routes is clearer.
 */
export async function buildMergedCountriesList(): Promise<LegacyCountryRecord[]> {
  return getMergedCountriesListCached();
}

export { approvedComments as countryApprovedCommentsConfig };
