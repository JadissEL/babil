'use client'

import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  User, 
  Globe, 
  Clock,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react'

import { DashboardPageSkeleton } from '@/components/dashboard/DashboardPageSkeleton'

export default function ModerationPage() {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      const res = await fetch('/api/comments')
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      } else if (res.status === 403) {
        setError('Accès réservé aux administrateurs.')
      } else {
        setError('Une erreur est survenue.')
      }
    } catch (err) {
      setError('Impossible de charger les commentaires.')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: number, action: 'APPROVED' | 'REJECTED' | 'DELETE') => {
    try {
      if (action === 'DELETE') {
        const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
        if (res.ok) {
          setComments(prev => prev.filter(c => c.id !== id))
        }
      } else {
        const res = await fetch(`/api/comments/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: action })
        })
        if (res.ok) {
          setComments(prev => prev.map(c => c.id === id ? { ...c, status: action } : c))
        }
      }
    } catch (err) {
      alert('Erreur lors de l\'action.')
    }
  }

  if (loading) return <DashboardPageSkeleton variant="table" />
  if (error)
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:p-20">
        <ShieldAlert className="mx-auto mb-4 h-16 w-16 text-danger" />
        <h1 className="text-2xl font-black text-text">{error}</h1>
        <p className="mt-2 text-muted">Vous n&apos;avez pas les droits nécessaires pour accéder à cette page.</p>
      </div>
    )

  const pending = comments.filter(c => c.status === 'PENDING')
  const history = comments.filter(c => c.status !== 'PENDING')

  return (
    <div className="mx-auto max-w-6xl pb-16 pt-0 sm:pb-20 sm:pt-2">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex flex-wrap items-center gap-3 text-2xl font-black text-text sm:gap-4 sm:text-3xl lg:text-4xl">
              <MessageSquare className="h-8 w-8 shrink-0 text-primary sm:h-10 sm:w-10" /> Modération
            </h1>
            <p className="mt-2 text-sm font-medium text-muted sm:text-base">
              Valider ou refuser les retours utilisateurs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              setError('')
              void fetchComments()
            }}
            className="inline-flex items-center justify-center gap-2 self-start rounded-2xl border-2 border-line bg-surface px-4 py-2.5 text-sm font-black text-text shadow-soft transition-colors hover:border-primary/30 sm:self-auto"
          >
            <RefreshCw className="h-4 w-4 shrink-0" aria-hidden />
            Actualiser
          </button>
        </div>

      <section className="mb-12 sm:mb-16">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-text sm:mb-6 sm:text-xl">
          <Clock className="h-5 w-5 shrink-0 text-warning" /> En attente ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-line bg-[#f8f2e8] p-8 text-center sm:rounded-[2rem] sm:p-12">
            <p className="font-bold italic text-muted">Aucun commentaire en attente.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {pending.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-line bg-surface p-5 shadow-soft transition-shadow hover:border-primary/20 sm:rounded-[2rem] sm:p-8"
              >
                <div className="mb-4 flex flex-col justify-between gap-4 sm:mb-6 sm:flex-row sm:items-start">
                  <div className="flex min-w-0 gap-3 sm:gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary ring-1 ring-primary/35 sm:h-12 sm:w-12">
                      <User className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-black text-text">{c.user.name || 'Utilisateur anonyme'}</h3>
                      <p className="break-all text-xs font-bold text-muted">{c.user.email}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-sm font-bold text-muted">
                    <Globe className="h-4 w-4 shrink-0" /> {c.country.name}
                  </div>
                </div>

                <p className="mb-6 break-words rounded-2xl border border-line bg-[#f8f2e8] p-4 font-medium leading-relaxed text-muted sm:mb-8 sm:p-6">
                  &quot;{c.content}&quot;
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <button
                    type="button"
                    onClick={() => handleAction(c.id, 'APPROVED')}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 font-black text-white transition-colors hover:bg-emerald-500 sm:py-4"
                  >
                    <CheckCircle className="h-5 w-5 shrink-0" /> Approuver
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(c.id, 'REJECTED')}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-500/35 bg-red-500/15 py-3.5 font-black text-danger transition-colors hover:bg-red-500/25 sm:py-4"
                  >
                    <XCircle className="h-5 w-5 shrink-0" /> Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-text sm:mb-6 sm:text-xl">
          <CheckCircle className="h-5 w-5 shrink-0 text-success" /> Historique récent
        </h2>

        <ul className="mb-6 space-y-3 md:hidden">
          {history.slice(0, 10).map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-line bg-surface p-4 shadow-soft"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text">{c.user.name}</p>
                  <p className="break-all text-[10px] text-muted">{c.user.email}</p>
                </div>
                <span
                  className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-black uppercase ${
                    c.status === 'APPROVED' ? 'bg-[#e9f9f1] text-success' : 'bg-[#fff0f0] text-danger'
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <p className="mt-2 text-xs font-bold text-muted">{c.country.name}</p>
              <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted">{c.content}</p>
              <button
                type="button"
                onClick={() => handleAction(c.id, 'DELETE')}
                className="mt-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-danger hover:text-red-700"
              >
                <XCircle className="h-4 w-4" /> Supprimer
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface shadow-soft md:block md:rounded-[2rem]">
          <table className="min-w-[640px] w-full text-left">
            <thead>
              <tr className="border-b border-line bg-[#f8f2e8]">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">
                  Utilisateur
                </th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">Pays</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">Contenu</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">Statut</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {history.slice(0, 10).map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-[#f8f2e8]">
                  <td className="p-4">
                    <div className="text-sm font-bold text-text">{c.user.name}</div>
                    <div className="text-[10px] text-muted">{c.user.email}</div>
                  </td>
                  <td className="p-4 text-sm font-bold text-muted">{c.country.name}</td>
                  <td className="max-w-xs p-4 text-sm text-muted">
                    <span className="line-clamp-2 break-words">{c.content}</span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${
                        c.status === 'APPROVED'
                          ? 'bg-[#e9f9f1] text-success'
                          : 'bg-[#fff0f0] text-danger'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleAction(c.id, 'DELETE')}
                      className="text-red-400 transition-colors hover:text-red-300"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
