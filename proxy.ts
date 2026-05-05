import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/overview(.*)',
  '/profile(.*)',
  '/moderation(.*)',
  '/probability(.*)',
  '/recommendations(.*)',
  '/recommendation-engine(.*)',
  '/admin(.*)',
  '/api/admin(.*)',
  '/api/recommendation(.*)',
  '/api/comments(.*)',
  '/api/probability(.*)',
  '/api/user/profile(.*)',
  '/api/user/favorites(.*)',
  '/api/user/history(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
