/**
 * Emit a JSON skeleton with every (categoryId, sourceLabel) from the TS manifest.
 * Fill `urlTemplate` with https URLs, then merge rows into `data/agent-manifest-url-map.json`.
 *
 * Usage: `npm run agent:manifest-scaffold`
 * Optional: `npx tsx scripts/scaffold-agent-manifest-url-map.ts path/to/out.json`
 */

import { writeFileSync } from 'node:fs'
import path from 'node:path'
import {
  AGENT_COMBINED_STRUCTURED_SOURCE_ROW_TOTAL,
  AGENT_MOROCCO_SOURCE_CATEGORIES,
  AGENT_RESEARCH_SOURCE_CATEGORIES,
} from '../lib/agent-research-sources'

function main() {
  const outPath =
    process.argv[2]?.trim() ||
    path.join(process.cwd(), 'data', 'agent-manifest-url-map.scaffold.json')

  const entries: Array<{
    categoryId: string
    sourceLabel: string
    method: 'GET'
    urlTemplate: string
    responseKind?: 'json' | 'text'
  }> = []

  for (const cat of AGENT_RESEARCH_SOURCE_CATEGORIES) {
    for (const sourceLabel of cat.sources) {
      entries.push({ categoryId: cat.id, sourceLabel, method: 'GET', urlTemplate: '' })
    }
  }
  for (const cat of AGENT_MOROCCO_SOURCE_CATEGORIES) {
    for (const sourceLabel of cat.sources) {
      entries.push({ categoryId: cat.id, sourceLabel, method: 'GET', urlTemplate: '' })
    }
  }

  const doc = {
    version: '1-scaffold',
    entries,
    _comment:
      'Fill each urlTemplate with a stable https URL (placeholders: {country}, {region}, {slug}, {encodedCountry}). Copy completed rows into data/agent-manifest-url-map.json (gitignored). See docs/internal-manifest-url-fetch.md.',
  }

  writeFileSync(outPath, `${JSON.stringify(doc, null, 2)}\n`, 'utf8')
  console.log(
    `[agent:manifest-scaffold] wrote ${entries.length} entries (expected manifest rows ~${AGENT_COMBINED_STRUCTURED_SOURCE_ROW_TOTAL}) to ${path.relative(process.cwd(), outPath)}`,
  )
}

main()
