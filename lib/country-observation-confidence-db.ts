import {
  mapPrismaObservationConfidenceAggregate,
  type ObservationConfidenceAggregatePayload,
} from '@/lib/country-observation-confidence-aggregate'
import prisma from '@/lib/prisma'

export async function getObservationConfidenceAggregateForCountry(
  countryId: number,
): Promise<ObservationConfidenceAggregatePayload | null> {
  const row = await prisma.countryObservation.aggregate({
    where: { countryId },
    _avg: { confidence: true },
    _min: { confidence: true },
    _max: { confidence: true },
    _count: { _all: true },
  })
  return mapPrismaObservationConfidenceAggregate(row)
}
