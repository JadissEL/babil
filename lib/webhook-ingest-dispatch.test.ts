import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  dispatchWebhookIngest,
  type WebhookIngestDispatchDeps,
} from '@/lib/webhook-ingest-dispatch'

describe('webhook-ingest-dispatch', () => {
  it('no_event when payload has no string event', async () => {
    const r = await dispatchWebhookIngest({})
    assert.equal(r.kind, 'no_event')
    const r2 = await dispatchWebhookIngest({ event: 1 })
    assert.equal(r2.kind, 'no_event')
  })

  it('unknown_event for unrecognized event string', async () => {
    const r = await dispatchWebhookIngest({ event: 'custom.vendor.event' })
    assert.deepEqual(r, { kind: 'unknown_event', event: 'custom.vendor.event' })
  })

  it('ping and webhook.ping', async () => {
    const r = await dispatchWebhookIngest({ event: 'ping' })
    assert.equal(r.kind, 'ok')
    if (r.kind === 'ok') {
      assert.equal(r.event, 'ping')
      assert.equal(r.body.handled, true)
      assert.equal(r.body.ping, 'ok')
    }
    const r2 = await dispatchWebhookIngest({ event: 'webhook.ping' })
    assert.equal(r2.kind, 'ok')
  })

  it('intelligence.pipeline.run delegates to runEnrichmentPipeline', async () => {
    let called: { trigger?: string; worldBank?: boolean; materializeEconomy?: boolean } | null =
      null
    const deps: WebhookIngestDispatchDeps = {
      runEnrichmentPipeline: async (args) => {
        called = { ...args }
        return {
          runId: 'run-1',
          status: 'SUCCEEDED',
          observationsWritten: 3,
          materializedCountries: 2,
        }
      },
    }
    const r = await dispatchWebhookIngest(
      { event: 'intelligence.pipeline.run', mode: 'materialize' },
      deps,
    )
    assert.equal(r.kind, 'ok')
    assert.deepEqual(called, {
      trigger: 'webhook',
      worldBank: false,
      materializeEconomy: true,
    })
    if (r.kind === 'ok') {
      assert.deepEqual(r.body.pipeline, {
        runId: 'run-1',
        status: 'SUCCEEDED',
        observationsWritten: 3,
        materializedCountries: 2,
      })
    }
  })
})
