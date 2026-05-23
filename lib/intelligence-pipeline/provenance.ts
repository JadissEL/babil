import { parseCountryFullData } from '@/lib/country-full-data-json';
import type { FieldLineageEntry } from '@/lib/intelligence-validation/promotion-lineage';
import prisma from '@/lib/prisma';

export type IntelligenceProvenanceRow = {
  fieldPath: string;
  observedAt: Date;
  confidence: number;
  source: { slug: string; name: string; tier: string };
  /** Promoted winner on golden record (`full_data._intelligence.field_lineage`). */
  goldenRecord?: boolean;
  materializedAt?: string;
  verificationStatus?: string;
  observationId?: string;
};

async function sourceMetaForSlug(slug: string | null): Promise<{
  slug: string;
  name: string;
  tier: string;
}> {
  if (!slug) return { slug: 'unknown', name: 'Source', tier: 'SECONDARY' };
  const row = await prisma.intelligenceSource.findUnique({
    where: { slug },
    select: { slug: true, name: true, tier: true },
  });
  return row
    ? { slug: row.slug, name: row.name, tier: String(row.tier) }
    : { slug, name: slug, tier: 'SECONDARY' };
}

function lineageRowsFromFullData(
  full: Record<string, unknown>,
): Promise<IntelligenceProvenanceRow[]> {
  const intel = full._intelligence as Record<string, unknown> | undefined;
  const lineage = intel?.field_lineage as Record<string, FieldLineageEntry> | undefined;
  if (!lineage || typeof lineage !== 'object') return Promise.resolve([]);

  return Promise.all(
    Object.values(lineage).map(async (entry) => {
      const source = await sourceMetaForSlug(entry.sourceSlug);
      return {
        fieldPath: entry.fieldPath,
        observedAt: new Date(entry.observedAt),
        confidence: entry.confidence,
        source,
        goldenRecord: true,
        materializedAt: entry.materializedAt,
        verificationStatus: entry.verificationStatus,
        observationId: entry.observationId,
      };
    }),
  );
}

/** Aperçu léger pour l’API — observations + golden-record lineage (lineage wins per fieldPath). */
export async function getIntelligenceProvenanceForCountry(
  countryId: number,
  limit = 32,
): Promise<IntelligenceProvenanceRow[]> {
  const country = await prisma.country.findUnique({
    where: { id: countryId },
    select: { full_data: true },
  });
  const full = country?.full_data ? parseCountryFullData(country.full_data) : {};

  const golden = await lineageRowsFromFullData(full);
  const goldenPaths = new Set(golden.map((g) => g.fieldPath));

  const rows = await prisma.countryObservation.findMany({
    where: {
      countryId,
      fieldPath: goldenPaths.size > 0 ? { notIn: Array.from(goldenPaths) } : undefined,
    },
    orderBy: { observedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      fieldPath: true,
      observedAt: true,
      confidence: true,
      verificationStatus: true,
      source: { select: { slug: true, name: true, tier: true } },
    },
  });

  const obsRows: IntelligenceProvenanceRow[] = rows.map((r) => ({
    fieldPath: r.fieldPath,
    observedAt: r.observedAt,
    confidence: r.confidence,
    source: {
      slug: r.source.slug,
      name: r.source.name,
      tier: String(r.source.tier),
    },
    verificationStatus: r.verificationStatus,
    observationId: r.id,
    goldenRecord: false,
  }));

  const merged = [...golden, ...obsRows].sort(
    (a, b) => b.observedAt.getTime() - a.observedAt.getTime(),
  );
  return merged.slice(0, limit);
}
