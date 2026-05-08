'use client'

import React, { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Car, MapPin, Search, ShieldAlert, X } from 'lucide-react'
import Link from 'next/link'

import GoogleAd from '@/components/GoogleAd'
import { DrivingRightsIntelSection, VisualBadge } from '@/components/driving/DrivingRightsIntelSection'
import { normalizeCountriesApiListResponse } from '@/lib/country-full-data-materialize'
import type { ResidencyDrivingCategory } from '@/lib/driving-rights-intel'
import {
  deriveDrivingRightsVisual,
  materializeDrivingRightsIntel,
  residencyCategoryMatchesFilter,
  visualLabelFr,
} from '@/lib/driving-rights-intel'

const RESIDENCY_OPTIONS: Array<{ id: ResidencyDrivingCategory | 'all'; label: string }> = [
  { id: 'all', label: 'Tous les profils' },
  { id: 'tourist', label: 'Tourisme' },
  { id: 'student', label: 'Étudiant' },
  { id: 'worker', label: 'Travail / salarié' },
  { id: 'temporary_resident', label: 'Résidence temporaire' },
  { id: 'permanent_resident', label: 'Résidence permanente' },
  { id: 'refugee_asylum', label: 'Protection internationale' },
]

function PermisPageInner() {
  const searchParams = useSearchParams()
  const [countries, setCountries] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [residency, setResidency] = useState<ResidencyDrivingCategory | 'all'>('all')

  const compareIds = useMemo(() => {
    const raw = searchParams?.get('compare')
    if (!raw) return [] as number[]
    return raw
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isFinite(n) && n > 0)
      .slice(0, 4)
  }, [searchParams])

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => setCountries(normalizeCountriesApiListResponse(data)))
      .catch(() => setCountries([]))
      .finally(() => setLoading(false))
  }, [])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return countries
      .map((c) => {
        const full = (c.full_data ?? {}) as Record<string, unknown>
        const intel = materializeDrivingRightsIntel(full)
        return { c, intel }
      })
      .filter(({ c, intel }) => {
        const name = String(c.name ?? '').toLowerCase()
        if (q && !name.includes(q)) return false
        if (residency === 'all') return true
        return intel.residencyRules.some((r) => residencyCategoryMatchesFilter(r, residency))
      })
  }, [countries, query, residency])

  const compareRows = useMemo(() => {
    if (compareIds.length === 0) return []
    const byId = new Map(countries.map((c) => [Number(c.id), c]))
    return compareIds.map((id) => {
      const c = byId.get(id)
      if (!c) return null
      const intel = materializeDrivingRightsIntel((c.full_data ?? {}) as Record<string, unknown>)
      return { c, intel }
    }).filter(Boolean) as Array<{ c: Record<string, unknown>; intel: ReturnType<typeof materializeDrivingRightsIntel> }>
  }, [countries, compareIds])

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 pb-20 sm:px-8">
      <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-[2rem] bg-primary p-4 text-white shadow-soft">
            <Car className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-text md:text-4xl">Permis de conduire</h1>
            <p className="mt-1 max-w-2xl font-medium text-muted">
              Intelligence droits de conduire pour titulaires d&apos;un{' '}
              <span className="font-black text-text">permis marocain</span> : éligibilité, IDP, durées par statut,
              conversion, assurance et location. Les fiches sont structurées (schéma v1) et prêtes pour des sources
              officielles.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-bold text-amber-950">
        <div className="flex gap-2">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Avertissement : la réglementation évolue. Utilisez ces fiches comme guide structuré, pas comme avis juridique.
            Vérifiez toujours le ministère des transports, la préfecture ou l&apos;ambassade du pays concerné.
          </p>
        </div>
      </div>

      <div className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-line bg-surface p-5 shadow-card md:flex-row md:flex-wrap md:items-end">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-muted">Recherche pays</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="France, Canada, Turquie…"
              className="w-full rounded-2xl border border-line bg-inset py-3 pl-10 pr-4 text-sm font-bold text-text outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
        <div className="min-w-[220px]">
          <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-muted">
            Filtrer par statut (résidence)
          </label>
          <select
            value={residency}
            onChange={(e) => setResidency(e.target.value as ResidencyDrivingCategory | 'all')}
            className="w-full rounded-2xl border border-line bg-inset px-4 py-3 text-sm font-black text-text outline-none focus:ring-2 focus:ring-primary/40"
          >
            {RESIDENCY_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {compareIds.length > 0 ? (
          <Link
            href="/permis"
            className="inline-flex items-center gap-2 rounded-2xl border border-line bg-inset px-4 py-3 text-xs font-black uppercase tracking-widest text-muted hover:border-primary/40"
          >
            <X className="h-4 w-4" /> Quitter la comparaison
          </Link>
        ) : null}
      </div>

      <GoogleAd slot="permis_top" />

      {compareRows.length > 0 ? (
        <div className="mb-12 overflow-x-auto rounded-[2rem] border border-line bg-surface shadow-card">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-inset">
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">Pays</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">Synthèse</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">Permis MA</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">IDP</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">Conversion</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-muted">Fiabilité</th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map(({ c, intel }) => {
                const v = deriveDrivingRightsVisual(intel)
                return (
                  <tr key={String(c.id)} className="border-b border-line last:border-0">
                    <td className="p-4 font-black text-text">{String(c.name)}</td>
                    <td className="p-4 font-bold text-muted">{visualLabelFr(v)}</td>
                    <td className="p-4 font-bold text-text">
                      {intel.eligibility.moroccanLicenseRecognized === true
                        ? 'Oui'
                        : intel.eligibility.moroccanLicenseRecognized === false
                          ? 'Non'
                          : 'À confirmer'}
                    </td>
                    <td className="p-4 font-bold text-text">
                      {intel.eligibility.idpRequired === true
                        ? 'Requis / attendu'
                        : intel.eligibility.idpRequired === false
                          ? 'Non indiqué'
                          : 'À confirmer'}
                    </td>
                    <td className="p-4 font-bold text-text">
                      {intel.conversion.possible === true
                        ? 'Possible'
                        : intel.conversion.possible === false
                          ? 'Non indiquée'
                          : 'Inconnu'}
                    </td>
                    <td className="p-4 text-xs font-black uppercase text-muted">{intel.meta.dataCertainty}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="border-t border-line p-4 text-xs font-medium text-muted">
            Comparaison rapide — ouvrez la fiche pays pour le détail juridique (durées, étapes, sources).
          </div>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : (
        <div className="mt-8 grid auto-rows-fr grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ c, intel }) => (
            <div
              key={String(c.id)}
              className="flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-line bg-surface shadow-card transition-all duration-300 hover:border-primary/30"
            >
              <div className="border-b border-line p-8">
                <div className="mb-4 flex min-w-0 items-start justify-between gap-3">
                  <h3 className="min-w-0 break-words text-2xl font-black text-text">{String(c.name)}</h3>
                  <div className="shrink-0">
                    <VisualBadge intel={intel} />
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted">
                  Fiabilité données : {intel.meta.dataCertainty}
                </p>
              </div>

              <DrivingRightsIntelSection
                countryName={String(c.name)}
                countryId={c.id as string | number}
                intel={intel}
                variant="compact"
              />

              <div className="mt-auto flex shrink-0 flex-wrap gap-2 border-t border-line bg-inset p-4">
                <Link
                  href={`/countries/${c.id}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-line bg-surface py-3 text-xs font-black text-text transition-colors hover:border-primary/40 hover:bg-primary-soft"
                >
                  Fiche pays <MapPin className="h-4 w-4" />
                </Link>
                <Link
                  href={`/permis?compare=${Array.from(new Set([...compareIds, Number(c.id)])).join(',')}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary-soft py-3 text-xs font-black text-primary transition-colors hover:border-primary/50"
                >
                  Comparer
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && rows.length === 0 ? (
        <p className="py-16 text-center font-bold text-muted">Aucun pays ne correspond à ce filtre.</p>
      ) : null}

      <div className="mt-20">
        <GoogleAd slot="permis_bottom" />
      </div>
    </div>
  )
}

export default function PermisPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      }
    >
      <PermisPageInner />
    </Suspense>
  )
}
