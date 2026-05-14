/**
 * Backfill the relational `CountryEducationProgram` table from existing `Country.full_data` JSON.
 * Run once after deploying the migration `20260514180000_country_education_programs`.
 *
 * Usage:
 *   npx tsx scripts/backfill-country-education-programs.ts --dry-run
 *   npx tsx scripts/backfill-country-education-programs.ts --apply
 */
import 'dotenv/config'

import { syncCountryEducationProgramsFromFullData } from '../lib/country-education-programs-sync'
import { extractEducationPrograms } from '../lib/country-education-programs'
import { parseCountryFullData } from '../lib/country-full-data-json'
import prisma from '../lib/prisma'

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

  const countries = await prisma.country.findMany({
    select: { id: true, name: true, full_data: true },
    orderBy: { id: 'asc' },
  })

  let countriesWithPrograms = 0
  let totalRows = 0

  for (const c of countries) {
    const parsed = parseCountryFullData(c.full_data)
    const rows = extractEducationPrograms(parsed)
    if (rows.length === 0) continue
    countriesWithPrograms += 1
    totalRows += rows.length

    if (dryRun) {
      const kinds = rows.map((r) => r.kind).join(',')
      console.log(`  [dry-run] ${c.name} (id=${c.id}) → ${rows.length} program(s): ${kinds}`)
      continue
    }

    try {
      const result = await syncCountryEducationProgramsFromFullData(prisma, c.id, parsed, {
        sourceVersion: 'backfill',
      })
      console.log(
        `  synced ${c.name} (id=${c.id}) → upserted=${result.upserted.join(',') || '∅'} deleted=${
          result.deleted.join(',') || '∅'
        }`,
      )
    } catch (err) {
      console.warn(
        `  ! sync failed for ${c.name} (id=${c.id}):`,
        err instanceof Error ? err.message : err,
      )
    }
  }

  console.log(
    `${dryRun ? '[dry-run] ' : ''}Done — ${countriesWithPrograms} countries with education programs, ${totalRows} program row(s) total.`,
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
