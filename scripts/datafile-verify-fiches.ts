#!/usr/bin/env tsx
/**
 * Phase D verification: sample Schengen + Morocco-corridor countries and report
 * materialized visa fields in Country.full_data vs pending observations.
 *
 * npm run datafile:verify-fiches
 */
import 'dotenv/config'

import { MOROCCO_CORRIDOR_DESTINATION_NAMES } from '@/lib/datafile/extract/morocco-corridor-destinations'
import prisma from '@/lib/prisma'

const VISA_FULL_DATA_PATHS = [
  'visa_processing_time',
  'visa_system.tourism.fees',
  'appointment_audit.avg_wait_time',
  'friction_analysis.real_delay',
  'appointment_difficulty',
] as const

function getDeep(obj: Record<string, unknown>, dottedPath: string): unknown {
  let cur: unknown = obj
  for (const part of dottedPath.split('.')) {
    if (typeof cur !== 'object' || cur === null) return undefined
    cur = (cur as Record<string, unknown>)[part]
  }
  return cur
}

function shortValue(v: unknown): string {
  if (v == null) return '—'
  const s = typeof v === 'string' ? v : JSON.stringify(v)
  return s.length > 60 ? `${s.slice(0, 57)}...` : s
}

async function main() {
  const schengen = await prisma.country.findMany({
    where: { schengen_flag: true },
    select: { id: true, name: true, full_data: true },
    orderBy: { name: 'asc' },
    take: 10,
  })
  const corridorNames = MOROCCO_CORRIDOR_DESTINATION_NAMES.filter(
    (n) => !schengen.some((s) => s.name === n),
  ).slice(0, 5)
  const corridor = await prisma.country.findMany({
    where: { name: { in: [...corridorNames] } },
    select: { id: true, name: true, full_data: true },
  })

  const sample = [...schengen, ...corridor]
  const rows: Record<string, unknown>[] = []

  for (const country of sample) {
    let full: Record<string, unknown> = {}
    try {
      full = JSON.parse(country.full_data ?? '{}') as Record<string, unknown>
    } catch {
      /* keep empty */
    }

    const obsCounts = await prisma.countryObservation.groupBy({
      by: ['verificationStatus'],
      where: { countryId: country.id, dedupeKey: { startsWith: 'manifest-visa:' } },
      _count: true,
    })

    const fieldValues: Record<string, string> = {}
    let materializedCount = 0
    for (const p of VISA_FULL_DATA_PATHS) {
      const v = getDeep(full, p)
      fieldValues[p] = shortValue(v)
      if (v != null && String(v).trim() !== '') materializedCount += 1
    }

    rows.push({
      country: country.name,
      materializedVisaFields: `${materializedCount}/${VISA_FULL_DATA_PATHS.length}`,
      observations: Object.fromEntries(obsCounts.map((o) => [o.verificationStatus, o._count])),
      ...fieldValues,
    })
  }

  console.log(JSON.stringify(rows, null, 2))

  const totals = {
    sampled: rows.length,
    withVisaProcessingTime: rows.filter((r) => r['visa_processing_time'] !== '—').length,
    withFees: rows.filter((r) => r['visa_system.tourism.fees'] !== '—').length,
    withWaitTime: rows.filter((r) => r['appointment_audit.avg_wait_time'] !== '—').length,
  }
  console.log('TOTALS', JSON.stringify(totals))

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
