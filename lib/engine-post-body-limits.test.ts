import assert from 'node:assert/strict'
import { test } from 'node:test'

import { checkEnginePostContentLength, maxEnginePostContentLengthBytes } from '@/lib/engine-post-body-limits'

test('checkEnginePostContentLength rejects oversized Content-Length', () => {
  const max = maxEnginePostContentLengthBytes()
  const req = new Request('https://x.test/post', {
    method: 'POST',
    headers: { 'content-length': String(max + 1) },
  })
  const r = checkEnginePostContentLength(req)
  assert.equal(r.ok, false)
  if (!r.ok) assert.equal(r.maxBytes, max)
})

test('checkEnginePostContentLength allows when header absent or small', () => {
  assert.equal(checkEnginePostContentLength(new Request('https://x.test/post', { method: 'POST' })).ok, true)
  const req = new Request('https://x.test/post', {
    method: 'POST',
    headers: { 'content-length': '120' },
  })
  assert.equal(checkEnginePostContentLength(req).ok, true)
})
