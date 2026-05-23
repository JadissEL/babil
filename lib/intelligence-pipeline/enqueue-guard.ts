/**
 * Prevent duplicate pending jobs of the same kind + country payload.
 */

import prisma from '@/lib/prisma';
import type { IntelligenceJobPayload } from './job-kinds';

export async function hasPendingJobDuplicate(
  kind: string,
  payload: IntelligenceJobPayload,
): Promise<boolean> {
  const pending = await prisma.intelligencePipelineJob.findMany({
    where: { status: 'PENDING', kind },
    select: { payloadJson: true },
    take: 100,
  });
  const key = dedupePayloadKey(kind, payload);
  for (const row of pending) {
    try {
      const p = JSON.parse(row.payloadJson) as IntelligenceJobPayload;
      if (dedupePayloadKey(kind, p) === key) return true;
    } catch {
      continue;
    }
  }
  return false;
}

function dedupePayloadKey(kind: string, payload: IntelligenceJobPayload): string {
  if (payload.countryId != null) return `${kind}:country:${payload.countryId}`;
  if (payload.countryIds?.length) {
    return `${kind}:countries:${payload.countryIds.slice(0, 5).join(',')}`;
  }
  return `${kind}:flags:${[
    payload.worldBank ? 'wb' : '',
    payload.materializeEconomy ? 'mat' : '',
    payload.stubMultilateralCollectors ? 'stub' : '',
  ].join('')}`;
}
