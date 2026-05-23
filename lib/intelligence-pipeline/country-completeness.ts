/**
 * Per-country intelligence completeness score (materialize coverage + provenance + disputes).
 */

import { parseCountryFullData } from '@/lib/country-full-data-json';
import prisma from '@/lib/prisma';
import { MATERIALIZE_TARGETS } from './taxonomy-v1';

const MATERIALIZE_PATHS = Object.keys(MATERIALIZE_TARGETS);

export type CountryIntelligenceCompleteness = {
  countryId: number;
  name: string;
  region: string | null;
  score: number;
  materializedCoverage: number;
  pathsWithObservations: number;
  pathsMaterializedInFullData: number;
  manifestProvenanceCount: number;
  disputedFieldCount: number;
  missingPaths: string[];
};

function hasNumericInFullData(full: Record<string, unknown>, dotPath: string): boolean {
  const parts = dotPath.split('.');
  let cur: unknown = full;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return false;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === 'number' && Number.isFinite(cur);
}

export async function scoreCountryIntelligenceCompleteness(
  countryId: number,
): Promise<CountryIntelligenceCompleteness | null> {
  const country = await prisma.country.findUnique({
    where: { id: countryId },
    select: { id: true, name: true, region: true, full_data: true },
  });
  if (!country) return null;

  const full = parseCountryFullData(country.full_data);
  const intel = (full._intelligence ?? {}) as Record<string, unknown>;
  const disputed = Array.isArray(intel.disputed_field_paths)
    ? (intel.disputed_field_paths as string[])
    : [];

  const obs = await prisma.countryObservation.findMany({
    where: { countryId },
    select: { fieldPath: true, verificationStatus: true },
  });

  const pathsWithObs = new Set(
    obs
      .filter((o) => MATERIALIZE_PATHS.includes(o.fieldPath))
      .filter((o) => o.verificationStatus !== 'disputed')
      .map((o) => o.fieldPath),
  );

  let pathsMaterialized = 0;
  const missingPaths: string[] = [];
  for (const fp of MATERIALIZE_PATHS) {
    const target = MATERIALIZE_TARGETS[fp].fullDataPath;
    const fromObs = pathsWithObs.has(fp);
    const fromFull = hasNumericInFullData(full as Record<string, unknown>, target);
    if (fromObs || fromFull) pathsMaterialized += 1;
    else missingPaths.push(fp);
  }

  const manifestProvenanceCount = obs.filter((o) =>
    o.fieldPath.startsWith('provenance.manifest.'),
  ).length;

  const materializedCoverage =
    MATERIALIZE_PATHS.length > 0 ? pathsMaterialized / MATERIALIZE_PATHS.length : 0;

  const provenanceBonus = Math.min(0.15, manifestProvenanceCount * 0.01);
  const disputePenalty = Math.min(0.25, disputed.length * 0.04);
  const score = Math.round(
    Math.max(
      0,
      Math.min(100, materializedCoverage * 85 + provenanceBonus * 100 - disputePenalty * 100),
    ),
  );

  return {
    countryId: country.id,
    name: country.name,
    region: country.region,
    score,
    materializedCoverage: Math.round(materializedCoverage * 1000) / 1000,
    pathsWithObservations: pathsWithObs.size,
    pathsMaterializedInFullData: pathsMaterialized,
    manifestProvenanceCount,
    disputedFieldCount: disputed.length,
    missingPaths,
  };
}

export async function listCountryCompletenessScores(args?: {
  limit?: number;
  minScore?: number;
}): Promise<CountryIntelligenceCompleteness[]> {
  const limit = args?.limit ?? 30;
  const rows = await prisma.country.findMany({
    select: { id: true },
    orderBy: { id: 'asc' },
    take: Math.min(120, limit * 4),
  });

  const scored: CountryIntelligenceCompleteness[] = [];
  for (const r of rows) {
    const s = await scoreCountryIntelligenceCompleteness(r.id);
    if (!s) continue;
    if (args?.minScore != null && s.score < args.minScore) continue;
    scored.push(s);
  }

  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, limit);
}
