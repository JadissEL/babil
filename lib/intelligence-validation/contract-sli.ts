/**
 * Data-contract violation SLI — producer/consumer agreement health (sampled audit).
 * @see https://datadef.io/guides/en/data-contracts
 */

import prisma from '@/lib/prisma';
import { validateObservationDataContract } from './data-contract';

export const DATA_CONTRACT_VERSION = 'v1' as const;

export type IntelligenceContractSli = {
  contractVersion: typeof DATA_CONTRACT_VERSION;
  sampleSize: number;
  violationCount: number;
  violationRate: number;
  topViolationCodes: { code: string; count: number }[];
};

export async function collectIntelligenceContractSli(
  sampleLimit = 200,
): Promise<IntelligenceContractSli> {
  const rows = await prisma.countryObservation.findMany({
    orderBy: { observedAt: 'desc' },
    take: Math.min(500, Math.max(20, sampleLimit)),
    select: {
      fieldPath: true,
      valueJson: true,
      valueNumeric: true,
    },
  });

  const codeCounts = new Map<string, number>();
  let violationCount = 0;

  for (const row of rows) {
    const result = validateObservationDataContract({
      fieldPath: row.fieldPath,
      valueJson: row.valueJson,
      valueNumeric: row.valueNumeric,
    });
    if (!result.valid) {
      violationCount += 1;
      for (const v of result.violations) {
        codeCounts.set(v.code, (codeCounts.get(v.code) ?? 0) + 1);
      }
    }
  }

  const sampleSize = rows.length;
  const violationRate =
    sampleSize > 0 ? Math.round((violationCount / sampleSize) * 1000) / 1000 : 0;

  const topViolationCodes = Array.from(codeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code, count]) => ({ code, count }));

  return {
    contractVersion: DATA_CONTRACT_VERSION,
    sampleSize,
    violationCount,
    violationRate,
    topViolationCodes,
  };
}

export function evaluateContractAlertLevel(
  sli: IntelligenceContractSli,
): 'ok' | 'warning' | 'critical' {
  if (sli.sampleSize < 10) return 'ok';
  if (sli.violationRate >= 0.15) return 'critical';
  if (sli.violationRate >= 0.05) return 'warning';
  return 'ok';
}
