/**
 * Client-safe intelligence coverage score from `full_data` (no DB).
 */

import { MATERIALIZE_TARGETS } from '@/lib/intelligence-pipeline/taxonomy-v1';

function readDotPath(full: Record<string, unknown>, dotPath: string): unknown {
  const parts = dotPath.split('.');
  let cur: unknown = full;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function hasNumeric(v: unknown): boolean {
  return typeof v === 'number' && Number.isFinite(v);
}

export type CountryIntelligenceCoverageDisplay = {
  score: number;
  materializedCount: number;
  targetCount: number;
  disputedCount: number;
  labelFr: string;
};

export function intelligenceCoverageFromFullData(
  full: Record<string, unknown>,
): CountryIntelligenceCoverageDisplay {
  const targets = Object.values(MATERIALIZE_TARGETS);
  let materializedCount = 0;
  for (const t of targets) {
    if (hasNumeric(readDotPath(full, t.fullDataPath))) materializedCount += 1;
  }

  const intel = (full._intelligence ?? {}) as Record<string, unknown>;
  const disputed = Array.isArray(intel.disputed_field_paths)
    ? (intel.disputed_field_paths as string[]).length
    : 0;

  const targetCount = targets.length;
  const ratio = targetCount > 0 ? materializedCount / targetCount : 0;
  const disputePenalty = Math.min(0.25, disputed * 0.04);
  const score = Math.round(Math.max(0, Math.min(100, ratio * 100 - disputePenalty * 100)));

  let labelFr = 'Couverture limitée';
  if (score >= 85) labelFr = 'Couverture élevée';
  else if (score >= 55) labelFr = 'Couverture partielle';

  return {
    score,
    materializedCount,
    targetCount,
    disputedCount: disputed,
    labelFr,
  };
}
