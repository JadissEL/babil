import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

/**
 * Clerk auth boundary only (catalogue **D.58**).
 *
 * - Runs on the **Edge** runtime — keep this file free of DB/Prisma, large JSON parsing, or geo lookups.
 * - Geo / personalization belong in Route Handlers or `next.config` rewrites, not here.
 * - Matcher skips static assets (`_next`, images, fonts, …) — see `config.matcher`.
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
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
