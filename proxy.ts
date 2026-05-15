import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { PROTECTED_ROUTE_PATTERNS } from '@/lib/auth-protected-routes';
import { BABIL_REQUEST_ID_HEADER } from '@/lib/request-id-constants';

function resolveRequestId(req: Request): string {
  return (
    req.headers.get(BABIL_REQUEST_ID_HEADER)?.trim() ||
    req.headers.get('x-request-id')?.trim() ||
    req.headers.get('x-vercel-id')?.trim() ||
    crypto.randomUUID()
  );
}

/** G.91 — one JSON line per `/api/*` hit on Vercel (or when `BABIL_API_ACCESS_LOG=1`). Off if `BABIL_API_ACCESS_LOG=0`. */
function shouldJsonAccessLog(): boolean {
  if (process.env.BABIL_API_ACCESS_LOG === '0') return false;
  if (process.env.BABIL_API_ACCESS_LOG === '1') return true;
  return process.env.VERCEL === '1';
}

/**
 * Clerk auth boundary only (catalogue **D.58**).
 *
 * - Runs on the **Edge** runtime — keep this file free of DB/Prisma, large JSON parsing, or geo lookups.
 * - Geo / personalization belong in Route Handlers or `next.config` rewrites, not here.
 * - Matcher skips static assets (`_next`, images, fonts, …) — see `config.matcher`.
 * - **G.91:** ensures `x-babil-request-id` on request + response for log correlation.
 */
/**
 * Liste centralisée dans `lib/auth-protected-routes.ts` (single source of truth
 * partagée avec le dashboard Rampart — Stitch PAGE 39 §5.2).
 *
 * Routes publiques notables (hors shell Nexus, non listées ici) :
 *   `/countries/*`, `/legal`, `/services/delegated-applications` (auth séparé).
 * Shell Nexus + outils (`/`, `/probability`, `/explorer`, …) : `lib/nexus-shell-routes.ts`.
 */
const isProtectedRoute = createRouteMatcher([...PROTECTED_ROUTE_PATTERNS]);

export default clerkMiddleware(async (auth, req) => {
  const requestId = resolveRequestId(req);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(BABIL_REQUEST_ID_HEADER, requestId);

  if (isProtectedRoute(req)) await auth.protect();

  const res = NextResponse.next({
    request: { headers: requestHeaders },
  });
  res.headers.set(BABIL_REQUEST_ID_HEADER, requestId);

  if (shouldJsonAccessLog() && req.nextUrl.pathname.startsWith('/api')) {
    console.log(
      JSON.stringify({
        level: 'info',
        msg: 'api_request',
        service: 'babil-edge',
        requestId,
        method: req.method,
        path: req.nextUrl.pathname,
        ts: new Date().toISOString(),
      }),
    );
  }

  return res;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
