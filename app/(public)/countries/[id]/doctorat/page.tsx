'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

import GoogleAd from '@/components/GoogleAd'
import { PhDStudiesSection } from '@/components/country/PhDStudiesSection'
import { materializeCountryApiRow } from '@/lib/country-full-data-materialize'
import { buildPhdStudies, hasCountryPhdStoredData } from '@/lib/country-phd-studies'

export default function CountryDoctoratPage() {
  const params = useParams()
  const id = params?.id as string | undefined

  const [countryName, setCountryName] = useState('')
  const [fullData, setFullData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    fetch(`/api/countries/${id}`)
      .then(async (res) => {
        const payload = await res.json()
        if (!res.ok) throw new Error(payload?.error || 'Erreur de chargement')
        return payload
      })
      .then((data) => {
        const row = materializeCountryApiRow(data as Record<string, unknown>)
        setCountryName(String(row.name ?? ''))
        setFullData((row.full_data ?? {}) as Record<string, unknown>)
      })
      .catch((e) => {
        setError(String(e?.message || e || 'Erreur'))
      })
      .finally(() => setLoading(false))
  }, [id])

  const hasPhdData = useMemo(
    () => (fullData ? hasCountryPhdStoredData(fullData) : false),
    [fullData],
  )

  const phdModel = useMemo(
    () => (countryName && fullData && hasPhdData ? buildPhdStudies(countryName, fullData) : null),
    [countryName, fullData, hasPhdData],
  )

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" aria-label="Chargement" />
      </div>
    )
  }

  if (error || !id) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center font-bold text-muted">
        <p>{error ?? 'Impossible de charger ce pays.'}</p>
        <Link href="/explorer" className="mt-6 inline-block text-primary underline underline-offset-4">
          Retour à l’explorateur
        </Link>
      </div>
    )
  }

  if (!hasPhdData) {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-20 pt-4 sm:px-6 lg:px-8">
        <Link
          href={`/countries/${id}`}
          className="mb-6 flex items-center gap-2 font-bold text-muted transition-colors hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden /> Retour à la fiche {countryName || 'pays'}
        </Link>
        <div className="rounded-2xl border border-line bg-surface p-10 text-center shadow-card">
          <p className="text-lg font-black text-text">Guide doctoral pas encore disponible</p>
          <p className="mt-3 text-sm font-medium leading-relaxed text-muted">
            Il n’y a pas encore de contenu doctoral structuré ({' '}
            <code className="rounded-md border border-line bg-inset px-1.5 py-0.5 text-[11px] font-bold">full_data.phd_studies</code>
            ) pour {countryName || 'ce pays'}. Revenez plus tard ou consultez la fiche pays pour visa, friction et études générales.
          </p>
          <Link
            href={`/countries/${id}`}
            className="mt-8 inline-flex rounded-xl bg-primary px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-soft transition-colors hover:bg-primary-hover"
          >
            Ouvrir la fiche pays
          </Link>
        </div>
      </div>
    )
  }

  if (!phdModel) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center font-bold text-muted">
        <p>Impossible de charger ce pays.</p>
        <Link href="/explorer" className="mt-6 inline-block text-primary underline underline-offset-4">
          Retour à l’explorateur
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-4 sm:px-6 lg:px-8">
      <Link
        href={`/countries/${id}`}
        className="mb-6 flex items-center gap-2 font-bold text-muted transition-colors hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden /> Retour à la fiche {countryName}
      </Link>

      <header className="mb-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted">Vue dédiée</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-text md:text-4xl">Doctorat · {countryName}</h1>
        <p className="mt-3 max-w-2xl text-sm font-medium text-muted leading-relaxed">
          Décision complète au même format que nos guides comparables : admissions, structure du programme,
          titre de séjour, financement et risques terrain.
        </p>
      </header>

      <PhDStudiesSection
        countryName={countryName}
        model={phdModel}
        variant="standalone"
        countryDetailHref={`/countries/${id}`}
      />

      <div className="mt-12">
        <GoogleAd slot="country_detail_mid" />
      </div>
    </div>
  )
}
