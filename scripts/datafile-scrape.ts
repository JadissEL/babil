#!/usr/bin/env tsx
/**
 * Run the datafile scrape algorithm over sources.master.json (~300 sites).
 *
 * Usage:
 *   npm run datafile:scrape
 *   npm run datafile:scrape -- --limit=5
 *   npm run datafile:scrape -- --source-id=world_bank
 *   npm run datafile:scrape -- --write-db --resume
 */
import { runDatafileScrapeAlgorithm } from '@/lib/datafile/scraper/run-scrape'

const args = process.argv.slice(2)
const limitArg = args.find((a) => a.startsWith('--limit='))
const sourceIdArg = args.find((a) => a.startsWith('--source-id='))
const runIdArg = args.find((a) => a.startsWith('--run-id='))

async function main() {
  const manifest = await runDatafileScrapeAlgorithm({
    limit: limitArg ? Number(limitArg.split('=')[1]) : undefined,
    sourceId: sourceIdArg?.split('=')[1],
    runId: runIdArg?.split('=')[1],
    resume: args.includes('--resume') || args.includes('--retry-failed'),
    retryFailed: args.includes('--retry-failed'),
    writeDb: args.includes('--write-db'),
    countryIdForObservations: args.includes('--country-id=')
      ? Number(args.find((a) => a.startsWith('--country-id='))!.split('=')[1])
      : undefined,
  })
  console.log(JSON.stringify(manifest, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
