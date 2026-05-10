/**
 * Fixed-window in-memory rate limit for engine POST routes (`/api/recommendation`, `/api/probability`).
 *
 * **Serverless caveat:** buckets are per runtime instance; under load, effective limit can be higher
 * across many instances. For strict global limits, use Redis/Upstash later.
 */

const WINDOW_MS = 60_000

type Bucket = { windowStart: number; count: number }

const buckets = new Map<string, Bucket>()

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === '') return fallback
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export function enginePostRateLimitAuthPerMinute(): number {
  return parsePositiveInt(process.env.BABIL_ENGINE_RATE_LIMIT_AUTH_PER_MINUTE, 60)
}

export function enginePostRateLimitAnonPerMinute(): number {
  return parsePositiveInt(process.env.BABIL_ENGINE_RATE_LIMIT_ANON_PER_MINUTE, 30)
}

export function enginePostRateLimitDisabled(): boolean {
  const v = process.env.BABIL_ENGINE_RATE_LIMIT_DISABLED
  return v === '1' || v === 'true' || v === 'yes'
}

/** First public client IP from common proxy headers (best-effort). */
export function clientIpForRateLimit(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const real = req.headers.get('x-real-ip')?.trim()
  if (real) return real
  return 'unknown'
}

export type EnginePostRateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number; limit: number }

/**
 * @param key Stable key per caller (`user:…` or `anon:…`).
 */
export function consumeEnginePostRateToken(key: string, limit: number): EnginePostRateLimitResult {
  if (enginePostRateLimitDisabled()) return { ok: true }

  const now = Date.now()
  let b = buckets.get(key)
  if (!b || now - b.windowStart >= WINDOW_MS) {
    b = { windowStart: now, count: 0 }
    buckets.set(key, b)
  }

  if (b.count >= limit) {
    const elapsed = now - b.windowStart
    const retryAfterSec = Math.max(1, Math.ceil((WINDOW_MS - elapsed) / 1000))
    return { ok: false, retryAfterSec, limit }
  }

  b.count += 1
  return { ok: true }
}

export function enginePostRateLimitKey(userId: string | null | undefined, req: Request): string {
  if (userId && userId.length > 0) return `user:${userId}`
  return `anon:${clientIpForRateLimit(req)}`
}

export function checkEnginePostRateLimit(userId: string | null | undefined, req: Request): EnginePostRateLimitResult {
  const limit = userId ? enginePostRateLimitAuthPerMinute() : enginePostRateLimitAnonPerMinute()
  return consumeEnginePostRateToken(enginePostRateLimitKey(userId, req), limit)
}

/** Test helper — clears in-memory buckets. */
export function resetEnginePostRateLimitForTests(): void {
  buckets.clear()
}
