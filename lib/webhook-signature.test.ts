import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  computeBabilWebhookSignature,
  verifyBabilWebhookSignature,
} from '@/lib/webhook-signature'

test('computeBabilWebhookSignature is deterministic', () => {
  const s = computeBabilWebhookSignature('secret', '{"a":1}')
  assert.match(s, /^[a-f0-9]{64}$/)
  assert.equal(computeBabilWebhookSignature('secret', '{"a":1}'), s)
})

test('verifyBabilWebhookSignature accepts valid sha256= header', () => {
  const secret = 'test-secret'
  const body = '{"event":"ping"}'
  const hex = computeBabilWebhookSignature(secret, body)
  assert.equal(
    verifyBabilWebhookSignature(body, `sha256=${hex}`, secret),
    true,
  )
})

test('verifyBabilWebhookSignature rejects wrong secret or tampered body', () => {
  const body = '{"x":1}'
  const hex = computeBabilWebhookSignature('a', body)
  assert.equal(verifyBabilWebhookSignature(body, `sha256=${hex}`, 'b'), false)
  assert.equal(verifyBabilWebhookSignature('{"x":2}', `sha256=${hex}`, 'a'), false)
})

test('verifyBabilWebhookSignature rejects malformed header', () => {
  assert.equal(verifyBabilWebhookSignature('{}', 'not-a-sig', 's'), false)
  assert.equal(verifyBabilWebhookSignature('{}', null, 's'), false)
})
