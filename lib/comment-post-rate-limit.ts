/**
 * Fixed-window in-memory rate limit for **POST /api/comments** (E.72 anti-spam).
 *
 * Same serverless caveat as [`engine-post-rate-limit`](./engine-post-rate-limit.ts): per instance.
 */

import { clientIpForRateLimit } from '@/lib/engine-post-rate-limit'

const WINDOW_MS = 60_000

type Bucket = { windowStart: number; count: number }

const userBuckets = new Map<string, Bucket>()
const ipBuckets = new Map<string, Bucket>()

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw === '') return fallback
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export function commentPostRateLimitPerUserPerMinute(): number {
  return parsePositiveInt(process.env.BABIL_COMMENT_POST_RATE_LIMIT_PER_MINUTE, 12)
}

/** Optional cap per IP (many accounts behind one IP) — 0 disables IP bucket. */
export function commentPostRateLimitPerIpPerMinute(): number {
  return parsePositiveInt(process.env.BABIL_COMMENT_POST_RATE_LIMIT_PER_IP_PER_MINUTE, 40)
}

export function commentPostRateLimitDisabled(): boolean {
  const v = process.env.BABIL_COMMENT_POST_RATE_LIMIT_DISABLED
  return v === '1' || v === 'true' || v === 'yes'
}

export type CommentPostRateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number; limit: number }

function consumeOwnBucket(map: Map<string, Bucket>, key: string, limit: number): CommentPostRateLimitResult {
  if (commentPostRateLimitDisabled()) return { ok: true }

  const now = Date.now()
  let b = map.get(key)
  if (!b || now - b.windowStart >= WINDOW_MS) {
    b = { windowStart: now, count: 0 }
    map.set(key, b)
  }

  if (b.count >= limit) {
    const elapsed = now - b.windowStart
    const retryAfterSec = Math.max(1, Math.ceil((WINDOW_MS - elapsed) / 1000))
    return { ok: false, retryAfterSec, limit }
  }

  b.count += 1
  return { ok: true }
}

/**
 * Two buckets: per signed-in user and (if configured) per client IP.
 */
export function checkCommentPostRateLimit(userId: string, req: Request): CommentPostRateLimitResult {
  if (commentPostRateLimitDisabled()) return { ok: true }

  const userLimit = commentPostRateLimitPerUserPerMinute()
  const userKey = `commentpost:user:${userId}`
  const u = consumeOwnBucket(userBuckets, userKey, userLimit)
  if (!u.ok) return u

  const ipLimit = commentPostRateLimitPerIpPerMinute()
  if (ipLimit <= 0) return { ok: true }

  const ip = clientIpForRateLimit(req)
  const ipKey = `commentpost:ip:${ip}`
  return consumeOwnBucket(ipBuckets, ipKey, ipLimit)
}

/** Test helper — clears in-memory buckets. */
export function resetCommentPostRateLimitForTests(): void {
  userBuckets.clear()
  ipBuckets.clear()
}
