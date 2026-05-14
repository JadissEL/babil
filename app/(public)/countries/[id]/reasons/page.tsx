'use client'

import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  Compass,
  Info,
  Landmark,
  Mountain,
  Plane,
  Sparkles,
  UtensilsCrossed,
  Users,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState, type ComponentType } from 'react'
import { buildCountryExperienceContent, type VisitReason } from '@/lib/country-experience-content'
import { materializeCountryApiRow } from '@/lib/country-full-data-materialize'

type CountryExperienceRow = Record<string, unknown> & {
  name: string
  full_data: Record<string, unknown>
}

type CountrySubpageLoadState = null | { error: string } | CountryExperienceRow

function isCountrySubpageError(s: CountrySubpageLoadState): s is { error: string } {
  return s !== null && typeof s === 'object' && 'error' in s && !('name' in s)
}

type ReasonCategory = {
  eyebrow: string
  icon: ComponentType<{ className?: string }>
  documentationHint?: 'high' | 'standard'
}

function categorize(reason: VisitReason, indexHint: number): ReasonCategory {
  const t = `${reason.title} ${reason.description}`.toLowerCase()
  if (/(mountain|coast|nature|park|expedit|sunset|sunrise|outdoor|hike|panoram)/.test(t)) {
    return { eyebrow: 'Nature & Exploration', icon: Mountain, documentationHint: 'standard' }
  }
  if (/(museum|historic|heritage|art|architectur|craft|tradition)/.test(t)) {
    return { eyebrow: 'Héritage & Culture', icon: Landmark, documentationHint: 'standard' }
  }
  if (/(food|street.food|cuisine|coffee|tea|market|dish|aromas?|gastronom)/.test(t)) {
    return { eyebrow: 'Culinaire', icon: UtensilsCrossed, documentationHint: 'standard' }
  }
  if (/(family|famille|reunion|wedding|funeral|relatives?|h[éeè]ritage)/.test(t)) {
    return { eyebrow: 'Personnel', icon: Users, documentationHint: 'standard' }
  }
  if (/(business|invest|conference|trade|negotiat|company|corporat|deal)/.test(t)) {
    return { eyebrow: 'Affaires & Investissement', icon: Briefcase, documentationHint: 'high' }
  }
  if (/(research|academic|university|phd|postdoc|fieldwork|laboratory|study)/.test(t)) {
    return { eyebrow: 'Éducation & Recherche', icon: BookOpen, documentationHint: 'high' }
  }
  if (/(transit|airport|stopover|layover|escale)/.test(t)) {
    return { eyebrow: 'Logistique', icon: Plane, documentationHint: 'standard' }
  }
  if (/(festival|nightlife|music|local rhythm|spirit|ritual)/.test(t)) {
    return { eyebrow: 'Vie locale', icon: Sparkles, documentationHint: 'standard' }
  }
  return [
    { eyebrow: 'Découverte', icon: Compass, documentationHint: 'standard' as const },
    { eyebrow: 'Vie locale', icon: Sparkles, documentationHint: 'standard' as const },
    { eyebrow: 'Culture urbaine', icon: Landmark, documentationHint: 'standard' as const },
  ][indexHint % 3]
}

function isSafeRemoteImage(url: string | undefined): boolean {
  if (!url) return false
  return /^https?:\/\/(images|source)\.unsplash\.com\//i.test(url)
}

