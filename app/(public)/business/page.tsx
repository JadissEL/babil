'use client'

import {
  Briefcase,
  TrendingUp,
  Building2,
  Coins,
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Search,
  Store,
  Globe,
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import GoogleAd from '@/components/GoogleAd'
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider'
import {
  normalizeCountriesApiListResponse,
  type CountryApiListRow,
} from '@/lib/country-full-data-materialize'
import { businessHubExplorerHref } from '@/lib/cta-hrefs'
import { enrichCountryApiRecord } from '@/lib/enrich-country-api'

export default function BusinessPage() {
  const { preference } = useObjectivePreference()
  const hubExplorerHref = useMemo(
    () => businessHubExplorerHref(preference.primarySlug),
    [preference.primarySlug],
  )
  const [countries, setCountries] = useState<CountryApiListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => setCountries(normalizeCountriesApiListResponse(data)))
      .catch(() => setCountries([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = countries.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 pb-12 sm:px-8">
      <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-[2rem] bg-success p-4 text-white shadow-soft">
            <Briefcase className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-text md:text-4xl">Business & investissement</h1>
            <p className="mt-1 font-medium text-muted">
              Entrepreneuriat et opportunités pour citoyens marocains.
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Chercher un pays..."
            className="w-full rounded-2xl border border-line bg-surface py-4 pl-12 pr-4 font-medium text-text outline-none placeholder:text-muted transition-all focus:ring-2 focus:ring-success/40"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Link
        href={hubExplorerHref}
        className="group mb-10 flex flex-col gap-4 rounded-[2rem] border border-success/25 bg-surface p-6 shadow-card transition-all hover:border-success/40 hover:shadow-soft sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-success/15 text-success ring-1 ring-success/30">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Explorer</p>
            <p className="mt-1 text-lg font-black text-text">Filtrer les pays pour visa affaires et investissement</p>
            <p className="mt-2 text-sm font-medium text-muted">
              Ouvrez l&apos;explorateur avec le filtre mobilité économique (visa affaires, scores, CBI quand disponible). Le lien
              s&apos;aligne sur votre objectif principal lorsqu&apos;il est déjà orienté business dans le registre.
            </p>
          </div>
        </div>
        <ArrowRight
          className="h-6 w-6 shrink-0 text-success transition-transform group-hover:translate-x-1 sm:ml-4"
          aria-hidden
        />
      </Link>

      <GoogleAd slot="business_top" />

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-success" />
        </div>
      ) : (
        <div className="grid auto-rows-fr grid-cols-1 gap-8 lg:grid-cols-2">
          {filtered.map((c) => {
            const enriched = enrichCountryApiRecord(c)
            const full = c.full_data as Record<string, unknown>
            const visaSystem = full.visa_system as Record<string, unknown> | undefined
            const biz = (visaSystem?.business as Record<string, unknown> | undefined) ?? {}
            const street = (full.street_food as Record<string, unknown> | undefined) ?? {}
            const cbi = full.cbi_program as Record<string, unknown> | undefined

            return (
              <div
                key={String(c.id)}
                className="flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-line bg-surface shadow-card transition-all duration-500 hover:border-success/30"
              >
                <div className="flex min-w-0 items-start justify-between gap-4 border-b border-line bg-inset p-8">
                  <div className="min-w-0">
                    <h3 className="mb-1 break-words text-3xl font-black text-text">{c.name}</h3>
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-success">
                      <TrendingUp className="h-4 w-4" /> Mobilité économique
                    </div>
                  </div>
                  <div className="shrink-0 rounded-2xl border border-line bg-surface px-4 py-2 text-center">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted">Indice affaires</div>
                    <div className="text-xl font-black text-text" title="0–100 — même modèle que l’Explorer / Comparer">
                      {Number.isInteger(enriched._visa.business)
                        ? enriched._visa.business
                        : enriched._visa.business.toFixed(1)}
                    </div>
                    <div className="text-[9px] font-bold text-muted">/ 100</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
                  <div className="space-y-6">
                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted">
                      <Building2 className="h-4 w-4 text-primary" /> Création d&apos;entreprise
                    </h4>
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-line bg-inset p-4">
                        <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">
                          Droit d&apos;investir
                        </div>
                        <p className="break-words text-sm font-bold text-text">
                          {String(biz.rights ?? 'Information non disponible')}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-line bg-inset p-4">
                        <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">Mise en place</div>
                        <p className="break-words text-sm font-bold text-text">
                          {String(biz.setup ?? 'Information non disponible')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted">
                      <Store className="h-4 w-4 text-accent" /> Micro-activité & food
                    </h4>
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-accent/25 bg-accent-soft p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                            Opportunité
                          </span>
                          <span className="text-xs font-black text-text">{String(street.opportunity ?? 'N/D')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-muted">
                          <Coins className="h-3 w-3" /> Invest. min : {String(street.investment_min ?? 'Variable')}
                        </div>
                      </div>
                      <p className="break-words text-xs font-medium italic leading-relaxed text-muted">
                        &quot;{String(street.barriers ?? 'Conditions locales standard.')}&quot;
                      </p>
                    </div>
                  </div>
                </div>

                {/* CBI Program if exists */}
                {cbi && (
                  <div className="px-8 pb-8">
                    <div className="group relative overflow-hidden rounded-3xl border border-success/25 bg-[#e9f9f1] p-6 text-text">
                      <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-success blur-3xl opacity-15 transition-opacity group-hover:opacity-25"></div>
                      <div className="relative">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-success">
                            <ShieldCheck className="w-4 h-4" /> Nationalité par investissement (CBI)
                          </h4>
                          <span className="rounded-lg bg-success px-2 py-1 text-[10px] font-black text-white">ACTIF</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">Investissement Min.</div>
                            <div className="text-sm font-black text-text">{String(cbi.cost_min ?? '—')}</div>
                          </div>
                          <div>
                            <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-muted">Délai Nationalité</div>
                            <div className="text-sm font-black text-text">{String(cbi.time ?? '—')}</div>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                          <span className="text-[10px] font-bold text-muted">{String(cbi.type ?? '')}</span>
                          <ArrowUpRight className="h-4 w-4 text-success" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
