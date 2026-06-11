#!/usr/bin/env tsx
/**
 * End-to-end datafile intelligence pipeline (local / prod with ALLOW_PROD_WRITES=1).
 *
 * Usage:
 *   npm run datafile:pipeline -- --run-id=run_2026-05-30T13-18-10-318Z_c9a3e772
 *   npm run datafile:pipeline -- --skip-scrape --all-countries --materialize
 */
import 'dotenv/config'

import { bronzeScrapeRunToObservations } from '@/lib/datafile/extract/bronze-to-observations'
import { runManifestVisaExtraction } from '@/lib/datafile/extract/manifest-visa-to-observations'
import { materializeApprovedObservations } from '@/lib/intelligence-validation'
import { assertProdWritesAllowed } from '@/lib/prod-write-guard'
import prisma from '@/lib/prisma'

const args = process.argv.slice(2)
const runIdArg = args.find((a) => a.startsWith('--run-id='))
const runId = runIdArg?.split('=')[1]

async function main() {
  assertProdWritesAllowed('datafile:pipeline')

  const steps: Record<string, unknown> = {}

  if (runId && !args.includes('--skip-bronze')) {
    steps.bronze = await bronzeScrapeRunToObservations({
      runId,
      writeDb: true,
      llmFill: args.includes('--llm-fill'),
    })
  }

  if (!args.includes('--skip-manifest')) {
    steps.manifest = await runManifestVisaExtraction({
      allCountries: args.includes('--all-countries'),
      moroccoCorridor: args.includes('--corridor-maroc'),
      schengenOnly:
        args.includes('--schengen') &&
        !args.includes('--all-countries') &&
        !args.includes('--corridor-maroc'),
      limit: args.find((a) => a.startsWith('--limit='))
        ? Number(args.find((a) => a.startsWith('--limit='))!.split('=')[1])
        : undefined,
      writeDb: true,
      llmFill: args.includes('--llm-fill'),
    })
  }

  if (args.includes('--materialize') || args.includes('--validate')) {
    const visaDedupe = [{ startsWith: 'manifest-visa:' }, { startsWith: 'curated-visa:' }]
    const bumped = await prisma.countryObservation.updateMany({
      where: {
        OR: visaDedupe.map((d) => ({ dedupeKey: d })),
        verificationStatus: { in: ['pending', 'needs_review'] },
        confidence: { gte: 0.65 },
      },
      data: { verificationStatus: 'estimated' },
    })
    steps.observationsBumpedToEstimated = bumped.count

    const visaCountryRows = await prisma.countryObservation.findMany({
      where: { OR: visaDedupe.map((d) => ({ dedupeKey: d })) },
      distinct: ['countryId'],
      select: { countryId: true },
    })
    const countryIds = visaCountryRows.map((r) => r.countryId)
    steps.materialize = await materializeApprovedObservations(
      countryIds.length > 0 ? { countryIds } : { limit: 250 },
    )
  }

  console.log(JSON.stringify(steps, null, 2))
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
