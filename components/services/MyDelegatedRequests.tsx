'use client'

import { Fragment, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, FileStack, Loader2, RefreshCw } from 'lucide-react'

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

function PayloadReadback({ payload }: { payload: Record<string, unknown> }) {
  const contact =
    payload.contact && typeof payload.contact === 'object' && payload.contact !== null && !Array.isArray(payload.contact)
      ? (payload.contact as Record<string, unknown>)
      : null
  const job =
    payload.job && typeof payload.job === 'object' && payload.job !== null && !Array.isArray(payload.job)
      ? (payload.job as Record<string, unknown>)
      : null
  const university =
    payload.university &&
    typeof payload.university === 'object' &&
    payload.university !== null &&
    !Array.isArray(payload.university)
      ? (payload.university as Record<string, unknown>)
      : null
  const snap =
    payload.packageSnapshot &&
    typeof payload.packageSnapshot === 'object' &&
    payload.packageSnapshot !== null &&
    !Array.isArray(payload.packageSnapshot)
      ? (payload.packageSnapshot as Record<string, unknown>)
      : null

  const line = (label: string, v: unknown) =>
    v != null && String(v).trim() ? (
      <p>
        <span className="font-black text-text">{label} : </span>
        <span className="whitespace-pre-wrap text-muted">{String(v)}</span>
      </p>
    ) : null

  return (
    <div className="space-y-4 text-xs font-medium">
      {snap ? (
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted">Forfait (au moment de l’envoi)</p>
          {line('Libellé', snap.name)}
          {line('Identifiant', snap.id)}
          {typeof snap.priceMad === 'number' ? line('Prix (MAD)', String(snap.priceMad)) : null}
        </div>
      ) : null}
      {contact ? (
        <div className="space-y-1 border-t border-line pt-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted">Contact déclaré</p>
          {line('Nom', contact.fullName)}
          {line('E-mail', contact.email)}
          {line('Téléphone', contact.phone)}
          {line('Langue', contact.preferredLanguage)}
        </div>
      ) : null}
      {job ? (
        <div className="space-y-1 border-t border-line pt-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted">Projet emploi</p>
          {line('Rôles / postes visés', job.targetRoles)}
          {line('Pays ou zones cibles', job.targetCountries)}
          {line('Expérience résumée', job.experienceSummary)}
          {line('Notes CV', job.cvNotes)}
          {line('Angles de motivation', job.motivationAngles)}
          {line('LinkedIn', job.linkedInUrl)}
          {line('Urgence / contraintes', job.urgency)}
          {line('Précisions', job.additionalNotes)}
        </div>
      ) : null}
      {university ? (
        <div className="space-y-1 border-t border-line pt-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-muted">Projet université</p>
          {line('Niveau visé', university.programLevel)}
          {line('Domaine / filière', university.fieldOfStudy)}
          {line('Pays ou régions', university.targetCountries)}
          {line('Écoles ou programmes prioritaires', university.institutionsWishlist)}
          {line('Parcours & notes', university.academicsSummary)}
          {line('Scores langue', university.languageScores)}
          {line('Thèmes lettres', university.motivationThemes)}
          {line('Documents', university.documentsReady)}
          {line('Précisions', university.additionalNotes)}
        </div>
      ) : null}
    </div>
  )
}

