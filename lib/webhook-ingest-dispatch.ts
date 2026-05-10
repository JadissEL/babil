import { runEnrichmentPipeline } from '@/lib/intelligence-pipeline/run-enrichment-stub'

export type WebhookIngestDispatchDeps = {
  runEnrichmentPipeline: typeof runEnrichmentPipeline
}

const defaultDeps: WebhookIngestDispatchDeps = { runEnrichmentPipeline }

function extractEvent(payload: unknown): string | undefined {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return undefined
  const e = (payload as { event?: unknown }).event
  return typeof e === 'string' && e.trim() !== '' ? e.trim() : undefined
}

function getPipelineMode(payload: unknown): 'full' | 'materialize' {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) return 'full'
  const m = (payload as { mode?: unknown }).mode
  return m === 'materialize' ? 'materialize' : 'full'
}

export type WebhookIngestDispatchOutcome =
  | { kind: 'no_event' }
  | { kind: 'unknown_event'; event: string }
  | { kind: 'ok'; event: string; body: Record<string, unknown> }

/**
 * Effets de bord autorisés pour `POST /api/webhooks/ingest` après vérification HMAC (E.76).
 * Événements non reconnus : pas d’effet, réponse HTTP 200 avec `handled: false`.
 */
export async function dispatchWebhookIngest(
  payload: unknown,
  deps: WebhookIngestDispatchDeps = defaultDeps,
): Promise<WebhookIngestDispatchOutcome> {
  const event = extractEvent(payload)
  if (event === undefined) {
    return { kind: 'no_event' }
  }

  const key = event.toLowerCase()

  if (key === 'webhook.ping' || key === 'ping') {
    return { kind: 'ok', event, body: { handled: true, ping: 'ok' as const } }
  }

  if (key === 'intelligence.pipeline.run') {
    const mode = getPipelineMode(payload)
    const worldBank = mode !== 'materialize'
    const materializeEconomy = true
    const pipelineResult = await deps.runEnrichmentPipeline({
      trigger: 'webhook',
      worldBank,
      materializeEconomy,
    })
    return {
      kind: 'ok',
      event,
      body: {
        handled: true,
        pipeline: {
          runId: pipelineResult.runId,
          status: pipelineResult.status,
          observationsWritten: pipelineResult.observationsWritten,
          materializedCountries: pipelineResult.materializedCountries,
        },
      },
    }
  }

  return { kind: 'unknown_event', event }
}
