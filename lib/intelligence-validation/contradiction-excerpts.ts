/**
 * Collect bounded excerpts for contradiction / LLM second-pass.
 */

import prisma from '@/lib/prisma';

export type ContradictionExcerpt = {
  observationId: string;
  countryId: number;
  fieldPath: string;
  excerpt: string;
  valueNumeric: number | null;
  confidence: number;
};

export async function loadContradictionExcerpts(args?: {
  countryIds?: number[];
  limit?: number;
}): Promise<ContradictionExcerpt[]> {
  const limit = args?.limit ?? 48;
  const rows = await prisma.countryObservation.findMany({
    where: {
      ...(args?.countryIds?.length ? { countryId: { in: args.countryIds } } : {}),
      rawExcerpt: { not: null },
      NOT: { rawExcerpt: '' },
    },
    orderBy: [{ verificationStatus: 'desc' }, { observedAt: 'desc' }],
    take: limit,
    select: {
      id: true,
      countryId: true,
      fieldPath: true,
      rawExcerpt: true,
      valueNumeric: true,
      confidence: true,
    },
  });

  return rows
    .filter((r) => r.rawExcerpt && r.rawExcerpt.trim().length > 20)
    .map((r) => ({
      observationId: r.id,
      countryId: r.countryId,
      fieldPath: r.fieldPath,
      excerpt: r.rawExcerpt!.trim().slice(0, 4000),
      valueNumeric: r.valueNumeric,
      confidence: r.confidence,
    }));
}
