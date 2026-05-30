#!/usr/bin/env tsx
/**
 * Cron entry: batch change detection on SourcePageIndex.
 */
import { runChangeDetectBatch } from '@/lib/source-change-detection'

async function main() {
  const limit = Number(process.env.CHANGE_DETECT_LIMIT || 40)
  const sourceId = process.env.CHANGE_DETECT_SOURCE_ID
  const out = await runChangeDetectBatch({
    limit,
    sourceId: sourceId || undefined,
  })
  console.log(JSON.stringify(out, null, 2))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
