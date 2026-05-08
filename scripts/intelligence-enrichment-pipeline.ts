/**
 * CLI: seed catalogue sources | run pipeline stub (no network collectors yet).
 *
 *   npx tsx scripts/intelligence-enrichment-pipeline.ts --seed-sources-only
 *   npx tsx scripts/intelligence-enrichment-pipeline.ts
 *   npx tsx scripts/intelligence-enrichment-pipeline.ts --cron
 */
import 'dotenv/config'

import prisma from '../lib/prisma'
import { runEnrichmentPipelineStub, seedIntelligenceSources } from '../lib/intelligence-pipeline/run-enrichment-stub'

async function main() {
  if (process.argv.includes('--seed-sources-only')) {
    const n = await seedIntelligenceSources()
    console.log(`Intelligence sources upserted: ${n}`)
    return
  }

  const r = await runEnrichmentPipelineStub({
    trigger: process.argv.includes('--cron') ? 'cron' : 'manual',
  })
  console.log(JSON.stringify(r, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
