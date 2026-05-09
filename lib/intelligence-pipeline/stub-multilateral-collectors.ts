import prisma from '@/lib/prisma'

/** Slugs alignés sur [`default-sources.ts`](./default-sources.ts) — connecteurs réseau à brancher (C.44). */
export const STUB_MULTILATERAL_SLUGS = ['un_data', 'oecd', 'imf_data'] as const

export type StubMultilateralSlug = (typeof STUB_MULTILATERAL_SLUGS)[number]

export type StubCollectorResult = {
  slug: string
  observationsWritten: number
  status: 'skipped_not_implemented'
  message: string
  runId: string
}

/**
 * Placeholders C.44 : vérifie que les sources sont enregistrées ; aucune écriture réseau.
 * Les futures implémentations réutiliseront le même contrat de retour + `IntelligenceSource`.
 */
export async function runStubMultilateralCollectors(runId: string): Promise<StubCollectorResult[]> {
  const out: StubCollectorResult[] = []
  for (const slug of STUB_MULTILATERAL_SLUGS) {
    const src = await prisma.intelligenceSource.findUnique({ where: { slug } })
    if (!src) {
      out.push({
        slug,
        observationsWritten: 0,
        status: 'skipped_not_implemented',
        message: 'Source absente en base — exécuter npm run intelligence:seed-sources',
        runId,
      })
      continue
    }
    out.push({
      slug,
      observationsWritten: 0,
      status: 'skipped_not_implemented',
      message:
        'Placeholder C.44 — API non branchée ; la source est prête pour résolution / tiers dans merge-observations.',
      runId,
    })
  }
  return out
}
