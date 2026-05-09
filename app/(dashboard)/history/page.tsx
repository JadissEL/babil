'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { History, Loader2 } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type HistoryEvent = {
  id: string
  type: string
  payload: Record<string, unknown> | null
  createdAt: string
}

function payloadPreview(payload: Record<string, unknown> | null): string {
  if (!payload || typeof payload !== 'object') return '—'
  try {
    return JSON.stringify(payload)
  } catch {
    return '—'
  }
}

function countryLinkFromPayload(payload: Record<string, unknown> | null): string | null {
  if (!payload || typeof payload !== 'object') return null
  const raw = (payload as { countryId?: unknown }).countryId
  const id = typeof raw === 'number' ? raw : Number(raw)
  if (!Number.isFinite(id)) return null
  return `/countries/${id}`
}

export default function HistoryPage() {
  const [events, setEvents] = useState<HistoryEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('__all__')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/user/history?limit=200')
        const data = await res.json()
        if (cancelled) return
        if (!res.ok || !Array.isArray(data)) {
          setEvents([])
          return
        }
        setEvents(data as HistoryEvent[])
      } catch {
        if (!cancelled) setEvents([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const types = useMemo(() => {
    const s = new Set<string>()
    for (const e of events) s.add(e.type || '(vide)')
    return Array.from(s).sort((a, b) => a.localeCompare(b, 'fr'))
  }, [events])

  const filtered = useMemo(() => {
    if (typeFilter === '__all__') return events
    return events.filter((e) => (e.type || '(vide)') === typeFilter)
  }, [events, typeFilter])

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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-text">
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
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm font-medium text-muted">
              Aucun événement pour ce filtre. Les visites de fiches pays apparaissent après connexion sur une page
              pays.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-line bg-inset text-[10px] font-black uppercase tracking-widest text-muted">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Payload</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => {
                    const pl = e.payload
                    const countryHref = e.type === 'VIEW_COUNTRY' ? countryLinkFromPayload(pl) : null
                    return (
                      <tr key={e.id} className="border-b border-line/80 last:border-0">
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-text">
                          {new Date(e.createdAt).toLocaleString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 font-bold text-text">{e.type || '—'}</td>
                        <td className="max-w-md truncate px-4 py-3 font-mono text-xs text-muted">
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
