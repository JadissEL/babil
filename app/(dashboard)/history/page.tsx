'use client'

import { History } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { DashboardPageSkeleton } from '@/components/dashboard/DashboardPageSkeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { historyEventTypeLabelFr } from '@/lib/history-event-labels'

type HistoryEvent = {
  id: string
  type: string
  payload: Record<string, unknown> | null
  createdAt: string
}

type CountryRow = { id: number; name: string }

function payloadPreview(payload: Record<string, unknown> | null): string {
  if (!payload || typeof payload !== 'object') return '—'
  try {
    return JSON.stringify(payload)
  } catch {
    return '—'
  }
}

function countryIdFromPayload(payload: Record<string, unknown> | null): number | null {
  if (!payload || typeof payload !== 'object') return null
  const raw = (payload as { countryId?: unknown }).countryId
  const id = typeof raw === 'number' ? raw : Number(raw)
  return Number.isFinite(id) ? id : null
}

function countryLinkFromPayload(payload: Record<string, unknown> | null): string | null {
  const id = countryIdFromPayload(payload)
  return id != null ? `/countries/${id}` : null
}

export default function HistoryPage() {
  const [events, setEvents] = useState<HistoryEvent[]>([])
  const [countries, setCountries] = useState<CountryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('__all__')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [histRes, countriesRes] = await Promise.all([
          fetch('/api/user/history?limit=200'),
          fetch('/api/countries?light=1'),
        ])
        if (cancelled) return

        const histData = histRes.ok ? await histRes.json() : []
        const countriesData = countriesRes.ok ? await countriesRes.json() : []

        if (!cancelled) {
          setEvents(Array.isArray(histData) ? (histData as HistoryEvent[]) : [])
          setCountries(Array.isArray(countriesData) ? (countriesData as CountryRow[]) : [])
        }
      } catch {
        if (!cancelled) {
          setEvents([])
          setCountries([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const countryById = useMemo(() => new Map(countries.map((c) => [c.id, c.name])), [countries])

  const types = useMemo(() => {
    const s = new Set<string>()
    for (const e of events) s.add(e.type || '(vide)')
    return Array.from(s).sort((a, b) => a.localeCompare(b, 'fr'))
  }, [events])

  const byType = useMemo(() => {
    if (typeFilter === '__all__') return events
    return events.filter((e) => (e.type || '(vide)') === typeFilter)
  }, [events, typeFilter])

  const q = search.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!q) return byType
    return byType.filter((e) => {
      const typeFr = historyEventTypeLabelFr(e.type).toLowerCase()
      const typeRaw = (e.type || '').toLowerCase()
      const pl = payloadPreview(e.payload).toLowerCase()
      const dateStr = new Date(e.createdAt).toLocaleString('fr-FR').toLowerCase()
      const cid = countryIdFromPayload(e.payload)
      const cname = cid != null ? (countryById.get(cid) ?? '').toLowerCase() : ''
      return (
        typeFr.includes(q) ||
        typeRaw.includes(q) ||
        pl.includes(q) ||
        dateStr.includes(q) ||
        cname.includes(q) ||
        String(cid ?? '').includes(q)
      )
    })
  }, [byType, q, countryById])

  return (
    <div>
      <div className="mb-8 sm:mb-10">
        <h1 className="mb-2 flex items-center gap-2 text-2xl font-black tracking-tight text-text sm:text-3xl lg:text-4xl">
          <History className="h-8 w-8 shrink-0 text-primary" />
          Historique d&apos;activité
        </h1>
        <p className="text-sm font-medium text-muted sm:text-base">
          Événements enregistrés pour votre compte (consultation de fiches pays, etc.). Données limitées aux 200
          entrées les plus récentes.
        </p>
      </div>

      <Card className="border-line bg-surface shadow-card">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1 space-y-2">
              <label htmlFor="history-search" className="text-xs font-black uppercase tracking-widest text-muted">
                Recherche
              </label>
              <Input
                id="history-search"
                type="search"
                placeholder="Pays, type, date, contenu du payload…"
                value={search}
                onChange={(ev) => setSearch(ev.target.value)}
                className="border-line bg-inset"
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
              <p className="text-sm font-bold text-text sm:pt-6">
                {loading ? 'Chargement…' : `${filtered.length} événement${filtered.length > 1 ? 's' : ''}`}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-muted">Type</span>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full border-line bg-inset sm:w-[220px]">
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Tous les types</SelectItem>
                    {types.map((t) => (
                      <SelectItem key={t} value={t}>
                        {historyEventTypeLabelFr(t === '(vide)' ? '' : t)}
                        {t && t !== '(vide)' ? ` (${t})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {loading ? (
            <DashboardPageSkeleton variant="table" />
          ) : filtered.length === 0 ? (
            <div className="space-y-4 py-12">
              <p className="text-center text-sm font-medium text-muted">
                Aucun événement pour ce filtre. Les visites de fiches pays apparaissent après connexion sur une page
                pays.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 pb-8 sm:flex-row">
                <Link
                  href="/explorer"
                  className="inline-flex rounded-xl border border-line bg-surface px-5 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary-soft"
                >
                  Ouvrir l&apos;explorateur
                </Link>
                <Link
                  href="/profile"
                  className="inline-flex rounded-xl border border-line bg-inset px-5 py-3 text-sm font-bold text-text transition-colors hover:bg-primary-soft"
                >
                  Vérifier mon profil
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-line bg-inset text-[10px] font-black uppercase tracking-widest text-muted">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Pays</th>
                    <th className="px-4 py-3">Détails</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => {
                    const pl = e.payload
                    const countryHref = e.type === 'VIEW_COUNTRY' ? countryLinkFromPayload(pl) : null
                    const cid = countryIdFromPayload(pl)
                    const countryName =
                      e.type === 'VIEW_COUNTRY' && cid != null ? countryById.get(cid) ?? `ID ${cid}` : '—'
                    const typeFr = historyEventTypeLabelFr(e.type)
                    return (
                      <tr key={e.id} className="border-b border-line/80 last:border-0">
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-text">
                          {new Date(e.createdAt).toLocaleString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 font-bold text-text">
                          <span title={e.type || undefined}>{typeFr}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-text">{countryName}</td>
                        <td className="max-w-xs truncate px-4 py-3 font-mono text-xs text-muted" title={payloadPreview(pl)}>
                          {payloadPreview(pl)}
                        </td>
                        <td className="px-4 py-3">
                          {countryHref ? (
                            <Link
                              href={countryHref}
                              className="font-bold text-primary underline-offset-2 hover:underline"
                            >
                              Fiche pays
                            </Link>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
