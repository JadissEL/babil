/**
 * Backfill PostgreSQL `Country` rows: normalize `full_data` (friction, driving_rights v1,
 * street_food top-level), refresh visa scalars from mobility models, align denormalized
 * columns used in list views — **quality + structure** without running the agent.
 *
 * Usage:
 *   npx tsx scripts/backfill-country-structured-data.ts --dry-run
 *   npx tsx scripts/backfill-country-structured-data.ts --apply
 *   npx tsx scripts/backfill-country-structured-data.ts --apply --limit 20
 */
import 'dotenv/config'

import prisma from '../lib/prisma'
import { parseCountryFullData } from '../lib/country-full-data-json'
import { materializePublicFullData } from '../lib/country-full-data-materialize'
import {
  deriveStreetFoodBusinessAccessFromFullData,
  ensureStreetFoodBusinessAccessOnFullData,
} from '../lib/country-street-food-access'
import { prismaVisaScalarsFromFullData } from '../lib/scoring/prisma-visa-snapshot'

const BACKFILL_META_KEY = '_data_backfill'
const BACKFILL_VERSION = 1

function argFlag(name: string): boolean {
  return process.argv.includes(name)
}

function argNumber(name: string): number | undefined {
  const i = process.argv.indexOf(name)
  if (i === -1 || i + 1 >= process.argv.length) return undefined
  const n = Number(process.argv[i + 1])
  return Number.isFinite(n) ? n : undefined
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function pickDrivingLicenseStatus(full: Record<string, unknown>): string {
  const dl = full.driving_license
  if (!isRecord(dl)) return 'Unknown'
  const s = dl.status
  if (typeof s === 'string' && s.trim()) return s.trim()
  return 'Unknown'
}

function pickFrictionFields(full: Record<string, unknown>): {
  appointment_difficulty: string
  visa_processing_time: string
  rejection_risk: string
} {
  const fa = full.friction_analysis
  if (!isRecord(fa)) {
    return {
      appointment_difficulty: 'Medium',
      visa_processing_time: 'Unknown',
      rejection_risk: 'Medium',
    }
  }
  const risk = typeof fa.risk_level === 'string' && fa.risk_level.trim() ? fa.risk_level.trim() : 'Medium'
  const delay =
    typeof fa.real_delay === 'string' && fa.real_delay.trim() ? fa.real_delay.trim() : 'Unknown'
  return {
    appointment_difficulty: risk,
    visa_processing_time: delay,
    rejection_risk: risk,
  }
}

function pickEducationFields(full: Record<string, unknown>): {
  language_study_access: string
  technical_training_access: string
  short_course_access: string
} {
  const em = full.education_mobility
  if (!isRecord(em)) {
    return {
      language_study_access: 'Unknown',
      technical_training_access: 'Limited',
      short_course_access: 'Unknown',
    }
  }
  const lang = em.language_study
  const tech = em.technical_training
  const short = em.short_courses
  const language_study_access =
    isRecord(lang) && typeof lang.access === 'string' && lang.access.trim()
      ? lang.access.trim()
      : 'Unknown'
  const technical_training_access =
    isRecord(tech) && tech.access_bac === true ? 'Available' : 'Limited'
  const short_course_access =
    isRecord(short) && typeof short.duration === 'string' && short.duration.trim()
      ? short.duration.trim()
      : 'Unknown'
  return { language_study_access, technical_training_access, short_course_access }
}

function attachBackfillMeta(full: Record<string, unknown>, appliedAt: string): Record<string, unknown> {
  const prev = full[BACKFILL_META_KEY]
  const history = isRecord(prev) && Array.isArray(prev.history) ? [...(prev.history as unknown[])] : []
  history.push({ version: BACKFILL_VERSION, appliedAt })
  if (history.length > 12) history.splice(0, history.length - 12)
  return {
    ...full,
    [BACKFILL_META_KEY]: {
      version: BACKFILL_VERSION,
      lastAppliedAt: appliedAt,
      history,
    },
  }
}

function approxEq(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.001
}

function numOrNan(x: number | null | undefined): number {
  if (x == null || typeof x !== 'number' || !Number.isFinite(x)) return Number.NaN
  return x
}

async function main() {
  const dryRun = argFlag('--dry-run')
  const apply = argFlag('--apply')
  const limit = argNumber('--limit')

  if (!dryRun && !apply) {
    console.error('Specify --dry-run (preview) or --apply (write).')
    process.exit(1)
  }

  const rows = await prisma.country.findMany({
    orderBy: { id: 'asc' },
    ...(limit !== undefined ? { take: limit } : {}),
  })

  let wouldUpdate = 0
  let updated = 0
  const appliedAt = new Date().toISOString()

  for (const row of rows) {
    const base = parseCountryFullData(row.full_data)
    const withStreet = ensureStreetFoodBusinessAccessOnFullData(base)
    let full = materializePublicFullData(withStreet)
    if (apply) {
      full = attachBackfillMeta(full, appliedAt)
    }

    const nextJson = JSON.stringify(full)
    const streetFoodBusinessAccess = deriveStreetFoodBusinessAccessFromFullData(full)
    const friction = pickFrictionFields(full)
    const edu = pickEducationFields(full)
    const driving_license_status = pickDrivingLicenseStatus(full)

    const scalars = prismaVisaScalarsFromFullData(full, {
      tourist_visa_score: row.tourist_visa_score,
      study_visa_score: row.study_visa_score,
      work_visa_score: row.work_visa_score,
      business_visa_score: row.business_visa_score,
      street_food_business_access: row.street_food_business_access,
    })

    const fullDataChanged = nextJson !== (row.full_data ?? '')
    const scalarChanged =
      !approxEq(scalars.tourist_visa_score, numOrNan(row.tourist_visa_score)) ||
      !approxEq(scalars.study_visa_score, numOrNan(row.study_visa_score)) ||
      !approxEq(scalars.work_visa_score, numOrNan(row.work_visa_score)) ||
      !approxEq(scalars.business_visa_score, numOrNan(row.business_visa_score)) ||
      (streetFoodBusinessAccess ?? '') !== (row.street_food_business_access ?? '') ||
      driving_license_status !== (row.driving_license_status ?? '') ||
      friction.appointment_difficulty !== (row.appointment_difficulty ?? '') ||
      friction.visa_processing_time !== (row.visa_processing_time ?? '') ||
      friction.rejection_risk !== (row.rejection_risk ?? '') ||
      edu.language_study_access !== (row.language_study_access ?? '') ||
      edu.technical_training_access !== (row.technical_training_access ?? '') ||
      edu.short_course_access !== (row.short_course_access ?? '')

    if (!fullDataChanged && !scalarChanged) continue

    wouldUpdate += 1
    if (dryRun) {
      console.log(
        `[dry-run] ${row.name}: full_data=${fullDataChanged} columns=${scalarChanged} driving_rights.meta=${isRecord(full.driving_rights) ? (full.driving_rights as Record<string, unknown>).meta != null : false}`,
      )
      continue
    }

    await prisma.country.update({
      where: { id: row.id },
      data: {
        full_data: nextJson,
        tourist_visa_score: scalars.tourist_visa_score,
        study_visa_score: scalars.study_visa_score,
        work_visa_score: scalars.work_visa_score,
        business_visa_score: scalars.business_visa_score,
        ...(streetFoodBusinessAccess ? { street_food_business_access: streetFoodBusinessAccess } : {}),
        driving_license_status,
        appointment_difficulty: friction.appointment_difficulty,
        visa_processing_time: friction.visa_processing_time,
        rejection_risk: friction.rejection_risk,
        language_study_access: edu.language_study_access,
        technical_training_access: edu.technical_training_access,
        short_course_access: edu.short_course_access,
      },
    })
    updated += 1
  }

  console.log(
    dryRun
      ? `Dry run: ${wouldUpdate} / ${rows.length} rows would be updated.`
      : `Applied: ${updated} / ${rows.length} rows updated.`,
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
