'use client'

import { useAuth } from '@clerk/nextjs'
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'
import { sentryAnonymizedUserKey } from '@/lib/sentry-anon-user-id'

/**
 * G.90 — attach anonymized user context to the browser SDK (no email / name / raw Clerk id).
 */
export function SentryClerkSync() {
  const { userId, isLoaded, isSignedIn } = useAuth()

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return
    if (!isLoaded) return

    let cancelled = false
    if (isSignedIn && userId) {
      void (async () => {
        try {
          const key = await sentryAnonymizedUserKey(userId)
          if (cancelled) return
          Sentry.setUser({ id: key })
          Sentry.setTag('auth', 'signed_in')
        } catch {
          if (!cancelled) {
            Sentry.setUser(null)
            Sentry.setTag('auth', 'signed_in_unlabeled')
          }
        }
      })()
    } else {
      Sentry.setUser(null)
      Sentry.setTag('auth', 'anonymous')
    }
    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, userId])

  return null
}
