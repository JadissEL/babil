import assert from 'node:assert/strict'
import { test, afterEach } from 'node:test'
import { intelligencePipelineFetch, intelligencePipelineHttpTimeoutMs } from '@/lib/intelligence-pipeline/http-fetch'

afterEach(() => {
  delete process.env.INTELLIGENCE_HTTP_TIMEOUT_MS
})

test('intelligencePipelineHttpTimeoutMs parses env and caps', () => {
  assert.equal(intelligencePipelineHttpTimeoutMs(), 45_000)
  process.env.INTELLIGENCE_HTTP_TIMEOUT_MS = '5000'
  assert.equal(intelligencePipelineHttpTimeoutMs(), 5000)
  process.env.INTELLIGENCE_HTTP_TIMEOUT_MS = '999999'
  assert.equal(intelligencePipelineHttpTimeoutMs(), 120_000)
})

test('intelligencePipelineFetch aborts when response is slower than timeout', async () => {
  process.env.INTELLIGENCE_HTTP_TIMEOUT_MS = '40'
  const orig = globalThis.fetch
  globalThis.fetch = (_input: RequestInfo | URL, init?: RequestInit) =>
    new Promise<Response>((resolve, reject) => {
      const s = init?.signal
      if (s?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'))
        return
      }
      const t = setTimeout(() => {
        s?.removeEventListener('abort', onAbort)
        resolve(new Response('ok'))
      }, 60_000)
      const onAbort = () => {
        clearTimeout(t)
        reject(new DOMException('Aborted', 'AbortError'))
      }
      s?.addEventListener('abort', onAbort, { once: true })
    })
  try {
    await assert.rejects(
      () => intelligencePipelineFetch('https://example.test/wb'),
      (err: unknown) => err instanceof DOMException && err.name === 'AbortError',
    )
  } finally {
    globalThis.fetch = orig
    delete process.env.INTELLIGENCE_HTTP_TIMEOUT_MS
  }
})
