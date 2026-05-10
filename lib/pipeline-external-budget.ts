import { slogProcess } from '@/lib/structured-log';

/** Snapshot of outbound call volume after an enrichment run (G.93). */
export type EnrichmentPipelineBudgetInput = {
  runId: string;
  status: 'SUCCEEDED' | 'PARTIAL' | 'FAILED';
  worldBank?: { apiBatchCalls?: number; skippedByConfig?: boolean };
};

export function parsePositiveIntEnv(raw: string | undefined): number | null {
  if (raw === undefined || raw === '') return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function worldBankHttpSoftLimitFromEnv(): number | null {
  return parsePositiveIntEnv(process.env.INTELLIGENCE_PIPELINE_WB_HTTP_SOFT_LIMIT);
}

export function shouldWarnWorldBankHttpCalls(
  apiBatchCalls: number | undefined,
  softLimit: number | null,
): boolean {
  if (softLimit == null || apiBatchCalls == null) return false;
  return apiBatchCalls > softLimit;
}

/**
 * If `INTELLIGENCE_PIPELINE_WB_HTTP_SOFT_LIMIT` is set and World Bank `apiBatchCalls` exceeds it,
 * emit one structured warning line (log drain / alert rules).
 */
export function logPipelineExternalBudgetWarnings(result: EnrichmentPipelineBudgetInput): void {
  if (result.worldBank?.skippedByConfig) return;
  const softLimit = worldBankHttpSoftLimitFromEnv();
  const apiBatchCalls = result.worldBank?.apiBatchCalls;
  if (!shouldWarnWorldBankHttpCalls(apiBatchCalls, softLimit)) return;
  slogProcess('warn', 'pipeline_external_calls_budget_soft_exceeded', {
    runId: result.runId,
    pipelineStatus: result.status,
    worldBankApiBatchCalls: apiBatchCalls,
    softLimit,
  });
}
