/**
 * Post-materialize safety: sample launch-gate on materialized countries.
 */

import { evaluateLaunchGate } from '@/lib/launch-gate';
import prisma from '@/lib/prisma';

export type PromotionSafetyResult = {
  sampled: number;
  failed: Array<{ countryId: number; name: string; reasons: string[] }>;
  pass: boolean;
};

export async function checkPromotionLaunchGateSample(args?: {
  countryIds?: number[];
  sampleSize?: number;
  minCompleteness?: number;
}): Promise<PromotionSafetyResult> {
  const sampleSize = args?.sampleSize ?? 12;
  const min = args?.minCompleteness ?? 72;
  const ids =
    args?.countryIds ??
    (
      await prisma.country.findMany({
        select: { id: true },
        orderBy: { id: 'asc' },
        take: sampleSize,
      })
    ).map((c) => c.id);

  const rows = await prisma.country.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      region: true,
      schengen_flag: true,
      tourist_visa_score: true,
      study_visa_score: true,
      work_visa_score: true,
      business_visa_score: true,
      appointment_difficulty: true,
      full_data: true,
    },
  });

  const failed: PromotionSafetyResult['failed'] = [];
  for (const row of rows) {
    const full = row.full_data ? (JSON.parse(row.full_data) as Record<string, unknown>) : {};
    const gate = evaluateLaunchGate(
      {
        name: row.name,
        region: row.region,
        schengen_flag: row.schengen_flag,
        tourist_visa_score: row.tourist_visa_score,
        study_visa_score: row.study_visa_score,
        work_visa_score: row.work_visa_score,
        business_visa_score: row.business_visa_score,
        appointment_difficulty: row.appointment_difficulty,
        full_data: full,
      },
      { ignoreCriticalMissing: true, minCompleteness: min },
    );
    if (!gate.pass) {
      failed.push({ countryId: row.id, name: row.name, reasons: gate.reasons });
    }
  }

  return {
    sampled: rows.length,
    failed,
    pass: failed.length === 0,
  };
}
