import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

/** E.76 — ingest route must verify Babil webhook signature. */
describe('webhook ingest wiring (E.76)', () => {
  it('ingest route uses verifyBabilWebhookSignature and ingest secret env', () => {
    const src = readFileSync(join(process.cwd(), 'app/api/webhooks/ingest/route.ts'), 'utf8')
    assert.match(src, /verifyBabilWebhookSignature/)
    assert.match(src, /BABIL_WEBHOOK_INGEST_SECRET/)
    assert.match(src, /dispatchWebhookIngest/)
  })
})
