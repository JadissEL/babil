/**
 * Normalized intelligence claim shape (observations + future LLM extract).
 * Aligns with field-level citation / confidence best practices.
 */

import type { ObservationVerificationStatus } from '@prisma/client';

export type IntelligenceClaim = {
  countryId: number;
  fieldPath: string;
  topic: string;
  summary: string;
  sourceSlug: string;
  sourceUrl: string | null;
  extractedAt: string;
  rawExcerpt: string | null;
  confidence: number;
  verificationStatus: ObservationVerificationStatus;
  valueJson: string;
  valueNumeric?: number | null;
};

export function claimFromObservationRow(row: {
  countryId: number;
  fieldPath: string;
  valueJson: string;
  valueNumeric: number | null;
  confidence: number;
  observedAt: Date;
  verificationStatus: ObservationVerificationStatus;
  sourceUrl: string | null;
  rawExcerpt: string | null;
  source: { slug: string; name: string };
}): IntelligenceClaim {
  let summary = row.fieldPath;
  try {
    const j = JSON.parse(row.valueJson) as { summary?: string; value?: unknown };
    if (typeof j.summary === 'string') summary = j.summary;
    else if (j.value != null) summary = String(j.value);
  } catch {
    /* keep fieldPath */
  }
  return {
    countryId: row.countryId,
    fieldPath: row.fieldPath,
    topic: row.fieldPath.split('.')[0] ?? 'general',
    summary,
    sourceSlug: row.source.slug,
    sourceUrl: row.sourceUrl,
    extractedAt: row.observedAt.toISOString(),
    rawExcerpt: row.rawExcerpt,
    confidence: row.confidence,
    verificationStatus: row.verificationStatus,
    valueJson: row.valueJson,
    valueNumeric: row.valueNumeric,
  };
}
