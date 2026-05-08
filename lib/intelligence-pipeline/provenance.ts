import prisma from '@/lib/prisma'

export type IntelligenceProvenanceRow = {
  fieldPath: string
  observedAt: Date
  confidence: number
  source: { slug: string; name: string; tier: string }
}

/** Aperçu léger pour l’API (sources + dates), sans payload brut. */
export async function getIntelligenceProvenanceForCountry(
  countryId: number,
  limit = 32,
): Promise<IntelligenceProvenanceRow[]> {
  const rows = await prisma.countryObservation.findMany({
    where: { countryId },
    orderBy: { observedAt: 'desc' },
    take: limit,
    select: {
      fieldPath: true,
      observedAt: true,
      confidence: true,
      source: { select: { slug: true, name: true, tier: true } },
    },
  })
  return rows
}
