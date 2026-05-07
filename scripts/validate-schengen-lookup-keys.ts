import { readFileSync } from 'node:fs'
import path from 'node:path'

import { listSchengenNormalizedLookupKeys } from '../lib/schengen-members'

function main() {
  const expected = listSchengenNormalizedLookupKeys()
  const filePath = path.join(process.cwd(), 'data', 'schengen-lookup-keys.json')
  let onDisk: string[]
  try {
    const raw = JSON.parse(readFileSync(filePath, 'utf8')) as { keys?: unknown }
    onDisk = Array.isArray(raw.keys) ? (raw.keys as string[]) : []
  } catch (e) {
    console.error('Missing or invalid data/schengen-lookup-keys.json', e)
    process.exit(1)
    return
  }

  const mismatch =
    onDisk.length !== expected.length || onDisk.some((k, i) => k !== expected[i])
  if (mismatch) {
    console.error(
      'data/schengen-lookup-keys.json is out of sync with lib/schengen-members.ts.\nRun: npm run export:schengen-keys',
    )
    process.exit(1)
    return
  }
  console.log(`schengen-lookup-keys.json OK (${expected.length} keys)`)
}

main()
