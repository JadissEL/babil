'use client'

import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { TravelerQuotesSection } from '@/components/country/TravelerQuotesSection'
import { buildCountryExperienceContent } from '@/lib/country-experience-content'
import { materializeCountryApiRow } from '@/lib/country-full-data-materialize'

type CountryExperienceRow = Record<string, unknown> & {
  name: string
  full_data: Record<string, unknown>
}

type CountrySubpageLoadState = null | { error: string } | CountryExperienceRow

function isCountrySubpageError(s: CountrySubpageLoadState): s is { error: string } {
  return s !== null && typeof s === 'object' && 'error' in s && !('name' in s)
}

export default function CountryQuotesPage() {
  const params = useParams()
  const id = params?.id
  const [country, setCountry] = useState<CountrySubpageLoadState>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetch(`/api/countries/${id}`)
      .then(async (res) => {
        const payload = await res.json()
        if (!res.ok) throw new Error(payload?.error || 'Failed to load country')
        return payload
      })
      .then((data: unknown) => {
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
          setCountry({ error: 'Réponse invalide' })
          setLoading(false)
          return
        }
        const row = materializeCountryApiRow(data as Record<string, unknown>)
        if (typeof row.name !== 'string') {
          setCountry({ error: 'Réponse invalide' })
          setLoading(false)
          return
        }
        setCountry(row as CountryExperienceRow)
        setLoading(false)
      })
      .catch((error) => {
        setCountry({ error: String(error?.message || error || 'Country not found') })
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  if (!country || isCountrySubpageError(country)) {
    return (
      <div className="p-20 text-center font-bold text-muted">
        {country && isCountrySubpageError(country) ? `Erreur: ${country.error}` : 'Pays non trouvé.'}
      </div>
    )
  }

  const full = country.full_data as Record<string, unknown>
  const experienceContent = buildCountryExperienceContent(country.name, full)

  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
      <Link
        href={`/countries/${id}`}
        className="mb-6 flex items-center gap-2 font-bold text-muted transition-colors hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" /> Retour au pays
      </Link>

      <TravelerQuotesSection countryName={country.name} quotes={experienceContent.quotes} />
    </div>
  )
}
