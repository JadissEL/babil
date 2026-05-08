/**
 * Aggregate contract coverage stored in `full_data._data_backfill.contractCoverage` (optional).
 *
 * Usage: npx tsx scripts/report-db-contract-summary.ts
 */
import 'dotenv/config'

import prisma from '../lib/prisma'
import { parseCountryFullData } from '../lib/country-full-data-json'
import { DATA_BACKFILL_META_KEY } from '../lib/contract-coverage-snapshot'

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

async function main() {
  const rows = await prisma.country.findMany({
    select: { name: true, full_data: true },
    orderBy: { name: 'asc' },
  })

  const scores: number[] = []
  const crits: number[] = []
  let missingMeta = 0
  let missingCoverage = 0

  for (const r of rows) {
    const full = parseCountryFullData(r.full_data)
    const bf = full[DATA_BACKFILL_META_KEY]
    if (!isRecord(bf)) {
      missingMeta += 1
      missingCoverage += 1
      continue
    }
    const cov = bf.contractCoverage
    if (!isRecord(cov) || typeof cov.score !== 'number' || !Number.isFinite(cov.score)) {
      missingCoverage += 1
      continue
    }
    scores.push(cov.score)
    const c = cov.criticalMissingCount
    if (typeof c === 'number' && Number.isFinite(c)) crits.push(c)
  }

  const n = scores.length
  const mean = n === 0 ? 0 : scores.reduce((a, b) => a + b, 0) / n
  const sorted = [...scores].sort((a, b) => a - b)
  const median = n === 0 ? 0 : n % 2 === 1 ? sorted[(n - 1) / 2]! : (sorted[n / 2 - 1]! + sorted[n / 2]!) / 2
  const min = n === 0 ? null : sorted[0]!
  const max = n === 0 ? null : sorted[n - 1]!

  const buckets = { '0-24': 0, '25-49': 0, '50-74': 0, '75-100': 0 }
  for (const s of scores) {
    if (s < 25) buckets['0-24'] += 1
    else if (s < 50) buckets['25-49'] += 1
    else if (s < 75) buckets['50-74'] += 1
    else buckets['75-100'] += 1
  }

  const critMean =
    crits.length === 0 ? 0 : crits.reduce((a, b) => a + b, 0) / crits.length

  console.log('=== Contract coverage in DB (from full_data._data_backfill) ===\n')
  console.log(`Countries in DB: ${rows.length}`)
  console.log(`Rows with _data_backfill: ${rows.length - missingMeta}`)
  console.log(`Rows with contractCoverage.score: ${n}`)
  console.log(`Rows missing coverage block: ${missingCoverage}`)
  console.log('')
  console.log(`Score mean: ${mean.toFixed(1)}%  median: ${median.toFixed(1)}%  min: ${min ?? '—'}  max: ${max ?? '—'}`)
  console.log(`Critical missing (avg when present): ${critMean.toFixed(1)}`)
  console.log('')
  console.log('Histogram (score %):', buckets)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
