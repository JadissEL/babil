/**
 * GET /api/education/programs?kind=LANGUAGE_STUDY|SHORT_COURSES|TECHNICAL_TRAINING
 *  optional filters: bac=NOT_REQUIRED|REQUIRED|SCHOOL_DEPENDENT|UNKNOWN
 *                    cost=LOW|MEDIUM|HIGH|UNKNOWN
 *                    work=ALLOWED|LIMITED|FORBIDDEN|UNKNOWN
 *                    programType=<string>  visaType=<string>  q=<country name substring>
 *
 * Returns rows from the relational `CountryEducationProgram` table joined with `Country`,
 * letting pages 11/12/13 filter server-side with proper indexes instead of fetching every country.
 */
import { NextResponse } from 'next/server'
import {
  Prisma,
  type EducationBacBucket,
  type EducationCostBucket,
  type EducationProgramKind,
  type EducationWorkRightsBucket,
} from '@prisma/client'
import { publicApiErrorMessage } from '@/lib/api-public-error'
import { isDbUnavailable } from '@/lib/db-resilience'
import prisma from '@/lib/prisma'
import { COUNTRIES_LIST_CACHE_CONTROL } from '@/lib/public-api-cache'

const VALID_KINDS: ReadonlySet<EducationProgramKind> = new Set<EducationProgramKind>([
  'LANGUAGE_STUDY',
  'SHORT_COURSES',
  'TECHNICAL_TRAINING',
])

const VALID_BAC: ReadonlySet<EducationBacBucket> = new Set<EducationBacBucket>([
  'NOT_REQUIRED',
  'REQUIRED',
  'SCHOOL_DEPENDENT',
  'UNKNOWN',
])

const VALID_COST: ReadonlySet<EducationCostBucket> = new Set<EducationCostBucket>([
  'LOW',
  'MEDIUM',
  'HIGH',
  'UNKNOWN',
])

const VALID_WORK: ReadonlySet<EducationWorkRightsBucket> = new Set<EducationWorkRightsBucket>([
  'ALLOWED',
  'LIMITED',
  'FORBIDDEN',
  'UNKNOWN',
])

function trimParam(value: string | null): string {
  return value ? value.trim() : ''
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const sp = url.searchParams

  const kindRaw = trimParam(sp.get('kind'))
  if (!kindRaw) {
    return NextResponse.json(
      { error: 'Missing required query parameter `kind`.' },
      { status: 400 },
    )
  }
  const kind = kindRaw as EducationProgramKind
  if (!VALID_KINDS.has(kind)) {
    return NextResponse.json(
      { error: `Invalid kind: ${kindRaw}. Expected one of ${Array.from(VALID_KINDS).join(', ')}.` },
      { status: 400 },
    )
  }

  const where: Prisma.CountryEducationProgramWhereInput = { kind }

  const bacRaw = trimParam(sp.get('bac'))
  if (bacRaw) {
    if (!VALID_BAC.has(bacRaw as EducationBacBucket)) {
      return NextResponse.json({ error: `Invalid bac: ${bacRaw}.` }, { status: 400 })
    }
    where.bacBucket = bacRaw as EducationBacBucket
  }

  const costRaw = trimParam(sp.get('cost'))
  if (costRaw) {
    if (!VALID_COST.has(costRaw as EducationCostBucket)) {
      return NextResponse.json({ error: `Invalid cost: ${costRaw}.` }, { status: 400 })
    }
    where.costBucket = costRaw as EducationCostBucket
  }

  const workRaw = trimParam(sp.get('work'))
  if (workRaw) {
    if (!VALID_WORK.has(workRaw as EducationWorkRightsBucket)) {
      return NextResponse.json({ error: `Invalid work: ${workRaw}.` }, { status: 400 })
    }
    where.workRightsBucket = workRaw as EducationWorkRightsBucket
  }

  const programType = trimParam(sp.get('programType'))
  if (programType) where.programType = programType

  const visaType = trimParam(sp.get('visaType'))
  if (visaType) where.visaType = visaType

  const q = trimParam(sp.get('q'))
  if (q) {
    where.country = { name: { contains: q, mode: 'insensitive' } }
  }

  try {
    const rows = await prisma.countryEducationProgram.findMany({
      where,
      orderBy: [{ country: { name: 'asc' } }],
      include: {
        country: {
          select: { id: true, name: true, region: true },
        },
      },
    })

    const items = rows.map((r) => ({
      id: r.id,
      kind: r.kind,
      bacBucket: r.bacBucket,
      costBucket: r.costBucket,
      workRightsBucket: r.workRightsBucket,
      programType: r.programType,
      visaType: r.visaType,
      durationText: r.durationText,
      costText: r.costText,
      estimatedCostText: r.estimatedCostText,
      bacRequiredText: r.bacRequiredText,
      workRightsText: r.workRightsText,
      access: r.access,
      insight: r.insight,
      types: Array.isArray(r.typesJson) ? r.typesJson : null,
      accessBac: r.accessBac,
      accessNoBac: r.accessNoBac,
      country: r.country,
      updatedAt: r.updatedAt.toISOString(),
    }))

    return NextResponse.json(
      { items, total: items.length },
      { headers: { 'Cache-Control': COUNTRIES_LIST_CACHE_CONTROL } },
    )
  } catch (error: unknown) {
    if (isDbUnavailable(error)) {
      return NextResponse.json({ error: 'Database temporarily unavailable' }, { status: 503 })
    }
    const message = publicApiErrorMessage(error, 'Education programs query failed')
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
