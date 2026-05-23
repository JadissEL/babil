/**
 * Priority scoring for intelligence pipeline jobs and agent country ticks.
 */

import prisma from '@/lib/prisma';
import { parseCountryFullData } from '@/lib/country-full-data-json';
import { evaluateLaunchGate } from '@/lib/launch-gate';
import { MATERIALIZE_TARGETS } from '@/lib/intelligence-pipeline/taxonomy-v1';

export type CountryPriorityInput = {
  countryId: number;
  name: string;
  region: string;
  fullData: Record<string, unknown>;
};

const MOROCCO_RELEVANT_REGIONS = new Set([
  'Europe',
  'North America',
  'Middle East',
  'Asia',
  'Africa',
]);

function hasNumericAtPath(full: Record<string, unknown>, dotPath: string): boolean {
  const parts = dotPath.split('.');
  let cur: unknown = full;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return false;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === 'number' && Number.isFinite(cur);
}

function countMissingMaterializePaths(full: Record<string, unknown>): number {
  let missing = 0;
  for (const fp of Object.keys(MATERIALIZE_TARGETS)) {
    const target = MATERIALIZE_TARGETS[fp].fullDataPath;
    if (!hasNumericAtPath(full, target)) missing += 1;
  }
  return missing;
}

export function scoreCountryPriority(input: CountryPriorityInput): number {
  let score = 0;
  const agent = input.fullData._agent as Record<string, unknown> | undefined;
  const updatedAt = typeof agent?.updatedAt === 'string' ? Date.parse(agent.updatedAt) : NaN;
  if (!Number.isFinite(updatedAt)) {
    score += 40;
  } else {
    const ageDays = (Date.now() - updatedAt) / 86_400_000;
    if (ageDays > 30) score += 35;
    else if (ageDays > 14) score += 20;
    else if (ageDays > 7) score += 10;
  }

  if (MOROCCO_RELEVANT_REGIONS.has(input.region)) score += 15;

  const gate = evaluateLaunchGate(
    {
      name: input.name,
      region: input.region,
      schengen_flag: false,
      tourist_visa_score: null,
      study_visa_score: null,
      work_visa_score: null,
      business_visa_score: null,
      appointment_difficulty: null,
      full_data: input.fullData,
    },
    { ignoreCriticalMissing: true },
  );
  if (gate.completenessScore < 72) score += 25;
  else if (gate.completenessScore < 85) score += 10;

  const intel = input.fullData._intelligence as Record<string, unknown> | undefined;
  if (!intel?.economy_materialized_at) score += 8;

  const disputed = Array.isArray(intel?.disputed_field_paths)
    ? (intel.disputed_field_paths as string[]).length
    : 0;
  score += Math.min(20, disputed * 4);

  const missingMat = countMissingMaterializePaths(input.fullData);
  score += Math.min(24, missingMat * 4);

  return score;
}

export async function listStaleCountryIds(
  limit: number,
): Promise<{ countryId: number; priority: number }[]> {
  const rows = await prisma.country.findMany({
    select: { id: true, name: true, region: true, full_data: true },
    take: Math.min(500, Math.max(limit * 3, limit)),
  });

  const scored = rows.map((r) => {
    const fullData = parseCountryFullData(r.full_data);
    return {
      countryId: r.id,
      priority: scoreCountryPriority({
        countryId: r.id,
        name: r.name,
        region: r.region,
        fullData,
      }),
    };
  });

  scored.sort((a, b) => b.priority - a.priority);
  return scored.slice(0, limit);
}
