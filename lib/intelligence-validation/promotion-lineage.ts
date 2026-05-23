/**
 * Open-lineage-style field provenance on golden record (`Country.full_data`).
 * @see https://www.compelframework.org/articles/data-lineage-documentation-practices
 */

export type FieldLineageEntry = {
  observationId: string;
  fieldPath: string;
  sourceSlug: string | null;
  confidence: number;
  verificationStatus: string;
  observedAt: string;
  materializedAt: string;
};

export function stampPromotionLineage(
  full: Record<string, unknown>,
  winners: Array<{
    fieldPath: string;
    observationId: string;
    sourceSlug: string | null;
    confidence: number;
    verificationStatus: string;
    observedAt: Date;
  }>,
): void {
  const now = new Date().toISOString();
  const intel = (full._intelligence ?? {}) as Record<string, unknown>;
  const lineage = { ...((intel.field_lineage ?? {}) as Record<string, FieldLineageEntry>) };

  for (const w of winners) {
    lineage[w.fieldPath] = {
      observationId: w.observationId,
      fieldPath: w.fieldPath,
      sourceSlug: w.sourceSlug,
      confidence: w.confidence,
      verificationStatus: w.verificationStatus,
      observedAt: w.observedAt.toISOString(),
      materializedAt: now,
    };
  }

  intel.field_lineage = lineage;
  intel.last_golden_promotion_at = now;
  full._intelligence = intel;
}

/** Read lineage for a materialized full_data path (economy.* → taxonomy fieldPath). */
export function readFieldLineage(
  full: Record<string, unknown>,
  fieldPath: string,
): FieldLineageEntry | null {
  const intel = full._intelligence as Record<string, unknown> | undefined;
  const lineage = intel?.field_lineage as Record<string, FieldLineageEntry> | undefined;
  return lineage?.[fieldPath] ?? null;
}

export function lineageLabel(entry: FieldLineageEntry | null): string | null {
  if (!entry) return null;
  const src = entry.sourceSlug ?? 'source';
  return `${src} · ${Math.round(entry.confidence * 100)}%`;
}
