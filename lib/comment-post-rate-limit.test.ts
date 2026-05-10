import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'

import {
  checkCommentPostRateLimit,
  resetCommentPostRateLimitForTests,
} from '@/lib/comment-post-rate-limit'

afterEach(() => {
  resetCommentPostRateLimitForTests()
  delete process.env.BABIL_COMMENT_POST_RATE_LIMIT_PER_MINUTE
  delete process.env.BABIL_COMMENT_POST_RATE_LIMIT_PER_IP_PER_MINUTE
  delete process.env.BABIL_COMMENT_POST_RATE_LIMIT_DISABLED
})

test('checkCommentPostRateLimit allows under user cap', () => {
  process.env.BABIL_COMMENT_POST_RATE_LIMIT_PER_MINUTE = '3'
  process.env.BABIL_COMMENT_POST_RATE_LIMIT_PER_IP_PER_MINUTE = '0'
  const req = new Request('https://x.test/api/comments', { method: 'POST' })
  assert.equal(checkCommentPostRateLimit('user_a', req).ok, true)
  assert.equal(checkCommentPostRateLimit('user_a', req).ok, true)
  assert.equal(checkCommentPostRateLimit('user_a', req).ok, true)
  assert.equal(checkCommentPostRateLimit('user_a', req).ok, false)
})

test('checkCommentPostRateLimit is bypassed when disabled', () => {
  process.env.BABIL_COMMENT_POST_RATE_LIMIT_DISABLED = '1'
  process.env.BABIL_COMMENT_POST_RATE_LIMIT_PER_MINUTE = '1'
  const req = new Request('https://x.test/api/comments')
  assert.equal(checkCommentPostRateLimit('u', req).ok, true)
  assert.equal(checkCommentPostRateLimit('u', req).ok, true)
})

test('checkCommentPostRateLimit applies IP bucket when set', () => {
  process.env.BABIL_COMMENT_POST_RATE_LIMIT_PER_MINUTE = '99'
  process.env.BABIL_COMMENT_POST_RATE_LIMIT_PER_IP_PER_MINUTE = '2'
  const req = () =>
    new Request('https://x.test/api/comments', {
      headers: { 'x-forwarded-for': '203.0.113.9' },
    })
  assert.equal(checkCommentPostRateLimit('user_1', req()).ok, true)
  assert.equal(checkCommentPostRateLimit('user_2', req()).ok, true)
  const last = checkCommentPostRateLimit('user_3', req())
  assert.equal(last.ok, false)
})
