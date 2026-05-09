/**
 * Compaction C.40 : ne garde que la **dernière** observation par
 * `(countryId, fieldPath, sourceId)` (tri `observedAt` desc, puis `id` desc).
 * Les lignes plus anciennes sont supprimées (ou exportées puis supprimées).
 *
 * @example
 * npx tsx scripts/compact-country-observations.ts --dry-run
 * npx tsx scripts/compact-country-observations.ts --export-json=./observations-compacted.json
 */
import fs from 'node:fs'

import prisma from '../lib/prisma'

function parseArgs(argv: string[]) {
  const dryRun = argv.includes('--dry-run')
  let exportJson: string | null = null
  for (const a of argv) {
    if (a.startsWith('--export-json=')) {
      exportJson = a.slice('--export-json='.length).trim() || null
    }
  }
  return { dryRun, exportJson }
}

async function countDuplicates(): Promise<number> {
  const rows = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*)::bigint AS count
    FROM (
      SELECT id,
             ROW_NUMBER() OVER (
               PARTITION BY "countryId", "fieldPath", "sourceId"
               ORDER BY "observedAt" DESC, id DESC
             ) AS rn
      FROM "CountryObservation"
    ) ranked
    WHERE ranked.rn > 1
  `
  const c = rows[0]?.count
  return c != null ? Number(c) : 0
}

async function fetchDuplicateRows(): Promise<
  Array<{
    id: string
    countryId: number
    fieldPath: string
    valueJson: string
    valueNumeric: number | null
    unit: string | null
    confidence: number
    observedAt: Date
    sourceId: string
    runId: string | null
    rawPayload: string | null
  }>
> {
  return prisma.$queryRaw`
    SELECT o.id, o."countryId", o."fieldPath", o."valueJson", o."valueNumeric", o.unit,
           o.confidence, o."observedAt", o."sourceId", o."runId", o."rawPayload"
    FROM "CountryObservation" o
    INNER JOIN (
      SELECT id
      FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                 PARTITION BY "countryId", "fieldPath", "sourceId"
                 ORDER BY "observedAt" DESC, id DESC
               ) AS rn
        FROM "CountryObservation"
      ) x
      WHERE x.rn > 1
    ) d ON o.id = d.id
  `
}

async function deleteDuplicates(): Promise<number> {
  const result = await prisma.$executeRaw`
    DELETE FROM "CountryObservation" o
    USING (
      SELECT id
      FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                 PARTITION BY "countryId", "fieldPath", "sourceId"
                 ORDER BY "observedAt" DESC, id DESC
               ) AS rn
        FROM "CountryObservation"
      ) x
      WHERE x.rn > 1
    ) d
    WHERE o.id = d.id
  `
  return Number(result)
}

async function main() {
  const { dryRun, exportJson } = parseArgs(process.argv.slice(2))
  const n = await countDuplicates()

  console.log(
    `[compact-country-observations] duplicate_rows_to_remove=${n.toString()} dry_run=${dryRun} export_json=${exportJson ?? 'none'}`,
  )

  if (n === 0) {
    await prisma.$disconnect()
    return
  }

  if (dryRun) {
    console.log('[compact-country-observations] dry-run: no rows deleted.')
    await prisma.$disconnect()
    return
  }

  if (exportJson) {
    const rows = await fetchDuplicateRows()
    const serializable = rows.map((r) => ({
      ...r,
      observedAt: r.observedAt.toISOString(),
    }))
    fs.writeFileSync(exportJson, JSON.stringify(serializable, null, 2), 'utf8')
    console.log(`[compact-country-observations] exported ${rows.length} rows to ${exportJson}`)
  }

  const deleted = await deleteDuplicates()
  console.log(`[compact-country-observations] deleted_count=${deleted}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
