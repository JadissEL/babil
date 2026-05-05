'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CreditCard, Globe, Search, Clock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react'
import GoogleAd from '@/components/GoogleAd'

function normalize(value: unknown) {
  return String(value ?? '').trim()
}

function toLower(value: unknown) {
  return normalize(value).toLowerCase()
}

export default function InvestmentPage() {
  const [countries, setCountries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/countries')
      .then((res) => res.json())
      .then((data) => {
        setCountries(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const programs = useMemo(() => {
    return countries
      .map((c) => {
        const full = c.full_data || {}
        const p = full.cbi_program
        if (!p) return null
        return {
          country: c,
          program: p,
          cost: normalize(p.cost || p.investment_min || p.minimum_investment),
          processing: normalize(p.processing_time || p.timeline),
          benefits: p.benefits,
          requirements: p.requirements,
        }
      })
      .filter(Boolean) as any[]
  }, [countries])

  const filtered = useMemo(() => {
    return programs.filter((p) => {
      const name = toLower(p.country.name)
      const q = toLower(search)
      return !q || name.includes(q)
    })
  }, [programs, search])

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 pb-20 sm:px-8">
      <div className="mb-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-[2rem] bg-amber-600 p-4 text-white shadow-xl shadow-amber-900/40">
            <CreditCard className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Investment & Citizenship</h1>
            <p className="mt-1 font-medium text-slate-400">
              Programmes citizenship by investment (données chargées depuis la base).
            </p>
          </div>
        </div>

        <div className="relative w-full lg:w-96">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="search"
            placeholder="Chercher un pays..."
            className="w-full rounded-2xl border border-white/15 bg-white/5 py-4 pl-12 pr-4 font-medium text-slate-100 outline-none placeholder:text-slate-500 transition-all focus:ring-2 focus:ring-amber-500/40"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <GoogleAd slot="investment_top" />

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-amber-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/10 bg-[#111827] p-12 text-center shadow-xl shadow-black/20">
          <Sparkles className="mx-auto mb-6 h-16 w-16 text-amber-400" />
          <h2 className="mb-4 text-2xl font-black text-white">Données en cours</h2>
          <p className="font-medium leading-relaxed text-slate-400">
            La base actuelle n’inclut pas encore de programmes CBI complets. Explorez les pays et suivez l’évolution du dataset.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/explorer"
              className="rounded-2xl bg-blue-600 px-6 py-4 font-black text-white transition-colors hover:bg-blue-500"
            >
              Explorer les pays <ArrowRight className="ml-2 inline h-4 w-4" />
            </Link>
            <Link
              href="/overview"
              className="rounded-2xl border border-white/15 bg-white/5 px-6 py-4 font-black text-slate-100 transition-colors hover:bg-white/10"
            >
              Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div
              key={p.country.id}
              className="flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827] shadow-xl shadow-black/20 transition-all duration-300 hover:border-amber-500/35"
            >
              <div className="border-b border-white/10 p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-black text-white">{p.country.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                      <Globe className="h-3 w-3" /> {p.country.region}
                    </div>
                  </div>
                  <span className="rounded-xl border border-amber-500/35 bg-amber-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-200">
                    CBI
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-4 p-8">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-400">Coût</span>
                  </div>
                  <span className="text-xs font-black text-white">{p.cost || '—'}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-bold text-slate-400">Délai</span>
                  </div>
                  <span className="text-xs font-black text-white">{p.processing || '—'}</span>
                </div>
              </div>

              <div className="mt-auto border-t border-white/10 bg-white/[0.02] p-8">
                <Link
                  href={`/countries/${p.country.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-4 text-sm font-black text-white transition-colors hover:bg-amber-500/20 hover:border-amber-500/40"
                >
                  Voir détails pays <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-16">
        <GoogleAd slot="investment_bottom" />
      </div>
    </div>
  )
}

