/**
 * Classify pipeline errors for retry vs immediate dead-letter (self-healing pipelines).
 */

export type PipelineErrorClass = 'transient' | 'permanent' | 'unknown';

const PERMANENT_PATTERNS: RegExp[] = [
  /Country id=\d+ not found/i,
  /Invalid payloadJson/i,
  /launch_gate_sample_failed/i,
  /requires payload\.countryId/i,
  /host_not_allowlisted/i,
  /not_https/i,
  /invalid_url/i,
  /content_length_too_large/i,
  /body_too_large/i,
  /circuit_breaker_open/i,
];

const TRANSIENT_PATTERNS: RegExp[] = [
  /timeout/i,
  /ECONNRESET/i,
  /ETIMEDOUT/i,
  /ENOTFOUND/i,
  /429/,
  /502/,
  /503/,
  /504/,
  /fetch failed/i,
  /network/i,
  /temporarily/i,
  /rate limit/i,
];

export function classifyPipelineError(errorSummary: string | null | undefined): PipelineErrorClass {
  const msg = (errorSummary ?? '').trim();
  if (!msg) return 'unknown';
  if (PERMANENT_PATTERNS.some((p) => p.test(msg))) return 'permanent';
  if (TRANSIENT_PATTERNS.some((p) => p.test(msg))) return 'transient';
  return 'unknown';
}

export function shouldRetryFailedJob(errorSummary: string | null | undefined): boolean {
  const c = classifyPipelineError(errorSummary);
  return c === 'transient' || c === 'unknown';
}
