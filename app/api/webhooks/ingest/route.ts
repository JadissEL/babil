import { NextResponse } from 'next/server';
import { publicApiErrorMessage } from '@/lib/api-public-error';
import { dispatchWebhookIngest } from '@/lib/webhook-ingest-dispatch';
import { verifyBabilWebhookSignature } from '@/lib/webhook-signature';

export const runtime = 'nodejs';
/** Aligné sur `/api/cron/intelligence-pipeline` pour `event: intelligence.pipeline.run`. */
export const maxDuration = 300;

const SIGNATURE_HEADER = 'x-babil-webhook-signature';

/**
 * Point d’entrée webhook signé (E.76) pour intégrations externes (n8n, Make, GitHub Actions, etc.).
 *
 * - **Méthode** : `POST` uniquement.
 * - **Secret** : `BABIL_WEBHOOK_INGEST_SECRET` (obligatoire en prod pour accepter des appels).
 * - **Signature** : en-tête `X-Babil-Webhook-Signature: sha256=<hmac_hex>` où le HMAC-SHA256
 *   est calculé sur le **corps brut** (octets UTF-8 du body) avec le même secret.
 * - **Réponse** : `200` — corps vide `{ ok: true }` ; JSON sans `event` idem ; avec `event` connu,
 *   voir `lib/webhook-ingest-dispatch.ts` (`handled`, effets de bord).
 */
export async function POST(req: Request) {
  const secret = process.env.BABIL_WEBHOOK_INGEST_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: 'Webhook ingest not configured' }, { status: 503 });
  }

  const raw = await req.text();
  const sig = req.headers.get(SIGNATURE_HEADER);
  if (!verifyBabilWebhookSignature(raw, sig, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (raw.trim() === '') {
    return NextResponse.json({ ok: true });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw) as unknown;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const outcome = await dispatchWebhookIngest(payload);
    if (outcome.kind === 'no_event') {
      return NextResponse.json({ ok: true });
    }
    if (outcome.kind === 'unknown_event') {
      return NextResponse.json({ ok: true, event: outcome.event, handled: false });
    }
    return NextResponse.json({ ok: true, event: outcome.event, ...outcome.body });
  } catch (e) {
    return NextResponse.json(
      { error: publicApiErrorMessage(e, 'Webhook dispatch failed') },
      { status: 500 },
    );
  }
}

export function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
