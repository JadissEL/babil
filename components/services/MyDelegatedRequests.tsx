'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileStack, Loader2 } from 'lucide-react'

import { formatPriceMad } from '@/lib/delegated-application-catalog'

type Item = {
  id: number
  category: string
  packageId: string
  status: string
  createdAt: string
  packageName?: string
  priceMad?: number
}

const STATUS_FR: Record<string, string> = {
  SUBMITTED: 'Soumise',
  IN_REVIEW: 'En analyse',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  CLOSED: 'Clôturée',
  REFUND_ELIGIBLE: 'Remboursement (éligible)',
}

function categoryFr(c: string) {
  return c === 'job' ? 'Emploi' : c === 'university' ? 'Université' : c
}

export function MyDelegatedRequests() {
  const [items, setItems] = useState<Item[] | null>(null)
  const [degraded, setDegraded] = useState(false)

  useEffect(() => {
    fetch('/api/delegated-application-requests')
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Erreur')
        return data
      })
      .then((data) => {
        setItems(Array.isArray(data.items) ? data.items : [])
        setDegraded(Boolean(data.degraded))
      })
      .catch(() => setItems([]))
  }, [])

  if (items === null) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-[2rem] border border-line bg-surface p-12 shadow-soft">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="font-bold text-muted">Chargement des demandes…</span>
      </div>
    )
  }

  return (
    <section id="assist-requests" className="rounded-[2rem] border border-line bg-surface p-6 shadow-soft md:p-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-rose-500/15 p-3 text-rose-500 ring-1 ring-rose-500/30">
            <FileStack className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-text">Mes demandes Assist candidatures</h2>
            <p className="text-sm font-medium text-muted">
              Historique soumis après connexion · statuts mis à jour par l&apos;équipe.
            </p>
          </div>
        </div>
        <Link
          href="/services/delegated-applications"
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-line bg-[#f8f2e8] px-4 py-2 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary-soft"
        >
          Nouvelle demande
        </Link>
      </div>

      {degraded ? (
        <p className="mb-4 text-xs font-bold text-warning">Mode dégradé : liste indisponible pour le moment.</p>
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-[#f8f2e8] p-8 text-center">
          <p className="font-bold text-text">Aucune demande encore.</p>
          <p className="mt-2 text-sm text-muted">Choisissez un forfait emploi ou université depuis le catalogue Assist.</p>
          <Link
            href="/services/delegated-applications"
            className="mt-4 inline-block text-xs font-black uppercase tracking-widest text-primary"
          >
            Ouvrir le catalogue
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-[#f8f2e8]">
                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted">Réf.</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted">Type</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted">Forfait</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted">Statut</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((r) => (
                <tr key={r.id} className="bg-surface hover:bg-primary-soft/30">
                  <td className="p-3 font-black text-text">#{r.id}</td>
                  <td className="p-3 font-medium text-muted">{categoryFr(r.category)}</td>
                  <td className="p-3">
                    <p className="font-bold text-text">{r.packageName ?? r.packageId}</p>
                    {typeof r.priceMad === 'number' ? (
                      <p className="text-xs font-bold text-primary">{formatPriceMad(r.priceMad)}</p>
                    ) : null}
                  </td>
                  <td className="p-3">
                    <span className="rounded-lg border border-line bg-[#f8f2e8] px-2 py-1 text-xs font-black text-text">
                      {STATUS_FR[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="p-3 text-xs font-medium text-muted">
                    {new Date(r.createdAt).toLocaleString('fr-FR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
