/**
 * Observation data contracts (schema + semantics) — producer/consumer agreement.
 * @see https://dataskew.io/blog/data-contracts-for-data-engineers/
 */

import { z } from 'zod';
import { MATERIALIZE_TARGETS } from '@/lib/intelligence-pipeline/taxonomy-v1';

const FIELD_PATH_PATTERN = /^[a-z][a-z0-9_.]*$/;

const NumericValueJsonSchema = z
  .object({
    value: z.number().finite(),
    unit: z.string().max(32).optional(),
  })
  .passthrough();

const ManifestSnapshotSchema = z
  .object({
    ok: z.boolean().optional(),
    httpStatus: z.number().int().optional(),
    summary: z.string().max(500).optional(),
    fetchedAt: z.string().optional(),
  })
  .passthrough();

export type DataContractViolation = {
  code: string;
  message: string;
};

export function validateObservationDataContract(input: {
  fieldPath: string;
  valueJson: string;
  valueNumeric: number | null;
}): { valid: boolean; violations: DataContractViolation[] } {
  const violations: DataContractViolation[] = [];
  const path = input.fieldPath.trim();

  if (!path) {
    violations.push({ code: 'empty_field_path', message: 'fieldPath is required' });
    return { valid: false, violations };
  }

  if (!FIELD_PATH_PATTERN.test(path)) {
    violations.push({
      code: 'invalid_field_path_shape',
      message: `fieldPath must match ${FIELD_PATH_PATTERN}`,
    });
  }

  if (path.startsWith('provenance.manifest.')) {
    try {
      const j = JSON.parse(input.valueJson) as unknown;
      const snap = ManifestSnapshotSchema.safeParse(j);
      if (!snap.success) {
        violations.push({
          code: 'manifest_snapshot_shape',
          message: 'provenance.manifest valueJson should be a manifest snapshot object',
        });
      }
    } catch {
      violations.push({ code: 'invalid_json', message: 'valueJson must be valid JSON' });
    }
    return { valid: violations.length === 0, violations };
  }

  const materialize = MATERIALIZE_TARGETS[path];
  if (materialize) {
    let numeric: number | null =
      input.valueNumeric != null && Number.isFinite(input.valueNumeric) ? input.valueNumeric : null;
    try {
      const parsed = NumericValueJsonSchema.safeParse(JSON.parse(input.valueJson));
      if (parsed.success && typeof parsed.data.value === 'number') {
        numeric = parsed.data.value;
      } else if (!parsed.success) {
        violations.push({
          code: 'materialize_value_shape',
          message: `${path} requires { value: number } in valueJson`,
        });
      }
    } catch {
      violations.push({ code: 'invalid_json', message: 'valueJson must be valid JSON' });
    }
    if (numeric == null || !Number.isFinite(numeric)) {
      violations.push({
        code: 'materialize_missing_numeric',
        message: `${path} requires a finite numeric value`,
      });
    }
  }

  return { valid: violations.length === 0, violations };
}
