/**
 * One-off audit: runner/DB ↔ static JSON ↔ API expectations.
 *
 * Usage: npx tsx scripts/audit-country-data-pipeline.ts
 */
import 'dotenv/config'

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import prisma from '../lib/prisma'
import { parseCountryFullData } from '../lib/country-full-data-json'

function pct(n: number, d: number) {
  if (d <= 0) return '—'
  return `${((100 * n) / d).toFixed(1)}%`
}

async function main() {
  console.log('=== VisaFlow country data pipeline audit ===\n')

  let jsonCountries = 0
  try {
    const raw = readFileSync(resolve(process.cwd(), 'data', 'countries.json'), 'utf8')
    const parsed = JSON.parse(raw) as { countries?: unknown[] }
    jsonCountries = Array.isArray(parsed.countries) ? parsed.countries.length : 0
    console.log(`Static data/countries.json: ${jsonCountries} countries`)
  } catch {
    console.log('Static data/countries.json: not readable')
  }

  let dbCount = 0
  try {
    const rows = await prisma.country.findMany({
      select: {
        id: true,
        name: true,
        full_data: true,
        tourist_visa_score: true,
        visa_processing_time: true,
      },
    })
    dbCount = rows.length

    let fullDataMissing = 0
    let withAgentMarker = 0
    let defaultScore55 = 0
    let hasEducationMobility = 0

    for (const r of rows) {
      const fd = parseCountryFullData(r.full_data)
      if (!r.full_data || !String(r.full_data).trim()) fullDataMissing += 1
      if (typeof fd._agent === 'object' && fd._agent !== null) withAgentMarker += 1

      const t = typeof r.tourist_visa_score === 'number' ? r.tourist_visa_score : null
      if (t === 5.5) defaultScore55 += 1

      const edu =
        fd.education_mobility &&
        typeof fd.education_mobility === 'object' &&
        fd.education_mobility !== null
      if (edu) hasEducationMobility += 1
    }

    console.log(`\nPrisma Country rows: ${dbCount}`)
    if (dbCount > 0) {
      console.log(`  full_data empty string/null: ${fullDataMissing} (${pct(fullDataMissing, dbCount)})`)
      console.log(
        `  full_data._agent present (runner pass): ${withAgentMarker} (${pct(withAgentMarker, dbCount)})`,
      )
      console.log(`  tourist_visa_score === 5.5: ${defaultScore55} (${pct(defaultScore55, dbCount)})`)
      console.log(
        `  education_mobility object in full_data: ${hasEducationMobility} (${pct(hasEducationMobility, dbCount)})`,
      )
    }
  } catch (e) {
    console.error('\nPrisma query failed (DATABASE_URL / network):', e instanceof Error ? e.message : e)
  }

  const insightRows = await prisma.countryInsight.count().catch(() => -1)
  if (insightRows >= 0) {
    console.log(`\nCountryInsight rows (app unused): ${insightRows}`)
  }

  await prisma.$disconnect()
  console.log('\nDone.')
}

void main()