export default function CountryReasonsPage() {
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

  const reasons = useMemo<VisitReason[]>(() => {
    if (!country || isCountrySubpageError(country)) return []
    return buildCountryExperienceContent(
      country.name,
      country.full_data as Record<string, unknown>,
    ).reasons
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

  // Select the 5 bento cards (1 hero + 4 supporting), then the rest as a tail grid.
  const bento = reasons.slice(0, 5)
  const tail = reasons.slice(5, 12)
  const principal = bento[0]
  const right1 = bento[1]
  const left2 = bento[2]
  const right2 = bento[3]
  const right3 = bento[4]

  if (!principal) {
    return (
      <div className="min-h-screen bg-[#FDFBF4]">
        <div className="mx-auto max-w-3xl px-6 pb-24 pt-10 sm:px-8">
          <Link
            href={`/countries/${id}`}
            className="mb-8 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/65 transition-colors hover:text-[#0D1B3E]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Retour au hub {country.name}
          </Link>
          <div className="rounded-2xl border border-dashed border-[#0D1B3E]/20 bg-white/60 p-10 text-center">
            <p className="font-serif text-base text-[#0D1B3E]/75">
              Aucun motif de voyage structuré pour <strong>{country.name}</strong> pour
              l&apos;instant.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const principalCat = categorize(principal, 0)
  const right1Cat = right1 ? categorize(right1, 1) : null
  const left2Cat = left2 ? categorize(left2, 2) : null
  const right2Cat = right2 ? categorize(right2, 3) : null
  const right3Cat = right3 ? categorize(right3, 4) : null

  const PrincipalIcon = principalCat.icon
  const Left2Icon = left2Cat?.icon

  return (
    <div className="min-h-screen bg-[#FDFBF4]">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:px-8">
        <Link
          href={`/countries/${id}`}
          className="mb-6 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/65 transition-colors hover:text-[#0D1B3E]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Retour au hub {country.name}
        </Link>

        <header className="mb-12 max-w-2xl">
          <h1 className="font-serif text-4xl font-black leading-[1.05] tracking-tight text-[#0D1B3E] sm:text-5xl">
            Motifs de Voyage
          </h1>
          <p className="mt-5 font-serif text-base font-medium leading-relaxed text-[#0D1B3E]/75 sm:text-lg">
            Analyse de la matrice des motifs d&apos;entrée au {country.name}. Sélectionnez un
            scénario pour consulter les exigences documentaires spécifiques, les taux
            d&apos;approbation historiques et les délais de traitement associés.
          </p>
        </header>

        <section
          aria-label="Mosaïque des motifs"
          className="mb-12 grid grid-cols-1 gap-5 lg:grid-cols-3 lg:grid-rows-[auto_auto]"
        >
          <article className="rounded-2xl border border-[#0D1B3E]/10 bg-white p-7 shadow-sm sm:p-8 lg:col-span-2 lg:row-span-1">
            <div className="flex items-start justify-between gap-5">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/55">
                  Scénario principal
                </p>
                <h2 className="mt-6 font-serif text-2xl font-black leading-tight tracking-tight text-[#0D1B3E] sm:text-3xl">
                  {principal.title}
                </h2>
                <p className="mt-3 max-w-xl font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/70 sm:text-base">
                  {principal.description}
                </p>
              </div>
              <span
                aria-hidden
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#0D1B3E]/15 bg-[#FDFBF4] text-[#0D1B3E]"
              >
                <PrincipalIcon className="h-5 w-5" />
              </span>
            </div>
          </article>

          {right1 && right1Cat ? (
            <article className="rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm lg:col-span-1 lg:row-span-1">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                {right1Cat.eyebrow}
              </p>
              <h3 className="mt-6 font-serif text-lg font-black leading-snug text-[#0D1B3E]">
                {right1.title}
              </h3>
              <p className="mt-2 font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/65">
                {right1.description}
              </p>
              {right1Cat.documentationHint === 'high' ? (
                <p className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-[#E07A2B]/30 bg-[#E07A2B]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#E07A2B]">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#E07A2B]" aria-hidden />
                  Documentation élevée
                </p>
              ) : null}
            </article>
          ) : null}

          {left2 && left2Cat && Left2Icon ? (
            <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#0D1B3E]/10 bg-white shadow-sm lg:col-span-1 lg:row-span-2">
              {isSafeRemoteImage(left2.imageUrl) ? (
                <div className="relative h-44 w-full bg-[#0D1B3E]/10 lg:h-56">
                  <Image
                    src={left2.imageUrl}
                    alt={left2.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover"
                  />
                  <p className="absolute left-4 top-4 inline-flex items-center rounded-md bg-white/85 px-2 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/75 backdrop-blur">
                    {left2Cat.eyebrow}
                  </p>
                </div>
              ) : (
                <div className="bg-[#F4EFE2] px-6 pt-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                    {left2Cat.eyebrow}
                  </p>
                </div>
              )}
              <div className="flex flex-1 flex-col p-6">
                <div className="mt-auto">
                  <Left2Icon className="mb-4 h-5 w-5 text-[#0D1B3E]/65" aria-hidden />
                  <h3 className="font-serif text-lg font-black leading-snug text-[#0D1B3E]">
                    {left2.title}
                  </h3>
                  <p className="mt-2 font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/65">
                    {left2.description}
                  </p>
                </div>
              </div>
            </article>
          ) : null}

          {right2 && right2Cat ? (
            <article className="rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm lg:col-span-1 lg:row-span-1">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                {right2Cat.eyebrow}
              </p>
              <h3 className="mt-6 font-serif text-lg font-black leading-snug text-[#0D1B3E]">
                {right2.title}
              </h3>
              <p className="mt-2 font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/65">
                {right2.description}
              </p>
            </article>
          ) : null}

          {right3 && right3Cat ? (
            <article className="rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm lg:col-span-1 lg:row-span-1">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                {right3Cat.eyebrow}
              </p>
              <h3 className="mt-6 font-serif text-lg font-black leading-snug text-[#0D1B3E]">
                {right3.title}
              </h3>
              <p className="mt-2 font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/65">
                {right3.description}
              </p>
            </article>
          ) : null}
        </section>

        {tail.length > 0 ? (
          <section aria-label="Autres motifs" className="mb-12">
            <h2 className="mb-5 font-serif text-xl font-black tracking-tight text-[#0D1B3E] sm:text-2xl">
              Autres motifs identifiés
            </h2>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tail.map((r, i) => {
                const c = categorize(r, i + 5)
                const Icon = c.icon
                return (
                  <li
                    key={r.id}
                    className="rounded-xl border border-[#0D1B3E]/10 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                        {c.eyebrow}
                      </p>
                      <Icon className="h-4 w-4 text-[#0D1B3E]/55" aria-hidden />
                    </div>
                    <h3 className="mt-3 font-serif text-base font-black leading-snug text-[#0D1B3E]">
                      {r.title}
                    </h3>
                    <p className="mt-2 font-serif text-xs font-medium leading-relaxed text-[#0D1B3E]/65">
                      {r.description}
                    </p>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : null}

        <section
          aria-label="Note sur la densité des données"
          className="rounded-xl border border-[#0D1B3E]/10 bg-[#F4EFE2] px-5 py-4"
        >
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#0D1B3E]/65" aria-hidden />
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65">
                Note sur la densité des données
              </p>
              <p className="mt-1.5 font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/75">
                Certaines catégories de motifs, notamment les visites liées à la recherche
                médicale spécialisée ou aux interventions humanitaires urgentes, présentent une
                densité de données historiques restreinte. Les intervalles de confiance pour les
                délais de traitement dans ces scénarios spécifiques sont par conséquent élargis.
                L&apos;analyse algorithmique privilégie les motifs à fort volume pour garantir la
                précision prédictive.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
