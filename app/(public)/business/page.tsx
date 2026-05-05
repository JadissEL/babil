'use client'

import { useState, useEffect } from 'react'
import {
  Briefcase,
  TrendingUp,
  Building2,
  Coins,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Store,
} from 'lucide-react'
import GoogleAd from '@/components/GoogleAd'

export default function BusinessPage() {
  const [countries, setCountries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/countries')
      .then(res => res.json())
      .then(data => {
        setCountries(data)
        setLoading(false)
      })
  }, [])

  const filtered = countries.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 pb-20 sm:px-8">
      <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-[2rem] bg-emerald-600 p-4 text-white shadow-xl shadow-emerald-900/40">
            <Briefcase className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Business & Investment</h1>
            <p className="mt-1 font-medium text-slate-400">
              Entrepreneuriat et opportunités pour citoyens marocains.
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Chercher un pays..."
            className="w-full rounded-2xl border border-white/15 bg-white/5 py-4 pl-12 pr-4 font-medium text-slate-100 outline-none placeholder:text-slate-500 transition-all focus:ring-2 focus:ring-emerald-500/40"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <GoogleAd slot="business_top" />

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {filtered.map((c) => {
            const full = c.full_data || {}
            const biz = full.visa_system?.business || {}
            const street = full.street_food || {}
            const cbi = full.cbi_program

            return (
              <div
                key={c.id}
                className="flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827] shadow-xl shadow-black/25 transition-all duration-500 hover:border-emerald-500/30"
              >
                <div className="flex items-start justify-between border-b border-white/10 bg-white/[0.03] p-8">
                  <div>
                    <h3 className="mb-1 text-3xl font-black text-white">{c.name}</h3>
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400">
                      <TrendingUp className="h-4 w-4" /> Mobilité économique
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-center">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Score biz</div>
                    <div className="text-xl font-black text-white">{(c.business_visa_score || 0).toFixed(1)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2">
                  <div className="space-y-6">
                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                      <Building2 className="h-4 w-4 text-blue-400" /> Création d&apos;entreprise
                    </h4>
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          Droit d&apos;investir
                        </div>
                        <p className="text-sm font-bold text-slate-200">{biz.rights || 'Information non disponible'}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">Setup</div>
                        <p className="text-sm font-bold text-slate-200">{biz.setup || 'Information non disponible'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                      <Store className="h-4 w-4 text-orange-400" /> Micro-business / food
                    </h4>
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-orange-500/25 bg-orange-500/10 p-4">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-orange-300">
                            Opportunité
                          </span>
                          <span className="text-xs font-black text-white">{street.opportunity || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <Coins className="h-3 w-3" /> Invest: {street.investment_min || 'Variable'}
                        </div>
                      </div>
                      <p className="text-xs font-medium italic leading-relaxed text-slate-500">
                        &quot;{street.barriers || 'Conditions locales standard.'}&quot;
                      </p>
                    </div>
                  </div>
                </div>

                {/* CBI Program if exists */}
                {cbi && (
                  <div className="px-8 pb-8">
                    <div className="group relative overflow-hidden rounded-3xl border border-emerald-500/25 bg-emerald-950/40 p-6 text-white">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      <div className="relative">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" /> Citizenship by Investment
                          </h4>
                          <span className="bg-emerald-500 text-[10px] font-black px-2 py-1 rounded-lg">ACTIF</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Investissement Min.</div>
                            <div className="text-sm font-black text-emerald-100">{cbi.cost_min}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Délai Nationalité</div>
                            <div className="text-sm font-black text-emerald-100">{cbi.time}</div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400">{cbi.type}</span>
                          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
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
