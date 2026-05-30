/**
 * Optional information-model context for recommendation / probability engines.
 */

import prisma from '@/lib/prisma'
import {
  fillBusinessModel,
  fillJobModel,
  fillScholarshipModel,
  fillVisaModel,
} from '@/lib/information-models/fill-from-country'

export async function loadInformationModelsForCountry(countryId: number) {
  const country = await prisma.country.findUnique({
    where: { id: countryId },
    select: { id: true, name: true },
  })
  if (!country) return null

  const observations = await prisma.countryObservation.findMany({
    where: { countryId },
    select: { fieldPath: true, valueJson: true, verificationStatus: true },
    take: 500,
  })

  return {
    visa: fillVisaModel(country.name, observations),
    scholarship: fillScholarshipModel(country.name, observations),
    job: fillJobModel(country.name, observations),
    business: fillBusinessModel(country.name, observations),
  }
}
