import assert from 'node:assert/strict'
import { test } from 'node:test'

import { ifNoneMatchReturns304, weakEtagFromUtf8 } from '@/lib/http-weak-etag'

test('weakEtagFromUtf8 is deterministic', () => {
  const a = weakEtagFromUtf8('{"x":1}')
  const b = weakEtagFromUtf8('{"x":1}')
  assert.match(a, /^W\/"[a-f0-9]{32}"$/)
  assert.equal(a, b)
})

test('ifNoneMatchReturns304 exact weak etag', () => {
  const etag = 'W/"abc"'
  const req = new Request('https://x.test/a', { headers: { 'if-none-match': etag } })
  assert.equal(ifNoneMatchReturns304(req, etag), true)
})

test('ifNoneMatchReturns304 false when absent', () => {
  const req = new Request('https://x.test/a')
  assert.equal(ifNoneMatchReturns304(req, 'W/"x"'), false)
})

test('ifNoneMatchReturns304 matches token in comma-separated list', () => {
  const etag = 'W/"deadbeef"'
  const req = new Request('https://x.test/a', {
    headers: { 'if-none-match': `W/"other", ${etag}` },
  })
  assert.equal(ifNoneMatchReturns304(req, etag), true)
})
