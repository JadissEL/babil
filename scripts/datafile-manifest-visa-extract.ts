#!/usr/bin/env tsx
/**
 * Manifest fetch per country (visa categories) + structured field extraction.
 *
 * Usage:
 *   npm run datafile:manifest-visa-extract -- --schengen --limit=15 --write-db
 *   npm run datafile:manifest-visa-extract -- --country-ids=1,2,3 --write-db --llm-fill
 */
import { runManifestVisaExtraction } from '@/lib/datafile/extract/manifest-visa-to-observations'

const args = process.argv.slice(2)
const countryIdsArg = args.find((a) => a.startsWith('--country-ids='))
const limitArg = args.find((a) => a.startsWith('--limit='))

async function main() {
  const report = await runManifestVisaExtraction({
    schengenOnly: args.includes('--schengen'),
    allCountries: args.includes('--all-countries'),
    countryIds: countryIdsArg
      ? countryIdsArg
          .split('=')[1]
          .split(',')
          .map((x) => Number(x.trim()))
          .filter((n) => Number.isFinite(n))
      : undefined,
    limit: limitArg ? Number(limitArg.split('=')[1]) : undefined,
    writeDb: args.includes('--write-db'),
    llmFill: args.includes('--llm-fill'),
  })
  console.log(JSON.stringify(report, null, 2))
  if (report.llmSkipReason && args.includes('--llm-fill')) {
    console.warn(`[datafile:manifest-visa-extract] LLM skipped: ${report.llmSkipReason}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
