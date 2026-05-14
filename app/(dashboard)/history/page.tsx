'use client'

import {
  Activity,
  FileText,
  MapPin,
  MessageSquare,
  Search,
  ThumbsUp,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { DashboardPageSkeleton } from '@/components/dashboard/DashboardPageSkeleton'
import { ObjectiveAwareExplorerLink } from '@/components/nav/ObjectiveAwareNavLinks'
import { historyEventTypeLabelFr } from '@/lib/history-event-labels'

type HistoryEvent = {
  id: string
  type: string
  payload: Record<string, unknown> | null
  createdAt: string
}

type CountryRow = { id: number; name: string }

const SHELL = '#FAF7EE'
const INK_10 = 'rgba(13,27,62,0.10)'
const INK_05 = 'rgba(13,27,62,0.05)'
const PAGE_STEP = 50

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

function iconForType(type: string): ComponentType<{ className?: string }> {
  const t = (type || '').toUpperCase()
  if (t === 'VIEW_COUNTRY') return MapPin
  if (t === 'CONTENT_FEEDBACK' || t.includes('FEEDBACK')) return ThumbsUp
  if (t.startsWith('RUN_') || t.includes('ENGINE') || t.includes('SCORE')) return Activity
  if (t.startsWith('COMMENT') || t.includes('FORUM')) return MessageSquare
  return FileText
}

export default function HistoryPage() {
  const [events, setEvents] = useState<HistoryEvent[]>([])
  const [countries, setCountries] = useState<CountryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>('__all__')
  const [search, setSearch] = useState('')
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_STEP)

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

  useEffect(() => {
    setVisibleCount(PAGE_STEP)
  }, [typeFilter, q])

  const total = filtered.length
  const shown = Math.min(visibleCount, total)
  const visibleEvents = filtered.slice(0, shown)

  return (
    <div className="min-h-screen" style={{ backgroundColor: SHELL }}>
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-6 lg:px-8">
        <header className="mb-10">
          <span
            className="inline-flex items-center rounded-md border bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/65"
            style={{ borderColor: INK_10 }}
          >
            Log System
          </span>
          <h1 className="mt-5 font-serif text-3xl font-black leading-[1.05] tracking-tight text-[#0D1B3E] sm:text-4xl md:text-[44px]">
            Chronicle
          </h1>
          <p className="mt-4 max-w-2xl font-serif text-[15px] font-medium leading-relaxed text-[#0D1B3E]/65">
            Mémoire de vos explorations et analyses (limite 200 entrées). Un historique immuable
            des activités au sein du terminal.
          </p>
        </header>

        <section
          className="rounded-xl border bg-white"
          style={{ borderColor: INK_10 }}
          aria-label="Chronicle log"
        >
          <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3 lg:flex-1">
              <div className="relative min-w-0 flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0D1B3E]/45"
                  aria-hidden
                />
                <input
                  id="history-search"
                  type="search"
                  placeholder="Pays, type, date…"
                  value={search}
                  onChange={(ev) => setSearch(ev.target.value)}
                  autoComplete="off"
                  aria-label="Recherche historique"
                  className="h-11 w-full rounded-md border bg-[#FAF7EE] pl-9 pr-3 text-sm font-medium text-[#0D1B3E] outline-none placeholder:text-[#0D1B3E]/35 focus:border-[#0D1B3E] focus:ring-2 focus:ring-[#0D1B3E]/15"
                  style={{ borderColor: INK_10 }}
                />
              </div>
              <select
                aria-label="Filtrer par type"
                className="h-11 rounded-md border bg-[#FAF7EE] px-3 text-sm font-medium text-[#0D1B3E] outline-none focus:border-[#0D1B3E] focus:ring-2 focus:ring-[#0D1B3E]/15 sm:min-w-[200px]"
                style={{ borderColor: INK_10 }}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="__all__">Tous les types</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {historyEventTypeLabelFr(t === '(vide)' ? '' : t)}
                    {t && t !== '(vide)' ? ` (${t})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <p
              className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/55"
              aria-live="polite"
            >
              {loading
                ? 'Chargement…'
                : total === 0
                  ? 'Affichage 0 sur 0'
                  : `Affichage 1–${shown} sur ${total}`}
            </p>
          </div>

          {loading ? (
            <div className="border-t px-5 py-8 sm:px-6" style={{ borderColor: INK_10 }}>
              <DashboardPageSkeleton variant="table" />
            </div>
          ) : total === 0 ? (
            <div
              className="space-y-4 border-t px-5 py-14 text-center sm:px-6"
              style={{ borderColor: INK_10 }}
            >
              <p className="font-serif text-base font-medium text-[#0D1B3E]/65">
                Aucun événement pour ce filtre. Les visites de fiches pays apparaissent après
                connexion sur une page pays.
              </p>
              <div className="mt-2 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <ObjectiveAwareExplorerLink className="inline-flex items-center justify-center rounded-md border bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]">
                  Ouvrir l&apos;explorateur
                </ObjectiveAwareExplorerLink>
                <Link
                  href="/profile"
                  className="inline-flex items-center justify-center rounded-md border bg-[#FAF7EE] px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]"
                  style={{ borderColor: INK_10 }}
                >
                  Vérifier mon profil
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto border-t" style={{ borderColor: INK_10 }}>
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead
                    className="border-b text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55"
                    style={{ borderColor: INK_10, backgroundColor: INK_05 }}
                  >
                    <tr>
                      <th className="px-5 py-3 font-black">Date &amp; heure</th>
                      <th className="px-5 py-3 font-black">Type d&apos;activité</th>
                      <th className="px-5 py-3 font-black">Cible / Pays</th>
                      <th className="px-5 py-3 font-black">Détails (payload)</th>
                      <th className="px-5 py-3 text-right font-black">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleEvents.map((e) => {
                      const pl = e.payload
                      const countryHref =
                        e.type === 'VIEW_COUNTRY' ? countryLinkFromPayload(pl) : null
                      const cid = countryIdFromPayload(pl)
                      const countryName =
                        e.type === 'VIEW_COUNTRY' && cid != null
                          ? countryById.get(cid) ?? `ID ${cid}`
                          : null
                      const typeFr = historyEventTypeLabelFr(e.type)
                      const Icon = iconForType(e.type)
                      const payload = payloadPreview(pl)
                      const isPayloadEmpty = payload === '—'
                      return (
                        <tr
                          key={e.id}
                          className="border-b last:border-0 transition-colors hover:bg-[#FAF7EE]/60"
                          style={{ borderColor: INK_10 }}
                        >
                          <td className="whitespace-nowrap px-5 py-4 font-mono text-[12px] font-medium text-[#0D1B3E]/75">
                            <time dateTime={e.createdAt}>
                              {new Date(e.createdAt).toLocaleString('fr-FR')}
                            </time>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className="inline-flex items-center gap-2 font-medium text-[#0D1B3E]"
                              title={e.type || undefined}
                            >
                              <span
                                aria-hidden
                                className="flex h-7 w-7 items-center justify-center rounded-full border bg-[#FAF7EE] text-[#0D1B3E]/65"
                                style={{ borderColor: INK_10 }}
                              >
                                <Icon className="h-3.5 w-3.5" />
                              </span>
                              {typeFr}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {countryName ? (
                              <span className="font-medium text-[#0D1B3E]">{countryName}</span>
                            ) : (
                              <span className="font-serif italic text-[#0D1B3E]/45">Global</span>
                            )}
                          </td>
                          <td className="max-w-[260px] px-5 py-4">
                            {isPayloadEmpty ? (
                              <span className="text-[#0D1B3E]/35">—</span>
                            ) : (
                              <span
                                className="inline-block max-w-full truncate rounded-md border bg-[#FAF7EE] px-2.5 py-1 font-mono text-[11px] text-[#0D1B3E]/75"
                                style={{ borderColor: INK_10 }}
                                title={payload}
                              >
                                {payload}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            {countryHref ? (
                              <Link
                                href={countryHref}
                                className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0D1B3E] underline decoration-[#0D1B3E]/30 underline-offset-4 hover:decoration-[#0D1B3E]"
                              >
                                Fiche pays
                              </Link>
                            ) : (
                              <span
                                className="inline-flex items-center rounded-md border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/45"
                                style={{ borderColor: INK_10 }}
                              >
                                Log system
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {shown < total ? (
                <div className="flex justify-center border-t px-5 py-5 sm:px-6" style={{ borderColor: INK_10 }}>
                  <button
                    type="button"
                    onClick={() => setVisibleCount((v) => v + PAGE_STEP)}
                    className="inline-flex items-center justify-center rounded-md border bg-white px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] transition-colors hover:border-[#0D1B3E]"
                    style={{ borderColor: INK_10 }}
                  >
                    Charger plus d&apos;entrées
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  )
}
