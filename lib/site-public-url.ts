/**
 * Canonical public origin for absolute URLs (SEO, JSON-LD).
 * Order matches mutation-origin priorities where relevant.
 */
function trimOriginCandidate(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    const u = new URL(t.includes('://') ? t : `https://${t}`);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

export function getPublicSiteOrigin(): string | null {
  const fromEnv = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.BABIL_APP_URL,
    process.env.RENDER_EXTERNAL_URL,
  ];
  for (const raw of fromEnv) {
    const o = raw ? trimOriginCandidate(raw) : null;
    if (o) return o;
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return trimOriginCandidate(`https://${vercel}`);
  return null;
}
