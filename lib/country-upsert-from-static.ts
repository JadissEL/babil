/**
 * Build Prisma `Country` create/update payload from one `data/countries.json` row shape.
 * Normalizes `full_data` (driving_rights v1, friction, street_food top-level) for structure/quality.
 */

import { enrichCountryRecordWithDrivingRights } from '@/lib/driving-rights-intel'
import { materializePublicFullData } from '@/lib/country-full-data-materialize'
import {
  ensureStreetFoodBusinessAccessOnFullData,
  deriveStreetFoodBusinessAccessFromFullData,
} from '@/lib/country-street-food-access'
import { isSchengenMember } from '@/lib/schengen-members'
import { businessMobilityToScalar01to10 } from '@/lib/scoring/business-mobility'
import { studyMobilityToScalar01to10 } from '@/lib/scoring/study-mobility'
import { tourismMobilityToScalar01to10 } from '@/lib/scoring/tourism-mobility'
import { workMobilityToScalar01to10 } from '@/lib/scoring/work-mobility'

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function frictionTriple(full: Record<string, unknown>): {
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

function educationTriple(full: Record<string, unknown>): {
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

function drivingStatus(full: Record<string, unknown>): string {
  const dl = full.driving_license
  if (!isRecord(dl)) return 'Unknown'
  const s = dl.status
  if (typeof s === 'string' && s.trim()) return s.trim()
  return 'Unknown'
}

/** One country object as stored in `data/countries.json` (`country`, `region`, nested blocks). */
export function buildCountryPrismaPayloadFromStaticRecord(c: Record<string, unknown>) {
  const name = String(c.country ?? '').trim()
  if (!name) throw new Error('Static country row missing `country` name')

  const enriched = enrichCountryRecordWithDrivingRights(c) as Record<string, unknown>
  const withStreet = ensureStreetFoodBusinessAccessOnFullData(enriched)
  const full = materializePublicFullData(withStreet)
  const friction = frictionTriple(full)
  const edu = educationTriple(full)
  const streetFoodBusinessAccess =
    deriveStreetFoodBusinessAccessFromFullData(full) ?? 'Unknown'

  return {
    name,
    region: String(c.region ?? 'Other'),
    schengen_flag: isSchengenMember(name),
    tourist_visa_score: tourismMobilityToScalar01to10({ full }),
    study_visa_score: studyMobilityToScalar01to10({ full }),
    work_visa_score: workMobilityToScalar01to10({ full }),
    business_visa_score: businessMobilityToScalar01to10({
      full,
      streetFoodBusinessAccess: streetFoodBusinessAccess === 'Unknown' ? null : streetFoodBusinessAccess,
    }),
    appointment_difficulty: friction.appointment_difficulty,
    visa_processing_time: friction.visa_processing_time,
    rejection_risk: friction.rejection_risk,
    language_study_access: edu.language_study_access,
    technical_training_access: edu.technical_training_access,
    short_course_access: edu.short_course_access,
    street_food_business_access: streetFoodBusinessAccess,
    driving_license_status: drivingStatus(full),
    full_data: JSON.stringify(full),
  }
}
