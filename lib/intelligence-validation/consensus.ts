import type { IntelligenceSourceTier, ObservationVerificationStatus } from '@prisma/client';
import {
  compareObservationPrecedence,
  type ObservationForMerge,
} from '@/lib/intelligence-pipeline/merge-observations';
import {
  CONTRADICTION_RELATIVE_DELTA,
  PROMOTION_CONFIDENCE_MIN,
  PROMOTION_SOURCES_MIN,
  type FieldConsensus,
  type ObservationValue,
} from './types';

export type RawObservationRow = {
  id: string;
  countryId: number;
  fieldPath: string;
  valueJson: string;
  valueNumeric: number | null;
  confidence: number;
  observedAt: Date;
  tier: IntelligenceSourceTier;
  sourceSlug?: string;
  verificationStatus?: ObservationVerificationStatus;
};

function parseNumericValue(valueJson: string, valueNumeric: number | null): number | null {
  if (valueNumeric != null && Number.isFinite(valueNumeric)) return valueNumeric;
  try {
    const j = JSON.parse(valueJson) as ObservationValue;
    if (typeof j.value === 'number' && Number.isFinite(j.value)) return j.value;
  } catch {
    /* ignore */
  }
  return null;
}

function valuesContradict(a: number, b: number): boolean {
  const base = Math.max(Math.abs(a), Math.abs(b), 1);
  return Math.abs(a - b) / base > CONTRADICTION_RELATIVE_DELTA;
}

export function buildFieldConsensus(
  countryId: number,
  fieldPath: string,
  rows: RawObservationRow[],
  opts?: { sourceReliabilityBySlug?: Map<string, number> },
): FieldConsensus {
  if (rows.length === 0) {
    return {
      fieldPath,
      countryId,
      verificationStatus: 'pending',
      sourcesConfirmed: 0,
      confidence: 0,
      winningValueJson: null,
      disputed: false,
      observationIds: [],
    };
  }

  const forMerge: ObservationForMerge[] = rows.map((r) => ({
    fieldPath: r.fieldPath,
    valueJson: r.valueJson,
    confidence: r.confidence,
    observedAt: r.observedAt,
    tier: r.tier,
  }));
  const sorted = [...forMerge].sort(compareObservationPrecedence);
  const winner = sorted[0];
  const winnerRow = rows.find((r) => r.valueJson === winner.valueJson) ?? rows[0];

  const numericBySource = new Map<string, number>();
  for (const r of rows) {
    const n = parseNumericValue(r.valueJson, r.valueNumeric);
    if (n != null) numericBySource.set(r.id, n);
  }

  let disputed = false;
  const nums = Array.from(numericBySource.values());
  if (nums.length >= 2) {
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        if (valuesContradict(nums[i], nums[j])) {
          disputed = true;
          break;
        }
      }
      if (disputed) break;
    }
  }

  const agreeing = new Set<string>();
  const winnerNum = parseNumericValue(winnerRow.valueJson, winnerRow.valueNumeric);
  for (const r of rows) {
    const n = parseNumericValue(r.valueJson, r.valueNumeric);
    if (winnerNum == null || n == null) {
      if (r.valueJson === winner.valueJson) agreeing.add(r.id);
      continue;
    }
    if (!valuesContradict(winnerNum, n)) agreeing.add(r.id);
  }

  const sourcesConfirmed = agreeing.size;
  const relMap = opts?.sourceReliabilityBySlug;
  const avgConfidence =
    rows.reduce((s, r) => {
      if (!relMap) return s + r.confidence;
      const mult = r.sourceSlug ? (relMap.get(r.sourceSlug) ?? 0.75) : 0.75;
      return s + r.confidence * mult;
    }, 0) / Math.max(1, rows.length);

  let verificationStatus: ObservationVerificationStatus = 'pending';
  if (disputed) {
    verificationStatus = 'disputed';
  } else if (sourcesConfirmed >= 2 && avgConfidence >= PROMOTION_CONFIDENCE_MIN) {
    verificationStatus = 'verified';
  } else if (
    sourcesConfirmed >= PROMOTION_SOURCES_MIN &&
    avgConfidence >= PROMOTION_CONFIDENCE_MIN * 0.85
  ) {
    verificationStatus = 'estimated';
  } else if (winnerRow.tier === 'TIER_A_OFFICIAL' && avgConfidence >= PROMOTION_CONFIDENCE_MIN) {
    verificationStatus = 'estimated';
  }

  return {
    fieldPath,
    countryId,
    verificationStatus,
    sourcesConfirmed,
    confidence: avgConfidence,
    winningValueJson: winner.valueJson,
    disputed,
    observationIds: rows.map((r) => r.id),
  };
}

export function canPromoteField(consensus: FieldConsensus): boolean {
  if (consensus.disputed || !consensus.winningValueJson) return false;
  const blocked: ObservationVerificationStatus[] = [
    'disputed',
    'pending',
    'needs_review',
    'contradictory',
    'outdated',
    'archived',
  ];
  if (blocked.includes(consensus.verificationStatus)) return false;
  if (consensus.confidence < PROMOTION_CONFIDENCE_MIN) return false;
  if (consensus.sourcesConfirmed < PROMOTION_SOURCES_MIN) return false;
  return true;
}
