import { NextResponse } from 'next/server'

import { verifyBabilWebhookSignature } from '@/lib/webhook-signature'

export const runtime = 'nodejs'

const SIGNATURE_HEADER = 'x-babil-webhook-signature'

/**
 * Point d’entrée webhook signé (E.76) pour intégrations externes (n8n, Make, GitHub Actions, etc.).
 *
 * - **Méthode** : `POST` uniquement.
 * - **Secret** : `BABIL_WEBHOOK_INGEST_SECRET` (obligatoire en prod pour accepter des appels).
 * - **Signature** : en-tête `X-Babil-Webhook-Signature: sha256=<hmac_hex>` où le HMAC-SHA256
 *   est calculé sur le **corps brut** (octets UTF-8 du body) avec le même secret.
 * - **Réponse** : `200` `{ ok: true, event? }` si JSON valide ; corps vide accepté (`event` absent).
 */
export async function POST(req: Request) {
  const secret = process.env.BABIL_WEBHOOK_INGEST_SECRET?.trim()
  if (!secret) {
    return NextResponse.json({ error: 'Webhook ingest not configured' }, { status: 503 })
  }

  const raw = await req.text()
  const sig = req.headers.get(SIGNATURE_HEADER)
  if (!verifyBabilWebhookSignature(raw, sig, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (raw.trim() === '') {
    return NextResponse.json({ ok: true })
  }

  let payload: unknown
  try {
    payload = JSON.parse(raw) as unknown
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const event =
    payload !== null &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    typeof (payload as { event?: unknown }).event === 'string'
      ? (payload as { event: string }).event
      : undefined

  return NextResponse.json({ ok: true, ...(event !== undefined ? { event } : {}) })
}

export function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
