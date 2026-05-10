/**
 * Stable pseudonymous id for Sentry (G.90) — never send raw Clerk user ids.
 * Uses SHA-256 prefix; same input yields same prefix (useful for issue grouping).
 */
export async function sentryAnonymizedUserKey(rawUserId: string): Promise<string> {
  const data = new TextEncoder().encode(rawUserId)
  const digest = await crypto.subtle.digest('SHA-256', data)
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `u_${hex.slice(0, 16)}`
}
