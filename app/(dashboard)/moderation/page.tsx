'use client'

import {
  CheckCircle2,
  Globe,
  Quote,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  XCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DashboardPageSkeleton } from '@/components/dashboard/DashboardPageSkeleton'

type ModerationComment = {
  id: number
  content: string
  status: string
  createdAt: string
  userId: string
  countryId: number
  user: { name: string | null; email: string | null } | null
  country: { name: string | null } | null
}

const SHELL = '#FAF7EE'
const INK_10 = 'rgba(13,27,62,0.10)'
const ROSE = '#DC2626'

function timeAgoShortFr(iso: string): string {
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return '—'
  const diffMs = Date.now() - then
  if (diffMs < 0) return "à l'instant"
  const sec = Math.floor(diffMs / 1000)
  if (sec < 60) return `Il y a ${sec}s`
  const min = Math.floor(sec / 60)
  if (min < 60) return `Il y a ${min}m`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `Il y a ${hr}h`
  const days = Math.floor(hr / 24)
  if (days < 7) return `Il y a ${days}j`
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function statusToneClasses(status: string): {
  dot: string
  text: string
  label: string
} {
  if (status === 'APPROVED') {
    return {
      dot: 'bg-emerald-600',
      text: 'text-emerald-700',
      label: 'Approuvé',
    }
  }
  if (status === 'REJECTED') {
    return { dot: 'bg-rose-600', text: 'text-rose-700', label: 'Refusé' }
  }
  return { dot: 'bg-amber-500', text: 'text-amber-700', label: status }
}

export default function ModerationPage() {
  const [comments, setComments] = useState<ModerationComment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  useEffect(() => {
    void fetchComments()
  }, [])

  async function fetchComments() {
    try {
      const res = await fetch('/api/comments')
      if (res.ok) {
        const data: unknown = await res.json()
        const arr = Array.isArray(data) ? (data as ModerationComment[]) : []
        setComments(arr)
        const firstPending = arr.find((c) => c.status === 'PENDING')
        setSelectedId(firstPending ? firstPending.id : null)
      } else if (res.status === 403) {
        setError('Accès réservé aux administrateurs.')
      } else {
        setError('Une erreur est survenue.')
      }
    } catch {
      setError('Impossible de charger les commentaires.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(id: number, action: 'APPROVED' | 'REJECTED' | 'DELETE') {
    try {
      if (action === 'DELETE') {
        const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
        if (res.ok) {
          setComments((prev) => prev.filter((c) => c.id !== id))
          if (selectedId === id) setSelectedId(null)
        }
        return
      }
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      })
      if (res.ok) {
        setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status: action } : c)))
        if (selectedId === id) {
          // advance to next pending
          const next = comments.find((c) => c.id !== id && c.status === 'PENDING')
          setSelectedId(next ? next.id : null)
        }
      }
    } catch {
      // Keep alert behavior for now — toast wiring is a follow-up.
      // eslint-disable-next-line no-alert
      alert("Erreur lors de l'action.")
    }
  }

  const pending = useMemo(() => comments.filter((c) => c.status === 'PENDING'), [comments])
  const history = useMemo(
    () => comments.filter((c) => c.status !== 'PENDING').slice(0, 10),
    [comments],
  )

  const selected = useMemo(
    () => pending.find((c) => c.id === selectedId) ?? pending[0] ?? null,
    [pending, selectedId],
  )

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: SHELL }}>
        <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-6 lg:px-8">
          <DashboardPageSkeleton variant="table" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: SHELL }}>
        <div className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-6">
          <ShieldAlert className="mx-auto mb-5 h-12 w-12 text-rose-600" aria-hidden />
          <h1 className="font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
            {error}
          </h1>
          <p className="mt-3 font-serif text-base font-medium text-[#0D1B3E]/65">
            Vous n&apos;avez pas les droits nécessaires pour accéder à cette page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: SHELL }}>
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
          <aside aria-label="File de modération">
            <header className="mb-3 flex items-center justify-between">
              <span
                className="inline-flex items-center rounded-md border bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.26em] text-[#0D1B3E]/65"
                style={{ borderColor: INK_10 }}
              >
                File d&apos;attente
              </span>
              <button
                type="button"
                onClick={() => {
                  setLoading(true)
                  setError('')
                  void fetchComments()
                }}
                aria-label="Actualiser la file"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[#0D1B3E]/55 transition-colors hover:text-[#0D1B3E]"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden />
              </button>
            </header>

            <p className="mb-3 inline-flex items-center gap-2 text-[14px] font-bold text-[#0D1B3E]">
              <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-rose-500" />
              {pending.length} {pending.length === 1 ? 'En attente' : 'En attente'}
            </p>

            {pending.length === 0 ? (
              <div
                className="rounded-xl border border-dashed bg-white/60 p-6 text-center"
                style={{ borderColor: INK_10 }}
              >
                <p className="font-serif text-sm font-medium italic text-[#0D1B3E]/55">
                  Aucun commentaire en attente.
                </p>
              </div>
            ) : (
              <ul className="space-y-2" role="listbox">
                {pending.map((c) => {
                  const isActive = selected?.id === c.id
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        role="option"
                        aria-current={isActive ? 'true' : undefined}
                        aria-selected={isActive}
                        onClick={() => setSelectedId(c.id)}
                        className={`w-full rounded-md border px-4 py-3 text-left transition-colors ${
                          isActive
                            ? 'border-l-[3px] border-l-rose-600 bg-white'
                            : 'bg-[#FAF7EE] hover:bg-white'
                        }`}
                        style={{
                          borderColor: isActive ? 'rgba(220,38,38,0.25)' : INK_10,
                          ...(isActive
                            ? { borderLeftColor: ROSE, borderLeftWidth: 3 }
                            : {}),
                        }}
                      >
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#0D1B3E]/65">
                            ID-{c.id}
                          </span>
                          <time
                            dateTime={c.createdAt}
                            className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#0D1B3E]/45"
                          >
                            {timeAgoShortFr(c.createdAt)}
                          </time>
                        </div>
                        <p className="mt-2 font-serif text-[15px] font-black leading-tight tracking-tight text-[#0D1B3E]">
                          {c.user?.name ?? 'Utilisateur anonyme'}
                        </p>
                        <p className="mt-0.5 font-serif text-[12px] font-medium text-[#0D1B3E]/55">
                          {c.country?.name ?? '—'}
                        </p>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </aside>

          <section aria-label="Examen du signalement" className="min-w-0">
            <header className="mb-6">
              <h1 className="font-serif text-3xl font-black leading-[1.05] tracking-tight text-[#0D1B3E] sm:text-4xl">
                Modération
              </h1>
              <p className="mt-2 font-serif text-[15px] font-medium leading-relaxed text-[#0D1B3E]/65">
                Examen des signalements du registre de risques.
              </p>
            </header>

            {selected ? (
              <article
                className="relative overflow-hidden rounded-xl border bg-white"
                style={{ borderColor: INK_10 }}
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[3px] bg-rose-600"
                />

                <div className="p-6 sm:p-8">
                  <header className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-[#FAF7EE] text-[#0D1B3E]"
                        style={{ borderColor: INK_10 }}
                      >
                        <User className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="font-serif text-[15px] font-black tracking-tight text-[#0D1B3E]">
                          {selected.user?.name ?? 'Utilisateur anonyme'}
                        </p>
                        <p className="break-all text-[11px] font-medium uppercase tracking-[0.18em] text-[#0D1B3E]/55">
                          {selected.user?.email ?? '—'}
                        </p>
                      </div>
                    </div>
                    <span
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border bg-[#FAF7EE] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/75"
                      style={{ borderColor: INK_10 }}
                    >
                      <Globe className="h-3 w-3" aria-hidden /> {selected.country?.name ?? '—'}
                    </span>
                  </header>

                  <p className="mt-6 text-[10px] font-black uppercase tracking-[0.28em] text-rose-700">
                    Contenu signalé — En attente
                  </p>

                  <div
                    className="mt-3 flex gap-4 rounded-md border p-5"
                    style={{ borderColor: INK_10, backgroundColor: '#FAF1E0' }}
                  >
                    <Quote className="h-6 w-6 shrink-0 text-[#0D1B3E]/35" aria-hidden />
                    <p className="font-serif text-[15px] font-medium leading-relaxed text-[#0D1B3E]/85">
                      &ldquo;{selected.content}&rdquo;
                    </p>
                  </div>

                  <hr className="my-6 border-[#0D1B3E]/8" />

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleAction(selected.id, 'REJECTED')}
                      className="inline-flex items-center justify-center gap-2 rounded-md border bg-white px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-rose-700 transition-colors hover:border-rose-600 hover:bg-rose-50"
                      style={{ borderColor: 'rgba(220,38,38,0.30)' }}
                    >
                      <XCircle className="h-4 w-4" aria-hidden /> Refuser
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction(selected.id, 'APPROVED')}
                      className="inline-flex items-center justify-center gap-2 rounded-md bg-[#0D1B3E] px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#1A2A52]"
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden /> Approuver
                    </button>
                  </div>
                </div>
              </article>
            ) : (
              <div
                className="rounded-xl border bg-white p-10 text-center"
                style={{ borderColor: INK_10 }}
              >
                <ShieldCheck
                  className="mx-auto mb-4 h-10 w-10 text-emerald-600"
                  aria-hidden
                />
                <p className="font-serif text-base font-black tracking-tight text-[#0D1B3E]">
                  File d&apos;attente vide.
                </p>
                <p className="mt-2 font-serif text-sm font-medium text-[#0D1B3E]/65">
                  Aucun commentaire en attente de modération à cet instant.
                </p>
              </div>
            )}

            <section aria-label="Historique récent" className="mt-10">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/55">
                Registre
              </p>
              <h2 className="mt-2 font-serif text-xl font-black tracking-tight text-[#0D1B3E] sm:text-2xl">
                Historique récent
              </h2>

              {history.length === 0 ? (
                <div
                  className="mt-5 rounded-xl border border-dashed bg-white/60 p-8 text-center"
                  style={{ borderColor: INK_10 }}
                >
                  <p className="font-serif text-sm font-medium italic text-[#0D1B3E]/55">
                    Aucune décision enregistrée pour le moment.
                  </p>
                </div>
              ) : (
                <div
                  className="mt-5 overflow-x-auto rounded-xl border bg-white"
                  style={{ borderColor: INK_10 }}
                >
                  <table className="w-full min-w-[680px] text-left text-sm">
                    <thead
                      className="border-b text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55"
                      style={{ borderColor: INK_10 }}
                    >
                      <tr>
                        <th className="px-5 py-3 font-black">Utilisateur</th>
                        <th className="px-5 py-3 font-black">Pays</th>
                        <th className="px-5 py-3 font-black">Extrait</th>
                        <th className="px-5 py-3 font-black">Statut</th>
                        <th className="px-5 py-3 text-right font-black">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((c) => {
                        const tone = statusToneClasses(c.status)
                        return (
                          <tr
                            key={c.id}
                            className="border-b last:border-0 transition-colors hover:bg-[#FAF7EE]/60"
                            style={{ borderColor: INK_10 }}
                          >
                            <td className="px-5 py-4">
                              <p className="font-medium text-[#0D1B3E]">
                                {c.user?.name ?? '—'}
                              </p>
                              <p className="break-all text-[10px] font-medium text-[#0D1B3E]/45">
                                {c.user?.email ?? '—'}
                              </p>
                            </td>
                            <td className="px-5 py-4 font-serif text-[13px] font-medium text-[#0D1B3E]/75">
                              {c.country?.name ?? '—'}
                            </td>
                            <td className="max-w-[260px] px-5 py-4">
                              <span className="line-clamp-2 break-words font-serif text-[13px] font-medium text-[#0D1B3E]/70">
                                &ldquo;{c.content}&rdquo;
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] ${tone.text}`}
                              >
                                <span
                                  aria-hidden
                                  className={`inline-block h-1.5 w-1.5 rounded-full ${tone.dot}`}
                                />
                                {tone.label}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleAction(c.id, 'DELETE')}
                                aria-label={`Supprimer le commentaire ID-${c.id}`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#0D1B3E]/45 transition-colors hover:bg-rose-50 hover:text-rose-700"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </section>
        </div>
      </div>
    </div>
  )
}
