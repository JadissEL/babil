import { createHash } from 'node:crypto'

/** Weak ETag (RFC 7232) from a UTF-8 JSON string — stable for identical payload bytes. */
export function weakEtagFromUtf8(body: string): string {
  const h = createHash('sha256').update(body, 'utf8').digest('hex').slice(0, 32)
  return `W/"${h}"`
}

export function ifNoneMatchReturns304(req: Request, etag: string): boolean {
  const raw = req.headers.get('if-none-match')
  if (!raw) return false
  /** Support comma-separated list (RFC 9110) — any token matching our weak ETag. */
  for (const part of raw.split(',')) {
    if (part.trim() === etag) return true
  }
  return false
}
