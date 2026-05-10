import { createHmac, timingSafeEqual } from 'node:crypto'

/** En-tête attendu : `X-Babil-Webhook-Signature: sha256=<64 hex>` (E.76). */
const SHA256_PREFIX = /^sha256=([a-fA-F0-9]{64})$/i

/**
 * HMAC-SHA256 du corps brut (UTF-8), digest **hex** (minuscules).
 */
export function computeBabilWebhookSignature(secret: string, rawBody: string): string {
  return createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')
}

/**
 * Vérifie la signature constant-time. `signatureHeader` doit être au format `sha256=<hex>`.
 */
export function verifyBabilWebhookSignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string,
): boolean {
  if (!secret || signatureHeader == null || signatureHeader === '') return false
  const m = String(signatureHeader).trim().match(SHA256_PREFIX)
  if (!m) return false
  const claimedHex = m[1].toLowerCase()
  const expectedHex = computeBabilWebhookSignature(secret, rawBody)
  try {
    const a = Buffer.from(claimedHex, 'hex')
    const b = Buffer.from(expectedHex, 'hex')
    if (a.length !== b.length || a.length !== 32) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
