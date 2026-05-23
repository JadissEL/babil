/**
 * Ingestion-stage quality gates: reject / quarantine / pass (Unstructured.io-style framework).
 */

import type { ObservationVerificationStatus } from '@prisma/client';

export type QualityGateDecision = 'pass' | 'quarantine' | 'reject';

export type QualityGateInput = {
  fieldPath: string;
  confidence: number;
  hasNumericValue: boolean;
  sourceUrl: string | null;
  rawExcerpt: string | null;
};

export function evaluateIngestionQualityGate(input: QualityGateInput): {
  decision: QualityGateDecision;
  verificationStatus: ObservationVerificationStatus;
  reason?: string;
} {
  if (!input.fieldPath.trim()) {
    return { decision: 'reject', verificationStatus: 'disputed', reason: 'empty_field_path' };
  }
  if (input.confidence < 0.25) {
    return { decision: 'reject', verificationStatus: 'disputed', reason: 'confidence_too_low' };
  }
  if (input.fieldPath.startsWith('provenance.manifest.') && !input.rawExcerpt && !input.sourceUrl) {
    return {
      decision: 'quarantine',
      verificationStatus: 'pending',
      reason: 'manifest_missing_provenance',
    };
  }
  if (input.confidence < 0.5 && input.hasNumericValue) {
    return {
      decision: 'quarantine',
      verificationStatus: 'pending',
      reason: 'low_confidence_numeric',
    };
  }
  if (input.confidence >= 0.65 && input.hasNumericValue) {
    return { decision: 'pass', verificationStatus: 'estimated' };
  }
  return { decision: 'pass', verificationStatus: 'pending' };
}
