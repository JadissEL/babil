/**
 * Rules-first contradiction scan on raw excerpts (no LLM required).
 */

import type { ContradictionExcerpt } from './contradiction-excerpts';

const RELATIVE_DELTA_MIN = 0.12;

function numbersFromExcerpt(excerpt: string, valueNumeric: number | null): number[] {
  const out: number[] = [];
  if (valueNumeric != null && Number.isFinite(valueNumeric) && valueNumeric > 0) {
    out.push(valueNumeric);
  }
  try {
    const j = JSON.parse(excerpt) as { value?: number; population?: number };
    if (typeof j.value === 'number' && j.value > 0) out.push(j.value);
    if (typeof j.population === 'number' && j.population > 0) out.push(j.population);
  } catch {
    const m = excerpt.match(/\b(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?)\b/g);
    if (m) {
      for (const raw of m.slice(0, 3)) {
        const n = Number(raw.replace(/,/g, '').replace(/\./g, ''));
        if (Number.isFinite(n) && n > 1_000) out.push(n);
      }
    }
  }
  return out;
}

/** Flag field paths where numeric signals in excerpts diverge beyond threshold. */
export function runHeuristicContradictionPass(excerpts: ContradictionExcerpt[]): {
  conflicts: string[];
  flaggedPaths: string[];
} {
  const byKey = new Map<string, number[]>();

  for (const e of excerpts) {
    const key = `${e.countryId}:${e.fieldPath}`;
    const nums = numbersFromExcerpt(e.excerpt, e.valueNumeric);
    if (nums.length === 0) continue;
    const list = byKey.get(key) ?? [];
    list.push(...nums);
    byKey.set(key, list);
  }

  const conflicts: string[] = [];
  const flaggedPaths: string[] = [];

  for (const [key, nums] of Array.from(byKey.entries())) {
    if (nums.length < 2) continue;
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    if (min <= 0) continue;
    const rel = (max - min) / min;
    if (rel >= RELATIVE_DELTA_MIN) {
      const [countryId, fieldPath] = key.split(':');
      const msg = `heuristic:${countryId}:${fieldPath}:min=${min}:max=${max}:rel=${rel.toFixed(3)}`;
      conflicts.push(msg);
      flaggedPaths.push(fieldPath);
    }
  }

  return { conflicts, flaggedPaths };
}
