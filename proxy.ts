import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
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
const isProtectedRoute = createRouteMatcher([
  '/services/delegated-applications(.*)',
  '/overview(.*)',
  '/history(.*)',
  '/profile(.*)',
  '/design-system(.*)',
  '/moderation(.*)',
  /** /probability, /recommendations, /recommendation-engine : publics (voir proxy + doc moteurs) */
  '/admin(.*)',
  '/api/admin(.*)',
  '/api/comments(.*)',
  '/api/user/profile(.*)',
  '/api/user/favorites(.*)',
  '/api/user/history(.*)',
  '/api/user/data-export(.*)',
  '/api/delegated-application-requests(.*)',
]);

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
