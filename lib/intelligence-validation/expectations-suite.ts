/**
 * Great-Expectations-style field checks on materialize targets (no external GE dep).
 */

import { MATERIALIZE_TARGETS } from '@/lib/intelligence-pipeline/taxonomy-v1';

export type ExpectationViolation = {
  fieldPath: string;
  code: string;
  message: string;
};

function parseNumeric(valueJson: string, valueNumeric: number | null): number | null {
  if (valueNumeric != null && Number.isFinite(valueNumeric)) return valueNumeric;
  try {
    const j = JSON.parse(valueJson) as { value?: number };
    if (typeof j.value === 'number' && Number.isFinite(j.value)) return j.value;
  } catch {
    /* ignore */
  }
  return null;
}

const RANGE_RULES: Record<string, { min?: number; max?: number }> = {
  'general.population_total': { min: 1_000 },
  'economy.gdp_usd_current': { min: 1 },
  'economy.gdp_per_capita_usd_current': { min: 1 },
  'quality.life_expectancy_years': { min: 35, max: 95 },
  'work.unemployment_rate_pct': { min: 0, max: 80 },
  'demographics.urban_population_pct': { min: 0, max: 100 },
};

/** Validate a winning observation value against taxonomy expectations. */
export function runFieldExpectations(args: {
  fieldPath: string;
  valueJson: string | null;
  valueNumeric: number | null;
}): ExpectationViolation[] {
  if (!(args.fieldPath in MATERIALIZE_TARGETS)) return [];

  const n = args.valueJson ? parseNumeric(args.valueJson, args.valueNumeric) : args.valueNumeric;
  const violations: ExpectationViolation[] = [];

  if (n == null || !Number.isFinite(n)) {
    violations.push({
      fieldPath: args.fieldPath,
      code: 'expect_value_present',
      message: 'numeric value required for materialize field',
    });
    return violations;
  }

  const rule = RANGE_RULES[args.fieldPath];
  if (!rule) return violations;

  if (rule.min != null && n < rule.min) {
    violations.push({
      fieldPath: args.fieldPath,
      code: 'expect_min',
      message: `value ${n} below min ${rule.min}`,
    });
  }
  if (rule.max != null && n > rule.max) {
    violations.push({
      fieldPath: args.fieldPath,
      code: 'expect_max',
      message: `value ${n} above max ${rule.max}`,
    });
  }

  return violations;
}

export function expectationsPass(args: {
  fieldPath: string;
  valueJson: string | null;
  valueNumeric: number | null;
}): boolean {
  return runFieldExpectations(args).length === 0;
}
