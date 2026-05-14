/**
 * Prisma side of the education-programs relationalisation (see `lib/country-education-programs.ts`).
 * Keeps the import-Prisma surface tiny and out of the pure parser file so unit tests don't pull the client.
 */

import type { PrismaClient } from '@prisma/client'
import {
  extractEducationPrograms,
  type EducationProgramKind,
  type EducationProgramRow,
} from '@/lib/country-education-programs'

type AnyPrisma = Pick<PrismaClient, '$transaction' | 'countryEducationProgram'>

function rowToUpsertData(row: EducationProgramRow) {
  return {
    bacBucket: row.bacBucket,
    costBucket: row.costBucket,
    workRightsBucket: row.workRightsBucket,
    programType: row.programType,
    visaType: row.visaType,
    durationText: row.durationText,
    costText: row.costText,
    estimatedCostText: row.estimatedCostText,
    bacRequiredText: row.bacRequiredText,
    workRightsText: row.workRightsText,
    access: row.access,
    insight: row.insight,
    typesJson: row.types ?? undefined,
    accessBac: row.accessBac,
    accessNoBac: row.accessNoBac,
  }
}

/**
 * Reconcile `CountryEducationProgram` rows for one country against the rows derived from `full_data`.
 * - Upserts the rows that exist in `full_data`.
 * - Deletes any DB row whose kind no longer has a matching block (keeps DB strictly aligned).
 *
 * Safe to call after any `prisma.country.update` / `.upsert` that touched `full_data`.
 */
export async function syncCountryEducationProgramsFromFullData(
  prisma: AnyPrisma,
  countryId: number,
  fullData: unknown,
  options: { sourceVersion?: string } = {},
): Promise<{ upserted: EducationProgramKind[]; deleted: EducationProgramKind[] }> {
  const rows = extractEducationPrograms(fullData)
  const kinds = rows.map((r) => r.kind)

  const upserted: EducationProgramKind[] = []
  const deleted: EducationProgramKind[] = []

  await prisma.$transaction(async (tx) => {
    for (const row of rows) {
      const data = rowToUpsertData(row)
      await tx.countryEducationProgram.upsert({
        where: { countryId_kind: { countryId, kind: row.kind } },
        update: { ...data, sourceVersion: options.sourceVersion ?? null },
        create: {
          countryId,
          kind: row.kind,
          ...data,
          sourceVersion: options.sourceVersion ?? null,
        },
      })
      upserted.push(row.kind)
    }

    if (kinds.length === 0) {
      const removed = await tx.countryEducationProgram.deleteMany({ where: { countryId } })
      if (removed.count > 0) {
        deleted.push('LANGUAGE_STUDY', 'SHORT_COURSES', 'TECHNICAL_TRAINING')
      }
    } else {
      const removed = await tx.countryEducationProgram.deleteMany({
        where: { countryId, kind: { notIn: kinds } },
      })
      if (removed.count > 0) {
        const candidates: EducationProgramKind[] = ['LANGUAGE_STUDY', 'SHORT_COURSES', 'TECHNICAL_TRAINING']
        for (const k of candidates) {
          if (!kinds.includes(k)) deleted.push(k)
        }
      }
    }
  })

  return { upserted, deleted }
}
