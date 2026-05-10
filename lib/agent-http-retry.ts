/**
 * Bounded retries for outbound HTTP used by the supervisor enrichment loop (H.97).
 * Does not replace task-level retries in `agents/runner.ts`.
 */

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function agentHttpMaxAttempts(): number {
  const n = Number(process.env.AGENT_HTTP_MAX_ATTEMPTS ?? '3');
  if (!Number.isFinite(n)) return 3;
  return Math.min(8, Math.max(1, Math.floor(n)));
}

export function agentHttpRetryBaseMs(): number {
  const n = Number(process.env.AGENT_HTTP_RETRY_BASE_MS ?? '400');
  if (!Number.isFinite(n)) return 400;
  return Math.min(30_000, Math.max(100, Math.floor(n)));
}

function isTransientHttpStatus(status: number): boolean {
  return status === 408 || status === 429 || status === 502 || status === 503 || status === 504;
}

/**
 * `fetch` with exponential backoff on network errors and transient HTTP statuses.
 * Non-transient 4xx/5xx are returned immediately (no retry).
 */
export async function fetchWithAgentRetry(url: string, init?: RequestInit): Promise<Response> {
  const max = agentHttpMaxAttempts();
  const base = agentHttpRetryBaseMs();
  let lastError: unknown;

  for (let i = 0; i < max; i += 1) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;
      if (i < max - 1 && isTransientHttpStatus(res.status)) {
        await sleep(base * 2 ** i);
        continue;
      }
      return res;
    } catch (e) {
      lastError = e;
      if (i < max - 1) {
        await sleep(base * 2 ** i);
        continue;
      }
      throw e;
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}
