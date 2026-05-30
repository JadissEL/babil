/**
 * ILO / UNdata connector placeholder — extends multilateral collect beyond World Bank.
 */

import { upsertCountryObservation } from '@/lib/intelligence-pipeline/observation-writer'

export async function runIloStubCollect(args: {
  countryId: number
  sourceId: string
  runId: string
}): Promise<{ written: number }> {
  await upsertCountryObservation({
    countryId: args.countryId,
    sourceId: args.sourceId,
    runId: args.runId,
    fieldPath: 'employment.ilo.stub',
    valueJson: JSON.stringify({ value: 'pending', summary: 'ILO connector scheduled' }),
    confidence: 0.3,
    verificationStatus: 'estimated',
    dedupeKey: `ilo:stub:${args.countryId}`,
  })
  return { written: 1 }
}
