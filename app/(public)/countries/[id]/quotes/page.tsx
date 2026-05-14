'use client'

import { ArrowLeft, ExternalLink, Quote } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { buildCountryExperienceContent } from '@/lib/country-experience-content'
import { materializeCountryApiRow } from '@/lib/country-full-data-materialize'
import type { TravelerQuote } from '@/lib/country-experience-content'

type CountryExperienceRow = Record<string, unknown> & {
  name: string
  full_data: Record<string, unknown>
}

type CountrySubpageLoadState = null | { error: string } | CountryExperienceRow

function isCountrySubpageError(s: CountrySubpageLoadState): s is { error: string } {
  return s !== null && typeof s === 'object' && 'error' in s && !('name' in s)
}

function initial(name: string | undefined): string {
  if (!name) return '·'
  const trimmed = name.trim()
  return trimmed ? trimmed.charAt(0).toUpperCase() : '·'
}

function sentimentLabel(s: TravelerQuote['sentiment']): string {
  switch (s) {
    case 'positive':
      return 'Expérience positive'
    case 'negative':
      return 'Vigilance'
    default:
      return 'Témoignage'
  }
}

function sentimentToneClass(s: TravelerQuote['sentiment']): string {
  switch (s) {
    case 'positive':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case 'negative':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    default:
      return 'border-[#0D1B3E]/15 bg-[#FDFBF4] text-[#0D1B3E]/75'
  }
}

function isExternalUrl(url: string | undefined): url is string {
  return Boolean(url && /^https?:\/\//i.test(url))
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

  const experienceContent = useMemo(() => {
    if (!country || isCountrySubpageError(country)) return null
    return buildCountryExperienceContent(
      country.name,
      country.full_data as Record<string, unknown>,
    )
  }, [country])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF4]">
        <div className="flex justify-center p-20">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#0D1B3E]" />
        </div>
      </div>
    )
  }

  if (!country || isCountrySubpageError(country)) {
    return (
      <div className="min-h-screen bg-[#FDFBF4]">
        <div className="p-20 text-center font-serif text-base text-[#0D1B3E]/75">
          {country && isCountrySubpageError(country)
            ? `Erreur : ${country.error}`
            : 'Pays non trouvé.'}
        </div>
      </div>
    )
  }

  const quotes = experienceContent?.quotes ?? []
  const featured =
    quotes.find((q) => q.sentiment === 'positive') ?? quotes[0] ?? null
  const rest = featured ? quotes.filter((q) => q.id !== featured.id) : quotes

  return (
    <div className="min-h-screen bg-[#FDFBF4]">
      <div className="mx-auto max-w-5xl px-6 pb-24 pt-10 sm:px-8">
        <div className="mb-14 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/65">
          <Link
            href={`/countries/${id}`}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-[#0D1B3E]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Hub {country.name}
          </Link>
          <span className="hidden sm:inline">Dossier de recherche</span>
        </div>

        {featured ? (
          <section
            aria-label="Citation à la une"
            className="relative mb-20 px-6 text-center sm:px-12"
          >
            <Quote
              aria-hidden
              className="pointer-events-none absolute -top-2 left-2 h-28 w-28 text-[#0D1B3E]/10 sm:left-6 sm:h-32 sm:w-32"
            />
            <p className="mb-6 text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/65">
              Échos &amp; Expériences
            </p>
            <blockquote className="relative mx-auto max-w-3xl font-serif text-2xl font-black leading-[1.2] tracking-tight text-[#0D1B3E] sm:text-3xl md:text-4xl">
              &laquo;&nbsp;{featured.text}&nbsp;&raquo;
            </blockquote>
            <figcaption className="relative mt-8 flex flex-col items-center gap-2">
              {featured.author ? (
                <p className="font-serif text-sm font-black text-[#0D1B3E]">{featured.author}</p>
              ) : null}
              {featured.sourceName ? (
                isExternalUrl(featured.sourceUrl) ? (
                  <a
                    href={featured.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] transition-transform hover:-translate-y-0.5 ${sentimentToneClass(featured.sentiment)}`}
                  >
                    {featured.sourceName}
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                ) : (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${sentimentToneClass(featured.sentiment)}`}
                  >
                    {featured.sourceName}
                  </span>
                )
              ) : (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${sentimentToneClass(featured.sentiment)}`}
                >
                  {sentimentLabel(featured.sentiment)}
                </span>
              )}
            </figcaption>
          </section>
        ) : null}

        {rest.length > 0 ? (
          <section aria-label="Témoignages additionnels" className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {rest.map((q, index) => {
              const wide = index % 3 === 0
              return (
                <figure
                  key={q.id}
                  className={`relative flex flex-col rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm sm:p-7 ${
                    wide ? 'md:col-span-2' : ''
                  }`}
                >
                  <Quote
                    aria-hidden
                    className="pointer-events-none absolute left-3 top-3 h-7 w-7 text-[#0D1B3E]/10"
                  />
                  <blockquote className="font-serif text-[15px] font-medium italic leading-relaxed text-[#0D1B3E] sm:text-base">
                    &laquo;&nbsp;{q.text}&nbsp;&raquo;
                  </blockquote>

                  <figcaption className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#0D1B3E]/10 pt-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        aria-hidden
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#0D1B3E]/15 bg-[#FDFBF4] font-serif text-sm font-black text-[#0D1B3E]"
                      >
                        {initial(q.author)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-serif text-sm font-black text-[#0D1B3E]">
                          {q.author || 'Témoin anonyme'}
                        </p>
                        <p className="truncate font-serif text-xs font-medium text-[#0D1B3E]/65">
                          {sentimentLabel(q.sentiment)}
                        </p>
                      </div>
                    </div>
                    {q.sourceName ? (
                      isExternalUrl(q.sourceUrl) ? (
                        <a
                          href={q.sourceUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 rounded-md border border-[#0D1B3E]/15 bg-[#FDFBF4] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#0D1B3E]/75 transition-transform hover:-translate-y-0.5"
                        >
                          {q.sourceName}
                          <ExternalLink className="h-3 w-3" aria-hidden />
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-[#0D1B3E]/15 bg-[#FDFBF4] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#0D1B3E]/75">
                          {q.sourceName}
                        </span>
                      )
                    ) : null}
                  </figcaption>
                </figure>
              )
            })}
          </section>
        ) : !featured ? (
          <section className="rounded-2xl border border-dashed border-[#0D1B3E]/20 bg-white/60 p-12 text-center">
            <p className="font-serif text-base font-medium leading-relaxed text-[#0D1B3E]/75">
              Aucun témoignage vérifié pour <strong>{country.name}</strong> pour l&apos;instant.
              Revenez plus tard ou consultez les{' '}
              <Link href={`/countries/${id}`} className="font-bold underline">
                signaux structurés
              </Link>{' '}
              sur le hub pays.
            </p>
          </section>
        ) : null}
      </div>
    </div>
  )
}
