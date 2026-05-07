import { writeFileSync } from 'node:fs'
import path from 'node:path'

import { listSchengenNormalizedLookupKeys } from '../lib/schengen-members'

const keys = listSchengenNormalizedLookupKeys()
const outPath = path.join(process.cwd(), 'data', 'schengen-lookup-keys.json')
const payload = {
  version: 1,
  generatedFrom: 'lib/schengen-members.ts — run: npm run export:schengen-keys',
  keys,
}
writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
console.log(`Wrote ${keys.length} keys to ${outPath}`)
