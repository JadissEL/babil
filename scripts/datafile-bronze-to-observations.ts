#!/usr/bin/env tsx
/**
 * Convert datafile scrape bronze JSON → CountryObservation (rules + optional LLM).
 *
 * Usage:
 *   npm run datafile:bronze-to-observations -- --run-id=run_2026-05-30T...
 *   npm run datafile:bronze-to-observations -- --run-id=... --write-db --llm-fill
 */
import { bronzeScrapeRunToObservations } from '@/lib/datafile/extract/bronze-to-observations'

const args = process.argv.slice(2)
const runIdArg = args.find((a) => a.startsWith('--run-id='))
const runId = runIdArg?.split('=')[1]
if (!runId) {
  console.error('Missing --run-id=')
  process.exit(1)
}

const countryIdsArg = args.find((a) => a.startsWith('--country-ids='))
const countryIds = countryIdsArg
  ? countryIdsArg
      .split('=')[1]
      .split(',')
      .map((x) => Number(x.trim()))
      .filter((n) => Number.isFinite(n))
  : undefined

async function main() {
  const report = await bronzeScrapeRunToObservations({
    runId,
    writeDb: args.includes('--write-db'),
    llmFill: args.includes('--llm-fill'),
    countryIds,
  })
  console.log(JSON.stringify(report, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
