import { NextResponse } from 'next/server'

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function trimOriginCandidate(raw: string): string | null {
  const t = raw.trim()
  if (!t) return null
  try {
    const u = new URL(t.includes('://') ? t : `https://${t}`)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    return `${u.protocol}//${u.host}`
  } catch {
    return null
  }
}

/**
 * Origins autorisées pour les requêtes mutantes (CSRF / cross-origin) en **production**.
 * Sources : `NEXT_PUBLIC_APP_URL`, `BABIL_APP_URL`, `BABIL_ALLOWED_ORIGINS` (virgules),
 * `VERCEL_URL`, `RENDER_EXTERNAL_URL` (E.68).
 */
export function parseConfiguredMutationOrigins(): string[] {
  const set = new Set<string>()

  const add = (raw: string | undefined) => {
    const o = raw ? trimOriginCandidate(raw) : null
    if (o) set.add(o)
  }

  add(process.env.NEXT_PUBLIC_APP_URL)
  add(process.env.BABIL_APP_URL)

  const extra = process.env.BABIL_ALLOWED_ORIGINS?.split(',') ?? []
  for (const part of extra) add(part)

  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) add(`https://${vercel}`)

  add(process.env.RENDER_EXTERNAL_URL)

  return Array.from(set)
}

function refererOrigin(referer: string | null): string | null {
  if (!referer?.trim()) return null
  return trimOriginCandidate(referer)
}

export function isMutationHttpMethod(method: string): boolean {
  return MUTATION_METHODS.has(method.toUpperCase())
}

/** Pour tests unitaires (sans lire `process.env`). */
export function mutationOriginMatchesAllowlist(
  method: string,
  originHeader: string | null,
  refererHeader: string | null,
  allowed: ReadonlySet<string>,
): boolean {
  if (!isMutationHttpMethod(method)) return true
  if (allowed.size === 0) return false
  const origin = originHeader?.trim() || null
  if (origin && origin !== 'null') {
    return allowed.has(origin)
  }
  const ref = refererOrigin(refererHeader)
  return ref ? allowed.has(ref) : false
}

export function requestMutationOriginOk(req: Request): boolean {
  if (process.env.BABIL_MUTATION_ORIGIN_GUARD_DISABLED === '1') return true
  if (process.env.NODE_ENV !== 'production') return true

  const allowed = new Set(parseConfiguredMutationOrigins())
  return mutationOriginMatchesAllowlist(
    req.method,
    req.headers.get('origin'),
    req.headers.get('referer'),
    allowed,
  )
}

/** Si non-null, retourner immédiatement depuis le handler (403). */
export function mutationOriginDeniedResponse(req: Request): NextResponse | null {
  if (requestMutationOriginOk(req)) return null
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
