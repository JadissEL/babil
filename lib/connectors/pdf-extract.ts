/**
 * PDF connector stub — records page URLs as observations (full text extraction via external service later).
 */

import { upsertCountryObservation } from '@/lib/intelligence-pipeline/observation-writer'

export async function extractPdfPagesAsObservations(args: {
  countryId: number
  sourceId: string
  runId: string
  pdfUrls: string[]
}): Promise<{ written: number }> {
  let written = 0
  for (const url of args.pdfUrls) {
    await upsertCountryObservation({
      countryId: args.countryId,
      sourceId: args.sourceId,
      runId: args.runId,
      fieldPath: 'source.pdf.indexed',
      valueJson: JSON.stringify({ value: url, summary: `PDF indexed: ${url}` }),
      confidence: 0.5,
      verificationStatus: 'pending',
      sourceUrl: url,
      rawExcerpt: 'PDF discovery — content extraction pending',
      dedupeKey: `pdf:${args.countryId}:${url}`,
    })
    written++
  }
  return { written }
}
