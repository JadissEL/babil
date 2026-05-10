/**
 * E.71 — Réponses JSON d’erreur sans fuite de PII ni stack vers le client.
 * Les détails restent côté serveur (logs plateforme / observabilité).
 */

const EMAIL_RE =
  /\b[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\b/g

const DB_URL_RE = /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s"'<>]+/gi

const BEARER_RE = /\bBearer\s+[a-zA-Z0-9._=-]+\b/gi

const STRIPE_LIKE_RE = /\b(?:sk|pk)_(?:live|test)_[a-zA-Z0-9]+\b/g

const JWT_RE = /\beyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\b/g

const REDACT = '[redacted]'

function stripStackLikeLines(text: string): string {
  return text
    .split('\n')
    .filter((line) => !/^\s*at\s+/.test(line) && !/^\s*Caused by:\s*/i.test(line))
    .join('\n')
}

/**
 * Nettoie une chaîne destinée au navigateur (admin inclus) : emails, URL DB, jetons.
 */
export function scrubSensitiveClientText(text: string): string {
  if (!text) return text
  let s = stripStackLikeLines(text)
  s = s.replace(DB_URL_RE, REDACT)
  s = s.replace(BEARER_RE, `Bearer ${REDACT}`)
  s = s.replace(STRIPE_LIKE_RE, REDACT)
  s = s.replace(JWT_RE, REDACT)
  s = s.replace(EMAIL_RE, REDACT)
  return s.trim()
}

/**
 * Message d’erreur sûr pour `NextResponse.json({ error })` (5xx et champs `detail`).
 */
export function publicApiErrorMessage(error: unknown, fallback: string): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : error === null || error === undefined
          ? ''
          : String(error)

  const scrubbed = scrubSensitiveClientText(raw)
  if (!scrubbed) return fallback

  if (process.env.NODE_ENV === 'production' && scrubbed.length > 800) {
    return fallback
  }

  return scrubbed
}
