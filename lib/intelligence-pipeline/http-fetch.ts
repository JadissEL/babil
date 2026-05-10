/**
 * HTTP client for intelligence pipeline outbound calls (D.61).
 * Uses {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout AbortSignal.timeout}.
 */

const DEFAULT_TIMEOUT_MS = 45_000
const MAX_TIMEOUT_MS = 120_000

export function intelligencePipelineHttpTimeoutMs(): number {
  const raw = process.env.INTELLIGENCE_HTTP_TIMEOUT_MS
  if (raw === undefined || raw === '') return DEFAULT_TIMEOUT_MS
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_TIMEOUT_MS
  return Math.min(n, MAX_TIMEOUT_MS)
}

function combineWithTimeout(userSignal: AbortSignal | null | undefined, timeoutMs: number): AbortSignal {
  const timeoutSignal = AbortSignal.timeout(timeoutMs)
  if (!userSignal) return timeoutSignal
  const anyFn = (AbortSignal as unknown as { any?: (signals: AbortSignal[]) => AbortSignal }).any
  if (typeof anyFn === 'function') {
    return anyFn([userSignal, timeoutSignal])
  }
  return timeoutSignal
}

/** `fetch` with a bounded wait — avoids hung serverless workers when WB is slow. */
export function intelligencePipelineFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const ms = intelligencePipelineHttpTimeoutMs()
  const signal = combineWithTimeout(init?.signal, ms)
  return fetch(input, { ...init, signal })
}