export function MyDelegatedRequests() {
  const [items, setItems] = useState<Item[] | null>(null)
  const [degraded, setDegraded] = useState(false)
  const [openId, setOpenId] = useState<number | null>(null)
  const [detailPayload, setDetailPayload] = useState<Record<string, unknown> | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const loadList = useCallback(async () => {
    try {
      const res = await fetch('/api/delegated-application-requests')
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erreur')
      setItems(Array.isArray(data.items) ? data.items : [])
      setDegraded(Boolean(data.degraded))
    } catch {
      setItems([])
    }
  }, [])

  useEffect(() => {
    void loadList()
  }, [loadList])

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'visible') void loadList()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [loadList])

  async function toggleDetail(requestId: number) {
    if (openId === requestId) {
      setOpenId(null)
      setDetailPayload(null)
      setDetailError(null)
      return
    }
    setOpenId(requestId)
    setDetailLoading(true)
    setDetailError(null)
    setDetailPayload(null)
    try {
      const res = await fetch(`/api/delegated-application-requests/${requestId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erreur')
      const p = data?.payload
      setDetailPayload(
        typeof p === 'object' && p !== null && !Array.isArray(p) ? (p as Record<string, unknown>) : {},
      )
    } catch (e) {
      setDetailError(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setDetailLoading(false)
    }
  }

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
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadList()}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-[#f8f2e8] px-4 py-2 text-xs font-black uppercase tracking-widest text-muted hover:bg-primary-soft hover:text-primary"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Rafraîchir
          </button>
          <Link
            href="/services/delegated-applications"
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-line bg-[#f8f2e8] px-4 py-2 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary-soft"
          >
            Nouvelle demande
          </Link>
        </div>
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
        <>
          <ul className="space-y-3 md:hidden">
            {items.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl border border-line bg-surface p-4 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted">Réf. #{r.id}</p>
                    <p className="mt-1 font-black text-text">{r.packageName ?? r.packageId}</p>
                    {typeof r.priceMad === 'number' ? (
                      <p className="mt-1 text-xs font-bold text-primary">{formatPriceMad(r.priceMad)}</p>
                    ) : null}
                  </div>
                  <span className="rounded-lg border border-line bg-[#f8f2e8] px-2 py-1 text-[10px] font-black">
                    {STATUS_FR[r.status] ?? r.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-muted">
                  <span>{categoryFr(r.category)}</span>
                  <span aria-hidden>·</span>
                  <time dateTime={r.createdAt}>
                    {new Date(r.createdAt).toLocaleString('fr-FR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </time>
                </div>
                <button
                  type="button"
                  onClick={() => void toggleDetail(r.id)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-[#f8f2e8] py-2.5 text-[10px] font-black uppercase tracking-wider text-primary hover:bg-primary-soft"
                >
                  {openId === r.id ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  {openId === r.id ? 'Fermer le détail' : 'Voir le formulaire envoyé'}
                </button>
                {openId === r.id ? (
                  <div className="mt-4 border-t border-line pt-4">
                    {detailLoading ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-muted">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" /> Chargement du formulaire envoyé…
                      </div>
                    ) : detailError ? (
                      <p className="text-xs font-bold text-danger">{detailError}</p>
                    ) : detailPayload ? (
                      <PayloadReadback payload={detailPayload} />
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto rounded-2xl border border-line md:block">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-[#f8f2e8]">
                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted">Réf.</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted">Type</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted">Forfait</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted">Statut</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted">Date</th>
                <th className="p-3 text-[10px] font-black uppercase tracking-widest text-muted">Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((r) => (
                <Fragment key={r.id}>
                  <tr className="bg-surface hover:bg-primary-soft/30">
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
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => void toggleDetail(r.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-line bg-[#f8f2e8] px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-primary hover:bg-primary-soft"
                      >
                        {openId === r.id ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        {openId === r.id ? 'Fermer' : 'Voir'}
                      </button>
                    </td>
                  </tr>
                  {openId === r.id ? (
                    <tr className="bg-[#f8f2e8]/90">
                      <td colSpan={6} className="p-4">
                        {detailLoading ? (
                          <div className="flex items-center gap-2 text-xs font-bold text-muted">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" /> Chargement du formulaire envoyé…
                          </div>
                        ) : detailError ? (
                          <p className="text-xs font-bold text-danger">{detailError}</p>
                        ) : detailPayload ? (
                          <PayloadReadback payload={detailPayload} />
                        ) : null}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}
    </section>
  )
}
