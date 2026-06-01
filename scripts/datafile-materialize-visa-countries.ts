#!/usr/bin/env tsx
/**
 * Bump manifest-visa observations to estimated and materialize only affected countries.
 * npm run datafile:materialize-visa-countries
 */
import 'dotenv/config'

import { materializeApprovedObservations } from '@/lib/intelligence-validation'
import { assertProdWritesAllowed } from '@/lib/prod-write-guard'
import prisma from '@/lib/prisma'

async function main() {
  assertProdWritesAllowed('datafile:materialize-visa-countries')

  const bumped = await prisma.countryObservation.updateMany({
    where: {
      dedupeKey: { startsWith: 'manifest-visa:' },
      verificationStatus: { in: ['pending', 'needs_review'] },
      confidence: { gte: 0.65 },
    },
    data: { verificationStatus: 'estimated' },
  })

  const rows = await prisma.countryObservation.findMany({
    where: {
      fieldPath: 'visa_processing_time',
      dedupeKey: { startsWith: 'manifest-visa:' },
    },
    distinct: ['countryId'],
    select: { countryId: true },
  })

  const countryIds = rows.map((r) => r.countryId)
  console.log(
    `[datafile:materialize-visa] bumped=${bumped.count} countries=${countryIds.length}`,
  )

  const result = await materializeApprovedObservations({ countryIds })
  console.log(
    JSON.stringify({
      materialized: result.materialized,
      promotable: result.report.promotable,
      countriesProcessed: result.report.countriesProcessed,
      profilesUpdated: result.profilesUpdated,
    }),
  )

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
