/**
 * Insert PostgreSQL `Country` rows for names that exist in `data/countries.json` but not in the DB.
 * Does **not** update existing rows (use `npm run seed` or backfill for that).
 *
 * Usage:
 *   npx tsx scripts/upsert-missing-countries-from-static.ts --dry-run
 *   npx tsx scripts/upsert-missing-countries-from-static.ts --apply
 */
import 'dotenv/config'

import prisma from '../lib/prisma'
import { loadFallbackCountries, type LegacyCountryRecord } from '../lib/countries-fallback'
import { buildCountryPrismaPayloadFromStaticRecord } from '../lib/country-upsert-from-static'

function countryNameMergeKey(name: string): string {
  return name.normalize('NFC').trim().replace(/\s+/g, ' ').toLowerCase()
}

function argFlag(name: string): boolean {
  return process.argv.includes(name)
}

async function main() {
  const dryRun = argFlag('--dry-run')
  const apply = argFlag('--apply')
  if (!dryRun && !apply) {
    console.error('Specify --dry-run or --apply')
    process.exit(1)
  }

  const fallback = await loadFallbackCountries()
  const existing = await prisma.country.findMany({ select: { name: true } })
  const existingKeys = new Set(existing.map((r) => countryNameMergeKey(r.name)))

  const seenNew = new Set<string>()
  const missing: LegacyCountryRecord[] = []
  for (const r of fallback) {
    const k = countryNameMergeKey(r.name)
    if (existingKeys.has(k)) continue
    if (seenNew.has(k)) continue
    seenNew.add(k)
    missing.push(r)
  }

  if (missing.length === 0) {
    console.log('No missing countries: DB already has a row for every static JSON name.')
    return
  }

  console.log(`Missing vs static JSON: ${missing.length} (static total ${fallback.length}, DB ${existing.length})`)

  if (dryRun) {
    for (const r of missing.slice(0, 40)) {
      console.log(`  [dry-run] would create: ${r.name}`)
    }
    if (missing.length > 40) console.log(`  ... and ${missing.length - 40} more`)
    return
  }

  let created = 0
  for (const r of missing) {
    const raw = r.full_data as Record<string, unknown>
    const payload = buildCountryPrismaPayloadFromStaticRecord(raw)
    await prisma.country.create({ data: payload })
    created += 1
  }
  console.log(`Created ${created} country rows.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
