import {
  observationPairToJumpAnomaly,
  type DataQualityAnomaly,
} from '@/lib/intelligence-data-anomalies';
import {
  FIELD_ECONOMY_GDP_USD_CURRENT,
  FIELD_GENERAL_POPULATION_TOTAL,
} from '@/lib/intelligence-pipeline/taxonomy-v1';
import prisma from '@/lib/prisma';

const TAKE = 2;

export async function fetchObservationJumpAnomaliesForCountry(
  countryId: number,
): Promise<DataQualityAnomaly[]> {
  const [gdpRows, popRows] = await Promise.all([
    prisma.countryObservation.findMany({
      where: { countryId, fieldPath: FIELD_ECONOMY_GDP_USD_CURRENT },
      orderBy: { observedAt: 'desc' },
      take: TAKE,
      select: { valueNumeric: true, valueJson: true },
    }),
    prisma.countryObservation.findMany({
      where: { countryId, fieldPath: FIELD_GENERAL_POPULATION_TOTAL },
      orderBy: { observedAt: 'desc' },
      take: TAKE,
      select: { valueNumeric: true, valueJson: true },
    }),
  ]);

  const out: DataQualityAnomaly[] = [];
  const gdpAnom = observationPairToJumpAnomaly(
    FIELD_ECONOMY_GDP_USD_CURRENT,
    'PIB nominal (USD)',
    gdpRows,
  );
  if (gdpAnom) out.push(gdpAnom);
  const popAnom = observationPairToJumpAnomaly(
    FIELD_GENERAL_POPULATION_TOTAL,
    'population totale',
    popRows,
  );
  if (popAnom) out.push(popAnom);
  return out;
}
