'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  User, 
  Globe, 
  Clock,
  ShieldAlert
} from 'lucide-react'

export default function ModerationPage() {
  const { user: clerkUser } = useUser()
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

  if (loading)
    return (
      <div className="p-20 text-center font-bold text-slate-400">
        Chargement…
      </div>
    )
  if (error)
    return (
      <div className="mx-auto max-w-4xl p-20 text-center">
        <ShieldAlert className="mx-auto mb-4 h-16 w-16 text-red-400" />
        <h1 className="text-2xl font-black text-white">{error}</h1>
        <p className="mt-2 text-slate-400">Vous n&apos;avez pas les droits nécessaires pour accéder à cette page.</p>
      </div>
    )

  const pending = comments.filter(c => c.status === 'PENDING')
  const history = comments.filter(c => c.status !== 'PENDING')

  return (
    <div className="mx-auto max-w-6xl pb-20 pt-2">
      <div className="mb-10">
        <h1 className="flex items-center gap-4 text-4xl font-black text-white">
          <MessageSquare className="h-10 w-10 text-blue-400" /> Modération
        </h1>
        <p className="mt-2 font-medium text-slate-400">Valider ou refuser les retours utilisateurs.</p>
      </div>

      <section className="mb-16">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-white">
          <Clock className="h-5 w-5 text-orange-400" /> En attente ({pending.length})
        </h2>

        {pending.length === 0 ? (
          <div className="rounded-[2rem] border-2 border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
            <p className="font-bold italic text-slate-500">Aucun commentaire en attente.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {pending.map((c) => (
              <div
                key={c.id}
                className="rounded-[2rem] border border-white/10 bg-[#111827] p-8 shadow-lg shadow-black/15 transition-shadow hover:border-white/20"
              >
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/35">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-white">{c.user.name || 'Utilisateur anonyme'}</h3>
                      <p className="text-xs font-bold text-slate-500">{c.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <Globe className="h-4 w-4" /> {c.country.name}
                  </div>
                </div>

                <p className="mb-8 rounded-2xl border border-white/10 bg-[#0B0F19] p-6 font-medium leading-relaxed text-slate-300">
                  &quot;{c.content}&quot;
                </p>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleAction(c.id, 'APPROVED')}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 font-black text-white transition-colors hover:bg-emerald-500"
                  >
                    <CheckCircle className="h-5 w-5" /> Approuver
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(c.id, 'REJECTED')}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-500/35 bg-red-500/15 py-4 font-black text-red-200 transition-colors hover:bg-red-500/25"
                  >
                    <XCircle className="h-5 w-5" /> Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-6 flex items-center gap-2 text-xl font-black text-white">
          <CheckCircle className="h-5 w-5 text-emerald-400" /> Historique récent
        </h2>
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Utilisateur
                </th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Pays</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Contenu</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Statut</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {history.slice(0, 10).map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="p-4">
                    <div className="text-sm font-bold text-white">{c.user.name}</div>
                    <div className="text-[10px] text-slate-500">{c.user.email}</div>
                  </td>
                  <td className="p-4 text-sm font-bold text-slate-300">{c.country.name}</td>
                  <td className="max-w-xs truncate p-4 text-sm text-slate-500">{c.content}</td>
                  <td className="p-4">
                    <span
                      className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${
                        c.status === 'APPROVED'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-red-500/15 text-red-300'
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
