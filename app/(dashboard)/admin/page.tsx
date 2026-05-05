'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle, Database, MessageSquare, ShieldAlert, XCircle } from 'lucide-react'
import Link from 'next/link'

import { CountryEditor, type CountryEditorModel } from '@/components/admin/CountryEditor'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type Tab = 'comments' | 'countries'

type PendingComment = {
  id: number
  content: string
  status: string
  user: { name: string | null; email: string | null }
  country: { name: string }
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('comments')
  const [forbidden, setForbidden] = useState(false)
  const [pending, setPending] = useState<PendingComment[]>([])
  const [countries, setCountries] = useState<CountryEditorModel[]>([])
  const [loading, setLoading] = useState(true)

  const loadCountries = useCallback(async () => {
    const res = await fetch('/api/countries')
    if (!res.ok) return
    const data = (await res.json()) as Record<string, unknown>[]
    if (!Array.isArray(data)) return
    setCountries(
      data.map((c) => ({
        id: c.id as number,
        name: String(c.name),
        tourist_visa_score: c.tourist_visa_score as number | null,
        study_visa_score: c.study_visa_score as number | null,
        work_visa_score: c.work_visa_score as number | null,
        business_visa_score: c.business_visa_score as number | null,
        appointment_difficulty: c.appointment_difficulty as string | null,
      })),
    )
  }, [])

  useEffect(() => {
    const boot = async () => {
      setLoading(true)
      const res = await fetch('/api/comments?status=PENDING')
      if (res.status === 403 || res.status === 401) {
        setForbidden(true)
        setLoading(false)
        return
      }
      if (res.ok) {
        const data = (await res.json()) as PendingComment[]
        setPending(Array.isArray(data) ? data.filter((c) => c.status === 'PENDING') : [])
      }
      await loadCountries()
      setLoading(false)
    }
    void boot()
  }, [loadCountries])

  const approve = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    const res = await fetch(`/api/comments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) setPending((prev) => prev.filter((c) => c.id !== id))
  }

  if (loading) {
    return (
      <div className="flex justify-center p-20 text-slate-400">
        <p className="font-bold">Chargement…</p>
      </div>
    )
  }

  if (forbidden) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <ShieldAlert className="mx-auto mb-4 h-14 w-14 text-red-400" />
        <h1 className="text-2xl font-black text-white">Accès admin refusé</h1>
        <p className="mt-2 text-slate-400">Cette zone est réservée aux comptes avec rôle ADMIN.</p>
        <Link href="/overview" className="mt-6 inline-block text-sm font-bold text-blue-400 hover:text-blue-300">
          Retour à l&apos;aperçu
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-24">
      <div>
        <h1 className="text-3xl font-black text-white">Administration</h1>
        <p className="mt-1 text-sm text-slate-400">Modération rapide et édition des scores pays (MVP).</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={tab === 'comments' ? 'default' : 'outline'} type="button" onClick={() => setTab('comments')}>
          <MessageSquare className="h-4 w-4" /> Commentaires
        </Button>
        <Button variant={tab === 'countries' ? 'default' : 'outline'} type="button" onClick={() => setTab('countries')}>
          <Database className="h-4 w-4" /> Données pays
        </Button>
        <Link href="/moderation" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-bold text-slate-300 hover:bg-white/5">
          Vue modération complète
        </Link>
      </div>

      {tab === 'comments' && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">File d&apos;attente ({pending.length})</h2>
          {pending.length === 0 ? (
            <Card className="border-dashed border-white/20 bg-[#111827]/60">
              <CardContent className="p-10 text-center text-slate-500">Aucun commentaire PENDING.</CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pending.map((c) => (
                <Card key={c.id} className="border-gray-800 bg-[#111827]">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-wrap justify-between gap-2 text-sm text-slate-400">
                      <span className="font-bold text-white">{c.user.name || 'Anonyme'}</span>
                      <span>{c.country.name}</span>
                    </div>
                    <p className="rounded-xl border border-white/10 bg-[#0B0F19] p-4 text-slate-300">&quot;{c.content}&quot;</p>
                    <div className="flex gap-3">
                      <Button type="button" className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-500" onClick={() => void approve(c.id, 'APPROVED')}>
                        <CheckCircle className="h-4 w-4" /> Approuver
                      </Button>
                      <Button type="button" variant="destructive" className="flex-1 gap-2" onClick={() => void approve(c.id, 'REJECTED')}>
                        <XCircle className="h-4 w-4" /> Refuser
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === 'countries' && (
        <section className="grid gap-4 md:grid-cols-2">
          {countries.map((c) => (
            <CountryEditor key={c.id} country={c} />
          ))}
        </section>
      )}
    </div>
  )
}
