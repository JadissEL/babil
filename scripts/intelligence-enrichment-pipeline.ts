/**
 * CLI: seed sources | run pipeline (World Bank + optional materialize).
 *
 *   npm run intelligence:seed-sources
 *   npm run intelligence:world-bank -- --limit 5
 *   npm run intelligence:world-bank:materialize
 */
import 'dotenv/config'

import prisma from '../lib/prisma'
import { runEnrichmentPipeline, seedIntelligenceSources } from '../lib/intelligence-pipeline/run-enrichment-stub'

function argFlag(name: string): boolean {
  return process.argv.includes(name)
}

function argNumber(name: string): number | undefined {
  const i = process.argv.indexOf(name)
  if (i === -1 || i + 1 >= process.argv.length) return undefined
  const n = Number(process.argv[i + 1])
  return Number.isFinite(n) ? n : undefined
}

async function main() {
  if (argFlag('--seed-sources-only')) {
    const n = await seedIntelligenceSources()
    console.log(`Intelligence sources upserted: ${n}`)
    return
  }

  const worldBank = argFlag('--world-bank')
  const materialize = argFlag('--materialize')
  if (!worldBank && !materialize) {
    const r = await runEnrichmentPipeline({ trigger: argFlag('--cron') ? 'cron' : 'manual' })
    console.log(JSON.stringify(r, null, 2))
    return
  }

  const r = await runEnrichmentPipeline({
    trigger: argFlag('--cron') ? 'cron' : 'manual',
    worldBank,
    materializeEconomy: materialize,
    worldBankLimit: argNumber('--limit'),
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
