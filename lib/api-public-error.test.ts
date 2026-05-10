import assert from 'node:assert/strict'
import { test } from 'node:test'

import { publicApiErrorMessage, scrubSensitiveClientText } from '@/lib/api-public-error'

test('scrubSensitiveClientText removes emails and DB URLs', () => {
  const s = scrubSensitiveClientText(
    'connect failed for user@host.com see postgresql://u:secret@db.internal:5432/app',
  )
  assert.match(s, /\[redacted\].*\[redacted\]/)
  assert.doesNotMatch(s, /secret/)
  assert.doesNotMatch(s, /user@host\.com/)
})

test('scrubSensitiveClientText removes stack lines', () => {
  const s = scrubSensitiveClientText('boom\n    at Parser.parse (/app/node.ts:1:1)')
  assert.equal(s.includes('at Parser.parse'), false)
  assert.match(s, /boom/)
})

test('publicApiErrorMessage uses fallback when message empty', () => {
  assert.equal(publicApiErrorMessage(new Error('   '), 'X'), 'X')
  assert.equal(publicApiErrorMessage(null, 'Y'), 'Y')
})

test('publicApiErrorMessage scrubs Error message', () => {
  const m = publicApiErrorMessage(new Error('fail: a@b.co'), 'fallback')
  assert.doesNotMatch(m, /@/)
  assert.match(m, /\[redacted\]/)
})
