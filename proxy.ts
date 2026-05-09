import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/services/delegated-applications(.*)',
  '/overview(.*)',
  '/history(.*)',
  '/profile(.*)',
  '/design-system(.*)',
  '/moderation(.*)',
  /** /probability et /recommendations : lecture découverte (profil démo serveur) pour visiteurs */
  '/recommendation-engine(.*)',
  '/admin(.*)',
  '/api/admin(.*)',
  '/api/comments(.*)',
  '/api/user/profile(.*)',
  '/api/user/favorites(.*)',
  '/api/user/history(.*)',
  '/api/delegated-application-requests(.*)',
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
