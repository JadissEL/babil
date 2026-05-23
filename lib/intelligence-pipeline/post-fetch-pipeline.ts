/**
 * Shared silver→gold steps after manifest / specialized fetch jobs.
 */

import {
  materializeEconomyObservationsForCountry,
  validateAndTagObservationsForCountry,
} from '@/lib/intelligence-validation';

export async function validateAndMaybeMaterializeCountry(countryId: number): Promise<{
  validated: Awaited<ReturnType<typeof validateAndTagObservationsForCountry>>;
  materialized: boolean;
}> {
  const validated = await validateAndTagObservationsForCountry(countryId);
  let materialized = false;
  const autoMaterialize = process.env.INTELLIGENCE_AUTO_MATERIALIZE_AFTER_FETCH !== '0';
  if (autoMaterialize) {
    materialized = await materializeEconomyObservationsForCountry(countryId, {
      onlyPromotable: true,
    });
  }
  return { validated, materialized };
}
