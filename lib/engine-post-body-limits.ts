/**
 * Guardrail for JSON POST bodies on heavy engine routes (D.59).
 * Prefer checking `Content-Length` before `req.json()` to avoid reading huge payloads.
 */

const DEFAULT_MAX_CONTENT_LENGTH = 65_536 // 64 KiB

export function maxEnginePostContentLengthBytes(): number {
  const raw = process.env.BABIL_ENGINE_POST_MAX_CONTENT_LENGTH
  if (raw === undefined || raw === '') return DEFAULT_MAX_CONTENT_LENGTH
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_CONTENT_LENGTH
}

export type ContentLengthCheck = { ok: true } | { ok: false; maxBytes: number }

/** Reject oversize declared bodies; if header missing, allow (stream size not known). */
export function checkEnginePostContentLength(req: Request): ContentLengthCheck {
  const maxBytes = maxEnginePostContentLengthBytes()
  const cl = req.headers.get('content-length')
  if (!cl) return { ok: true }
  const n = Number.parseInt(cl, 10)
  if (!Number.isFinite(n) || n < 0) return { ok: true }
  if (n > maxBytes) return { ok: false, maxBytes }
  return { ok: true }
}
