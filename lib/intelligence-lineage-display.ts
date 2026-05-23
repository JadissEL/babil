/**
 * Map golden-record `field_lineage` (taxonomy keys) to public full_data paths for UI.
 */

import {
  formatIntelDateShortFr,
  isEconomyIntelFresh,
  latestMaterializedIsoFromIntelMeta,
} from '@/lib/intel-freshness';
import { getIntelligenceFieldPathGlossaryEntry } from '@/lib/intelligence-fieldpath-glossary';
import { MATERIALIZE_TARGETS } from '@/lib/intelligence-pipeline/taxonomy-v1';
import {
  lineageLabel,
  readFieldLineage,
  type FieldLineageEntry,
} from '@/lib/intelligence-validation/promotion-lineage';

export type SemanticStripItem = {
  path: string;
  value: unknown;
  meta?: {
    confidence?: number;
    verificationStatus?: string;
    label?: string;
    sourceSlug?: string;
    provenanceLabel?: string;
    observedAt?: string;
    materializedAt?: string;
  };
};

const FULL_DATA_TO_TAXONOMY = new Map<string, string>();
for (const [taxonomyPath, target] of Object.entries(MATERIALIZE_TARGETS)) {
  FULL_DATA_TO_TAXONOMY.set(target.fullDataPath, taxonomyPath);
}

export type LineageDisplayMeta = {
  confidence?: number;
  verificationStatus?: string;
  sourceSlug?: string;
  provenanceLabel?: string;
  observedAt?: string;
  materializedAt?: string;
};

function readDotPath(full: Record<string, unknown>, dotPath: string): unknown {
  const parts = dotPath.split('.');
  let cur: unknown = full;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

export function taxonomyPathForFullDataPath(fullDataPath: string): string | null {
  return FULL_DATA_TO_TAXONOMY.get(fullDataPath) ?? null;
}

export function lineageEntryForFullDataPath(
  full: Record<string, unknown>,
  fullDataPath: string,
): FieldLineageEntry | null {
  const tax = taxonomyPathForFullDataPath(fullDataPath);
  if (!tax) return null;
  return readFieldLineage(full, tax);
}

export function lineageMetaForFullDataPath(
  full: Record<string, unknown>,
  fullDataPath: string,
): LineageDisplayMeta | undefined {
  const entry = lineageEntryForFullDataPath(full, fullDataPath);
  if (!entry) return undefined;
  const provenanceLabel = lineageLabel(entry) ?? undefined;
  return {
    confidence: entry.confidence,
    verificationStatus: entry.verificationStatus,
    sourceSlug: entry.sourceSlug ?? undefined,
    provenanceLabel,
    observedAt: entry.observedAt,
    materializedAt: entry.materializedAt,
  };
}

export function disputedFieldPathsFromFull(full: Record<string, unknown>): string[] {
  const intel = full._intelligence as Record<string, unknown> | undefined;
  const raw = intel?.disputed_field_paths;
  if (!Array.isArray(raw)) return [];
  return raw.filter((p): p is string => typeof p === 'string' && p.length > 0);
}

export function buildCountryIntelligenceSemanticItems(
  full: Record<string, unknown>,
): SemanticStripItem[] {
  const intelMeta = (full._intelligence ?? {}) as Record<string, unknown>;
  const intelLatest = latestMaterializedIsoFromIntelMeta(intelMeta);
  const economyFresh = isEconomyIntelFresh(intelLatest);
  const materializedAtLabel = intelLatest ? formatIntelDateShortFr(intelLatest) : undefined;

  const items: SemanticStripItem[] = [];

  for (const [taxonomyPath, target] of Object.entries(MATERIALIZE_TARGETS)) {
    const value = readDotPath(full, target.fullDataPath);
    if (value == null || value === '') continue;

    const glossary = getIntelligenceFieldPathGlossaryEntry(taxonomyPath);
    const lineageMeta = lineageMetaForFullDataPath(full, target.fullDataPath);
    const label = glossary?.labelFr ?? target.fullDataPath;

    items.push({
      path: target.fullDataPath,
      value,
      meta: {
        label,
        confidence: lineageMeta?.confidence,
        verificationStatus: lineageMeta?.verificationStatus,
        sourceSlug: lineageMeta?.sourceSlug,
        provenanceLabel: lineageMeta?.provenanceLabel ?? glossary?.sourceLabelFr,
        observedAt: lineageMeta?.observedAt,
        materializedAt:
          lineageMeta?.materializedAt ?? (economyFresh ? materializedAtLabel : undefined),
      },
    });
  }

  return items;
}
