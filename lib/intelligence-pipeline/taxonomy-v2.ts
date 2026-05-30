/**
 * Taxonomy v2 — dynamic FieldDefinition seeds + CountryKnowledgeProfile helpers.
 */

import prisma from '@/lib/prisma'
import { COUNTRY_INTELLIGENCE_CONTRACT_V2 } from '@/lib/country-intelligence-contract'

export async function seedFieldDefinitionsFromContract(): Promise<number> {
  let n = 0
  for (const field of COUNTRY_INTELLIGENCE_CONTRACT_V2) {
    await prisma.fieldDefinition.upsert({
      where: { path: field.path },
      create: {
        path: field.path,
        domain: field.domain,
        valueType: field.expectedType,
        countryOptional: !field.critical,
        presentationPattern: null,
        version: 2,
      },
      update: {
        domain: field.domain,
        valueType: field.expectedType,
        countryOptional: !field.critical,
        version: 2,
      },
    })
    n++
  }
  return n
}

export async function upsertCountryKnowledgeProfile(
  countryId: number,
  activePaths: string[],
  categoryCounts?: Record<string, number>,
): Promise<void> {
  await prisma.countryKnowledgeProfile.upsert({
    where: { countryId },
    create: {
      countryId,
      activeFieldPathsJson: JSON.stringify(activePaths),
      categoryCountJson: categoryCounts ? JSON.stringify(categoryCounts) : null,
    },
    update: {
      activeFieldPathsJson: JSON.stringify(activePaths),
      categoryCountJson: categoryCounts ? JSON.stringify(categoryCounts) : null,
    },
  })
}

export function parseActiveFieldPaths(json: string): string[] {
  try {
    const v = JSON.parse(json) as unknown
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}
