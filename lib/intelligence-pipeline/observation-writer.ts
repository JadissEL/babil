/**
 * Central observation upsert with ingestion quality gates (pass / quarantine / reject).
 */

import type { ObservationVerificationStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { validateObservationDataContract } from '@/lib/intelligence-validation/data-contract';
import { evaluateIngestionQualityGate } from '@/lib/intelligence-validation/quality-gates';
import { capObservationRawPayloadJson } from './observation-raw-payload';

export type ObservationWriteInput = {
  countryId: number;
  fieldPath: string;
  valueJson: string;
  valueNumeric?: number | null;
  unit?: string | null;
  confidence: number;
  sourceId: string;
  runId?: string | null;
  dedupeKey: string;
  sourceUrl?: string | null;
  rawExcerpt?: string | null;
  rawPayload?: string | null;
  /** Override gate when upstream already verified (e.g. World Bank). */
  verificationStatus?: ObservationVerificationStatus;
};

export async function upsertCountryObservation(input: ObservationWriteInput): Promise<{
  id: string;
  verificationStatus: ObservationVerificationStatus;
}> {
  const hasNumeric = input.valueNumeric != null && Number.isFinite(input.valueNumeric);
  const gate = evaluateIngestionQualityGate({
    fieldPath: input.fieldPath,
    confidence: input.confidence,
    hasNumericValue: hasNumeric,
    sourceUrl: input.sourceUrl ?? null,
    rawExcerpt: input.rawExcerpt ?? null,
  });

  const contract = validateObservationDataContract({
    fieldPath: input.fieldPath,
    valueJson: input.valueJson,
    valueNumeric: input.valueNumeric ?? null,
  });

  let verificationStatus = input.verificationStatus ?? gate.verificationStatus;
  if (gate.decision === 'reject') verificationStatus = 'disputed';
  if (!contract.valid && verificationStatus !== 'disputed') {
    verificationStatus = 'pending';
  }
  if (input.verificationStatus === 'verified' || input.verificationStatus === 'estimated') {
    if (contract.valid) verificationStatus = input.verificationStatus;
  }

  const existing = await prisma.countryObservation.findUnique({
    where: { dedupeKey: input.dedupeKey },
    select: { confidence: true, verificationStatus: true },
  });
  let confidence = input.confidence;
  if (existing && existing.verificationStatus !== 'disputed' && verificationStatus !== 'disputed') {
    confidence = Math.max(confidence, existing.confidence);
  }

  const row = await prisma.countryObservation.upsert({
    where: { dedupeKey: input.dedupeKey },
    create: {
      countryId: input.countryId,
      fieldPath: input.fieldPath,
      valueJson: input.valueJson,
      valueNumeric: input.valueNumeric ?? null,
      unit: input.unit ?? null,
      confidence,
      sourceId: input.sourceId,
      runId: input.runId ?? null,
      dedupeKey: input.dedupeKey,
      sourceUrl: input.sourceUrl ?? null,
      rawExcerpt: input.rawExcerpt ?? null,
      rawPayload: capObservationRawPayloadJson(input.rawPayload),
      verificationStatus,
      sourcesConfirmed: 1,
    },
    update: {
      valueJson: input.valueJson,
      valueNumeric: input.valueNumeric ?? null,
      unit: input.unit ?? null,
      confidence,
      observedAt: new Date(),
      sourceUrl: input.sourceUrl ?? null,
      rawExcerpt: input.rawExcerpt ?? null,
      rawPayload: capObservationRawPayloadJson(input.rawPayload),
      verificationStatus,
      runId: input.runId ?? undefined,
    },
  });

  return { id: row.id, verificationStatus: row.verificationStatus };
}
