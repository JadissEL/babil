import assert from 'node:assert/strict'
import { test, afterEach } from 'node:test'
import {
  checkEnginePostRateLimit,
  consumeEnginePostRateToken,
  enginePostRateLimitDisabled,
  resetEnginePostRateLimitForTests,
} from '@/lib/engine-post-rate-limit'

afterEach(() => {
  resetEnginePostRateLimitForTests()
  delete process.env.BABIL_ENGINE_RATE_LIMIT_DISABLED
})

test('consumeEnginePostRateToken allows up to limit then blocks', () => {
  const r1 = consumeEnginePostRateToken('k', 2)
  const r2 = consumeEnginePostRateToken('k', 2)
  const r3 = consumeEnginePostRateToken('k', 2)
  assert.equal(r1.ok, true)
  assert.equal(r2.ok, true)
  assert.equal(r3.ok, false)
  if (!r3.ok) {
    assert.ok(r3.retryAfterSec >= 1)
    assert.equal(r3.limit, 2)
  }
})

test('checkEnginePostRateLimit uses user vs anon key', () => {
  const req = new Request('https://example.com/api/recommendation', {
    headers: { 'x-forwarded-for': '203.0.113.9, 10.0.0.1' },
  })
  const a = checkEnginePostRateLimit('user_abc', req)
  const b = checkEnginePostRateLimit(null, req)
  assert.equal(a.ok, true)
  assert.equal(b.ok, true)
  resetEnginePostRateLimitForTests()
})

test('BABIL_ENGINE_RATE_LIMIT_DISABLED bypasses', () => {
  process.env.BABIL_ENGINE_RATE_LIMIT_DISABLED = '1'
  assert.equal(enginePostRateLimitDisabled(), true)
  const r = consumeEnginePostRateToken('x', 1)
  assert.equal(r.ok, true)
  const r2 = consumeEnginePostRateToken('x', 1)
  assert.equal(r2.ok, true)
})
