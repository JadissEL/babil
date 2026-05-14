/**
 * Extract & bucketize `full_data.education_mobility.{language_study,short_courses,technical_training}`
 * into rows suitable for the relational `CountryEducationProgram` table (Prisma model).
 *
 * Pure functions (no Prisma import) so they unit-test cheaply and run inside the agents pipeline
 * before any DB call. Centralises bucket logic that pages 11/12/13 currently duplicate client-side.
 */

export type EducationProgramKind = 'LANGUAGE_STUDY' | 'SHORT_COURSES' | 'TECHNICAL_TRAINING'

export type EducationBacBucket = 'NOT_REQUIRED' | 'REQUIRED' | 'SCHOOL_DEPENDENT' | 'UNKNOWN'

export type EducationCostBucket = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN'

export type EducationWorkRightsBucket = 'ALLOWED' | 'LIMITED' | 'FORBIDDEN' | 'UNKNOWN'

export type EducationProgramRow = {
  kind: EducationProgramKind
  bacBucket: EducationBacBucket
  costBucket: EducationCostBucket
  workRightsBucket: EducationWorkRightsBucket
  programType: string | null
  visaType: string | null
  durationText: string | null
  costText: string | null
  estimatedCostText: string | null
  bacRequiredText: string | null
  workRightsText: string | null
  access: string | null
  insight: string | null
  types: string[] | null
  accessBac: boolean
  accessNoBac: boolean
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function trimOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const s = String(value).trim()
  return s.length === 0 ? null : s
}

function toLowerOrEmpty(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).toLowerCase()
}

export function bucketCost(value: unknown): EducationCostBucket {
  const v = toLowerOrEmpty(value)
  if (!v.trim()) return 'UNKNOWN'
  if (v.includes('bas') || v.includes('low')) return 'LOW'
  if (v.includes('élev') || v.includes('eleve') || v.includes('high')) return 'HIGH'
  if (v.includes('moy') || v.includes('medium') || v.includes('mid')) return 'MEDIUM'
  return 'MEDIUM'
}

export function bucketBac(value: unknown): EducationBacBucket {
  const v = toLowerOrEmpty(value)
  if (!v.trim()) return 'UNKNOWN'
  if (v.includes('dépend') || v.includes('depend') || v.includes('school')) return 'SCHOOL_DEPENDENT'
  if (v.includes('non') || v.includes('not')) return 'NOT_REQUIRED'
  if (v.includes('req')) return 'REQUIRED'
  return 'UNKNOWN'
}

export function bucketWorkRights(value: unknown): EducationWorkRightsBucket {
  const v = toLowerOrEmpty(value)
  if (!v.trim()) return 'UNKNOWN'
  if (v.includes('interdit') || v.includes('forbid')) return 'FORBIDDEN'
  if (v.includes('autor') || v.includes('allow')) return 'ALLOWED'
  if (v.includes('limit')) return 'LIMITED'
  return 'LIMITED'
}

function extractStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null
  const out: string[] = []
  for (const item of value) {
    if (typeof item === 'string') {
      const trimmed = item.trim()
      if (trimmed.length > 0) out.push(trimmed)
    }
  }
  return out.length > 0 ? out : null
}

function buildLanguageStudyRow(block: Record<string, unknown>): EducationProgramRow {
  const estimatedCostText = trimOrNull(block.estimated_cost) ?? trimOrNull(block.cost)
  const bacRequiredText = trimOrNull(block.bac_required)
  return {
    kind: 'LANGUAGE_STUDY',
    bacBucket: bucketBac(bacRequiredText),
    costBucket: bucketCost(estimatedCostText),
    workRightsBucket: bucketWorkRights(block.work_rights),
    programType: trimOrNull(block.program_type),
    visaType: trimOrNull(block.visa_type) ?? trimOrNull(block.visa),
    durationText: trimOrNull(block.duration),
    costText: trimOrNull(block.cost),
    estimatedCostText,
    bacRequiredText,
    workRightsText: trimOrNull(block.work_rights),
    access: trimOrNull(block.access),
    insight: trimOrNull(block.insight),
    types: extractStringArray(block.types),
    accessBac: block.access_bac === true,
    accessNoBac: block.access_no_bac === true,
  }
}

function buildShortCoursesRow(block: Record<string, unknown>): EducationProgramRow {
  const costText = trimOrNull(block.cost)
  const bacRequiredText = trimOrNull(block.bac_required)
  return {
    kind: 'SHORT_COURSES',
    bacBucket: bucketBac(bacRequiredText),
    costBucket: bucketCost(costText),
    workRightsBucket: bucketWorkRights(block.work_rights),
    programType: trimOrNull(block.program_type),
    visaType: trimOrNull(block.visa_type) ?? trimOrNull(block.visa),
    durationText: trimOrNull(block.duration),
    costText,
    estimatedCostText: trimOrNull(block.estimated_cost) ?? costText,
    bacRequiredText,
    workRightsText: trimOrNull(block.work_rights),
    access: trimOrNull(block.access),
    insight: trimOrNull(block.insight),
    types: extractStringArray(block.types),
    accessBac: block.access_bac === true,
    accessNoBac: block.access_no_bac === true,
  }
}

function buildTechnicalTrainingRow(block: Record<string, unknown>): EducationProgramRow {
  const costText = trimOrNull(block.cost)
  const bacRequiredText = trimOrNull(block.bac_required)
  return {
    kind: 'TECHNICAL_TRAINING',
    bacBucket: bucketBac(bacRequiredText),
    costBucket: bucketCost(costText),
    workRightsBucket: bucketWorkRights(block.work_rights),
    programType: trimOrNull(block.program_type),
    visaType: trimOrNull(block.visa_type) ?? trimOrNull(block.visa),
    durationText: trimOrNull(block.duration),
    costText,
    estimatedCostText: trimOrNull(block.estimated_cost) ?? costText,
    bacRequiredText,
    workRightsText: trimOrNull(block.work_rights),
    access: trimOrNull(block.access),
    insight: trimOrNull(block.insight),
    types: extractStringArray(block.types),
    accessBac: block.access_bac === true,
    accessNoBac: block.access_no_bac === true,
  }
}

const KIND_BUILDERS: Record<
  string,
  { kind: EducationProgramKind; build: (block: Record<string, unknown>) => EducationProgramRow }
> = {
  language_study: { kind: 'LANGUAGE_STUDY', build: buildLanguageStudyRow },
  short_courses: { kind: 'SHORT_COURSES', build: buildShortCoursesRow },
  technical_training: { kind: 'TECHNICAL_TRAINING', build: buildTechnicalTrainingRow },
}

/**
 * Extract one program row per kind present in `full_data.education_mobility`.
 * Missing or non-object blocks are skipped (no UNKNOWN-only placeholder rows).
 */
export function extractEducationPrograms(fullData: unknown): EducationProgramRow[] {
  if (!isRecord(fullData)) return []
  const em = fullData.education_mobility
  if (!isRecord(em)) return []

  const out: EducationProgramRow[] = []
  const keys = Object.keys(KIND_BUILDERS)
  for (const key of keys) {
    const block = em[key]
    if (!isRecord(block)) continue
    const builder = KIND_BUILDERS[key]
    out.push(builder.build(block))
  }
  return out
}
