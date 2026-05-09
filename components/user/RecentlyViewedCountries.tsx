'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { ChevronRight, History } from 'lucide-react'

import { recentViewedCountryIdsFromHistory } from '@/lib/user-recent-country-views'

type CountryRow = { id: number; name: string }

export function RecentlyViewedCountries() {
  const { user, isLoaded } = useUser()
  const [items, setItems] = useState<CountryRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded || !user) {
      setLoading(false)
      setItems([])
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const [histRes, countriesRes] = await Promise.all([
          fetch('/api/user/history'),
          fetch('/api/countries?light=1'),
        ])
        if (cancelled) return

        if (!histRes.ok || !countriesRes.ok) {
          setItems([])
          setLoading(false)
          return
        }

        const events = (await histRes.json()) as Array<{ type: string; payload: unknown }>
        const countries = (await countriesRes.json()) as CountryRow[]
        if (!Array.isArray(events) || !Array.isArray(countries)) {
          setItems([])
          setLoading(false)
          return
        }

        const idOrder = recentViewedCountryIdsFromHistory(events, 10)
        const byId = new Map(countries.map((c) => [c.id, c]))
        const resolved = idOrder
          .map((id) => byId.get(id))
          .filter((c): c is CountryRow => Boolean(c?.name))

        setItems(resolved)
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isLoaded, user])

  if (!isLoaded || !user) return null
  if (loading) {
    return (
      <div className="mb-10 rounded-2xl border border-line bg-surface p-5 shadow-card sm:rounded-[2rem] sm:p-6">
        <div className="flex items-center gap-2 text-sm font-bold text-muted">
          <History className="h-4 w-4 shrink-0 animate-pulse text-primary" />
          Chargement de votre activité…
        </div>
      </div>
    )
  }
  if (items.length === 0) return null

  return (
    <div className="mb-10 rounded-2xl border border-primary/20 bg-primary-soft/30 p-5 shadow-card sm:rounded-[2rem] sm:p-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-base font-black text-text sm:text-lg">
          <History className="h-5 w-5 shrink-0 text-primary" />
          Reprendre vos recherches
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/history"
            className="text-xs font-bold text-primary underline-offset-2 hover:underline sm:text-sm"
          >
            Tout l&apos;historique
          </Link>
          <Link
            href="/explorer"
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline sm:text-sm"
          >
            Explorer <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
      <p className="mb-4 text-xs font-medium text-muted sm:text-sm">
        Pays récemment ouverts (compte connecté). Les visites sont enregistrées depuis la fiche pays.
      </p>
      <ul className="flex flex-wrap gap-2">
        {items.map((c) => (
          <li key={c.id}>
            <Link
              href={`/countries/${c.id}`}
              className="inline-flex items-center rounded-xl border border-line bg-surface px-3 py-2 text-sm font-bold text-text shadow-sm transition-colors hover:border-primary/40 hover:bg-primary-soft"
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
