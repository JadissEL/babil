'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { CheckCircle2, Circle, ListChecks, X } from 'lucide-react'

import { ONBOARDING_STORAGE_UPDATED_EVENT, readOnboarding, writeOnboarding } from '@/lib/onboarding-storage'
import { CTA_COMPARE_TOURISM_HREF, CTA_EXPLORE_HREF } from '@/lib/cta-hrefs'

function profileLooksComplete(p: Record<string, unknown> | null): boolean {
  if (!p || (p as { error?: unknown }).error) return false
  const income = Number((p as { income?: unknown }).income)
  const savings = Number((p as { savings?: unknown }).savings)
  const goal = String((p as { goal_type?: unknown }).goal_type ?? '').trim()
  return Number.isFinite(income) && income > 0 && Number.isFinite(savings) && goal.length > 0
}

function accountIsRecent(createdAt: Date | undefined, maxDays: number) {
  if (!createdAt) return true
  const days = (Date.now() - createdAt.getTime()) / 864e5
  return days <= maxDays
}

export function PostSignupOnboarding() {
  const { user, isLoaded } = useUser()
  const [profileOk, setProfileOk] = useState(false)
  const [store, setStore] = useState<ReturnType<typeof readOnboarding>>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setStore(readOnboarding())
    setHydrated(true)
  }, [])

  useEffect(() => {
    const sync = () => setStore(readOnboarding())
    const onVis = () => {
      if (document.visibilityState === 'visible') sync()
    }
    window.addEventListener(ONBOARDING_STORAGE_UPDATED_EVENT, sync)
    window.addEventListener('focus', sync)
    window.addEventListener('storage', sync)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener(ONBOARDING_STORAGE_UPDATED_EVENT, sync)
      window.removeEventListener('focus', sync)
      window.removeEventListener('storage', sync)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    let cancelled = false
    fetch('/api/user/profile')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setProfileOk(profileLooksComplete(d as Record<string, unknown>))
      })
      .catch(() => {
        if (!cancelled) setProfileOk(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const createdAt = user?.createdAt ? new Date(user.createdAt) : undefined

  const steps = useMemo(
    () =>
      [
        {
          done: profileOk,
          title: 'Compléter votre profil',
          description: 'Revenu, épargne et objectif — nécessaire aux moteurs.',
          href: '/profile',
        },
        {
          done: Boolean(store.recoSeen),
          title: 'Voir vos recommandations',
          description: 'Classement personnalisé selon votre profil.',
          href: '/recommendations',
        },
        {
          done: Boolean(store.explorerDone),
          title: 'Parcourir l’explorateur',
          description: 'Utilisez les filtres, la recherche ou ouvrez une fiche pays.',
          href: CTA_EXPLORE_HREF,
        },
      ] as const,
    [profileOk, store.recoSeen, store.explorerDone],
  )

  const allDone = steps.every((s) => s.done)

  if (!isLoaded || !hydrated || !user) return null
  if (store.dismissed) return null

  const recent = accountIsRecent(createdAt, 21)
  if (!recent && profileOk) return null
  if (allDone) return null

  return (
    <div className="mb-10 rounded-2xl border border-primary/30 bg-primary-soft/35 p-5 shadow-card sm:rounded-[2rem] sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <ListChecks className="h-6 w-6 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0">
            <h2 className="text-base font-black text-text sm:text-lg">Premiers pas sur VisaFlow</h2>
            <p className="mt-1 text-xs font-medium text-muted sm:text-sm">
              Parcours rapide après inscription — vous pouvez masquer ce bloc à tout moment.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-xl border border-line bg-surface p-2 text-muted transition-colors hover:bg-inset hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Masquer la checklist"
          onClick={() => {
            writeOnboarding({ dismissed: true })
            setStore(readOnboarding())
          }}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ul className="space-y-3">
        {steps.map((s) => (
          <li
            key={s.href}
            className="flex items-start gap-3 rounded-xl border border-line/80 bg-surface/80 p-3 sm:p-4"
          >
            {s.done ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
            ) : (
              <Circle className="mt-0.5 h-5 w-5 shrink-0 text-muted" aria-hidden />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-black text-text">{s.title}</p>
              <p className="mt-0.5 text-xs font-medium text-muted sm:text-sm">{s.description}</p>
              {!s.done ? (
                <Link
                  href={s.href}
                  className="mt-2 inline-flex text-xs font-bold text-primary underline-offset-2 hover:underline sm:text-sm"
                >
                  Ouvrir →
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[11px] font-medium text-muted">
        Astuce : essayez aussi le{' '}
        <Link href={CTA_COMPARE_TOURISM_HREF} className="font-bold text-primary underline-offset-2 hover:underline">
          comparateur (objectif tourisme)
        </Link>
        .
      </p>
    </div>
  )
}
