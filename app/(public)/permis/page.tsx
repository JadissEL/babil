'use client'

import React, { useState, useEffect } from 'react'
import { Car, Clock, CreditCard, Info, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react'
import GoogleAd from '@/components/GoogleAd'

export default function PermisPage() {
  const [countries, setCountries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/countries')
      .then(res => res.json())
      .then(data => {
        setCountries(data)
        setLoading(false)
      })
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'valide':
      case 'valid':
        return (
          <span className="rounded-lg border border-emerald-500/35 bg-emerald-500/15 px-3 py-1 text-[10px] font-black uppercase text-emerald-200">
            Valide
          </span>
        )
      case 'conversion requise':
      case 'exchange required':
        return (
          <span className="rounded-lg border border-amber-500/35 bg-amber-500/15 px-3 py-1 text-[10px] font-black uppercase text-amber-200">
            Conversion requise
          </span>
        )
      case 'non reconnu':
      case 'not recognized':
        return (
          <span className="rounded-lg border border-red-500/35 bg-red-500/15 px-3 py-1 text-[10px] font-black uppercase text-red-200">
            Non reconnu
          </span>
        )
      default:
        return (
          <span className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-black uppercase text-slate-300">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 pb-20 sm:px-8">
      <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="rounded-[2rem] bg-blue-600 p-4 text-white shadow-xl shadow-blue-900/40">
            <Car className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Permis de conduire</h1>
            <p className="mt-1 font-medium text-slate-400">
              Validité et conversion du permis marocain à l&apos;international.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-500/15 px-4 py-2 text-xs font-black uppercase tracking-widest text-emerald-200">
            <ShieldCheck className="h-4 w-4" /> Top conversion
          </div>
        </div>
      </div>

      <GoogleAd slot="permis_top" />

      {loading ? (
        <div className="flex justify-center p-20">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {countries.map((c: any) => {
            const drive = c.full_data?.driving_license
            if (!drive) return null

            return (
              <div
                key={c.id}
                className="flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827] shadow-xl shadow-black/20 transition-all duration-300 hover:border-blue-500/30"
              >
                <div className="border-b border-white/10 p-8">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <h3 className="text-2xl font-black text-white">{c.name}</h3>
                    {getStatusBadge(drive.status)}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
                    <Clock className="h-3 w-3" /> Durée: {drive.duration || 'N/A'}
                  </div>
                </div>

                <div className="flex-1 space-y-6 p-8">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/35">
                      <Info className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">Conditions</p>
                      <p className="text-sm font-medium leading-relaxed text-slate-300">{drive.conditions}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/35">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        Conversion
                      </p>
                      <p className="text-sm font-medium leading-relaxed text-slate-300">
                        {drive.conversion_possible ? 'Possible' : 'Non possible'} — {drive.conversion_details}
                      </p>
                    </div>
                  </div>

                  {drive.restrictions && (
                    <div className="flex gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                      <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
                      <p className="text-xs font-bold leading-relaxed text-red-100">{drive.restrictions}</p>
                    </div>
                  )}
                </div>

                <div className="mt-auto border-t border-white/10 bg-white/[0.02] p-8">
                  <a
                    href={`/countries/${c.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-4 text-sm font-black text-white transition-colors hover:bg-blue-500/20 hover:border-blue-500/40"
                  >
                    Voir détails pays <MapPin className="h-4 w-4" />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-20">
        <GoogleAd slot="permis_bottom" />
      </div>
    </div>
  )
}
