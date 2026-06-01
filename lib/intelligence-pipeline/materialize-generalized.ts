/**
 * Knowledge profile upsert for countries (no validation loop — called from materializeApprovedObservations).
 */

import { upsertCountryKnowledgeProfile } from '@/lib/intelligence-pipeline/taxonomy-v2'
import { COUNTRY_INTELLIGENCE_CONTRACT_V2 } from '@/lib/country-intelligence-contract'
import prisma from '@/lib/prisma'

export async function materializeCountryWithLineage(args?: {
  countryIds?: number[]
  limit?: number
}): Promise<{ materialized: number; profiles: number }> {
  const criticalPaths = COUNTRY_INTELLIGENCE_CONTRACT_V2.filter((f) => f.critical).map(
    (f) => f.path,
  )

  const countries = args?.countryIds?.length
    ? args.countryIds
    : (
        await prisma.country.findMany({
          select: { id: true },
          take: args?.limit ?? 50,
        })
      ).map((c) => c.id)

  let profiles = 0
  for (const countryId of countries) {
    const obs = await prisma.countryObservation.findMany({
      where: { countryId, verificationStatus: { in: ['verified', 'partially_verified'] } },
      select: { fieldPath: true },
      distinct: ['fieldPath'],
    })
    const active = Array.from(
      new Set([...criticalPaths, ...obs.map((o) => o.fieldPath)]),
    )
    await upsertCountryKnowledgeProfile(countryId, active)
    profiles++
  }

  return { materialized: 0, profiles }
}
