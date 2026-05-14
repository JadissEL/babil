'use client'

import {
  ArrowLeft,
  ArrowRight,
  BookmarkCheck,
  Check,
  Gauge,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { PhDStudiesSection } from '@/components/country/PhDStudiesSection'
import GoogleAd from '@/components/GoogleAd'
import { ObjectiveAwareExplorerLink } from '@/components/nav/ObjectiveAwareNavLinks'
import { materializeCountryApiRow } from '@/lib/country-full-data-materialize'
import { buildPhdStudies, hasCountryPhdStoredData, type PhdStudiesModel } from '@/lib/country-phd-studies'
import { enrichCountryApiRecord } from '@/lib/enrich-country-api'

type FundingItem = { title: string; description?: string }

function splitFundingSource(raw: string): FundingItem {
  const trimmed = raw.trim()
  if (!trimmed) return { title: '' }
  const dashSplit = trimmed.split(/\s+[—–-]\s+/)
  if (dashSplit.length >= 2) {
    return { title: dashSplit[0].trim(), description: dashSplit.slice(1).join(' — ').trim() }
  }
  const colonSplit = trimmed.split(/\s*:\s*/)
  if (colonSplit.length >= 2 && colonSplit[0].length < 80) {
    return { title: colonSplit[0].trim(), description: colonSplit.slice(1).join(': ').trim() }
  }
  const sentenceEnd = trimmed.indexOf('. ')
  if (sentenceEnd > 0 && sentenceEnd < 90) {
    return { title: trimmed.slice(0, sentenceEnd).trim(), description: trimmed.slice(sentenceEnd + 2).trim() }
  }
  return { title: trimmed }
}

function isExternalUrl(url: string | undefined): url is string {
  return Boolean(url && /^https?:\/\//i.test(url))
}

type PhdJourneyPhase = { id: string; window: string; title: string }
const PHD_JOURNEY: ReadonlyArray<PhdJourneyPhase> = [
  { id: 'p1', window: 'Years 1-2', title: 'Coursework & Proposal' },
  { id: 'p2', window: 'Years 2-3', title: 'Primary Research' },
  { id: 'p3', window: 'Year 3+', title: 'Defense & PhD' },
]

function LabIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 280"
      aria-hidden
      className={className}
    >
      <defs>
        <radialGradient id="lab-bg" cx="50%" cy="55%" r="65%">
          <stop offset="0%" stopColor="#243161" />
          <stop offset="100%" stopColor="#0d1b3e" />
        </radialGradient>
        <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect width="360" height="280" rx="16" fill="url(#lab-bg)" />
      <ellipse cx="180" cy="232" rx="120" ry="12" fill="#ffffff" fillOpacity="0.08" />
      <g stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.2" fill="url(#glass)">
        <path d="M120 100 L120 200 Q120 220 140 220 L160 220 Q180 220 180 200 L180 100 Z" />
        <path d="M210 130 L210 200 Q210 220 224 220 L240 220 Q254 220 254 200 L254 130 Z" />
        <ellipse cx="150" cy="100" rx="30" ry="8" />
        <ellipse cx="232" cy="130" rx="22" ry="6" />
        <ellipse cx="290" cy="155" rx="14" ry="4" />
        <path d="M276 155 L276 200 Q276 220 290 220 L290 220 Q304 220 304 200 L304 155 Z" />
      </g>
      <g stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1.2" fill="none">
        <line x1="150" y1="74" x2="150" y2="92" />
        <line x1="232" y1="108" x2="232" y2="122" />
        <line x1="290" y1="138" x2="290" y2="148" />
      </g>
      <circle cx="150" cy="170" r="8" fill="#9ab3ff" fillOpacity="0.55" />
      <circle cx="232" cy="180" r="6" fill="#ffd17a" fillOpacity="0.6" />
      <circle cx="290" cy="190" r="4" fill="#9ab3ff" fillOpacity="0.55" />
    </svg>
  )
}

export default function CountryDoctoratPage() {
  const params = useParams()
  const id = params?.id as string | undefined

  const [countryName, setCountryName] = useState('')
  const [fullData, setFullData] = useState<Record<string, unknown> | null>(null)
  const [studyVisaScore, setStudyVisaScore] = useState<number | null>(null)
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
        try {
          const enriched = enrichCountryApiRecord(row)
          const s = enriched?._visa?.study
          if (typeof s === 'number' && Number.isFinite(s)) {
            setStudyVisaScore(Math.max(0, Math.min(100, Math.round(s * 10) / 10)))
          }
        } catch {
          // best-effort: leave studyVisaScore as null
        }
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

  const phdModel: PhdStudiesModel | null = useMemo(
    () => (countryName && fullData && hasPhdData ? buildPhdStudies(countryName, fullData) : null),
    [countryName, fullData, hasPhdData],
  )

  const fundingItems: FundingItem[] = useMemo(() => {
    if (!phdModel?.funding?.fundingSources) return []
    return phdModel.funding.fundingSources.slice(0, 4).map(splitFundingSource).filter((f) => f.title)
  }, [phdModel])

  const primaryInstitutions = useMemo(() => {
    if (!phdModel?.meta?.officialLinks) return []
    return phdModel.meta.officialLinks.slice(0, 3)
  }, [phdModel])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF4]">
        <div className="flex justify-center p-20">
          <div
            className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#0D1B3E]"
            aria-label="Chargement"
          />
        </div>
      </div>
    )
  }

  if (error || !id) {
    return (
      <div className="min-h-screen bg-[#FDFBF4]">
        <div className="mx-auto max-w-2xl px-6 py-20 text-center">
          <p className="font-serif text-base text-[#0D1B3E]/75">{error ?? 'Impossible de charger ce pays.'}</p>
          <ObjectiveAwareExplorerLink className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] underline-offset-4 hover:underline">
            Retour à l&apos;explorateur
          </ObjectiveAwareExplorerLink>
        </div>
      </div>
    )
  }

  if (!hasPhdData || !phdModel) {
    return (
      <div className="min-h-screen bg-[#FDFBF4]">
        <div className="mx-auto max-w-2xl px-6 pb-24 pt-10 sm:px-8">
          <Link
            href={`/countries/${id}`}
            className="mb-8 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/65 transition-colors hover:text-[#0D1B3E]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Return to Country Hub
          </Link>
          <div className="rounded-2xl border border-[#0D1B3E]/10 bg-white p-10 text-center shadow-sm">
            <p className="font-serif text-xl font-black text-[#0D1B3E] sm:text-2xl">
              Guide doctoral pas encore disponible
            </p>
            <p className="mt-3 font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/75">
              Il n&apos;y a pas encore de contenu doctoral structuré pour{' '}
              {countryName || 'ce pays'}. Revenez plus tard ou consultez la fiche pays pour visa,
              friction et études générales.
            </p>
            <Link
              href={`/countries/${id}`}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#0D1B3E] px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-sm transition-transform hover:-translate-y-0.5"
            >
              Ouvrir la fiche pays
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const ecosystemNote = phdModel.researchEcosystem.strengthsClusters
  const hasFirstNote = primaryInstitutions.length > 0

  return (
    <div className="min-h-screen bg-[#FDFBF4]">
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-10 sm:px-8">
        <Link
          href={`/countries/${id}`}
          className="mb-6 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/65 transition-colors hover:text-[#0D1B3E]"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Return to Country Hub
        </Link>

        <section
          aria-label="PhD brief"
          className="mb-16 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start"
        >
          <div>
            <p className="mb-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.26em] text-[#0D1B3E]/65">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#E07A2B]" aria-hidden />
              Intelligence Brief
              <span className="text-[#0D1B3E]/30">|</span>
              {countryName || '—'}
            </p>
            <h1 className="font-serif text-4xl font-black leading-[1.1] tracking-tight text-[#0D1B3E] sm:text-5xl">
              Doctorat &amp; Études Doctorales
            </h1>
            <p className="mt-5 max-w-xl font-serif text-base font-medium leading-relaxed text-[#0D1B3E]/75 sm:text-lg">
              {phdModel.overview.executiveSummary}
            </p>

            <div className="mt-8">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                Standard PhD Journey (3-5 Years)
              </p>
              <ol className="grid grid-cols-3 gap-3">
                {PHD_JOURNEY.map((phase) => (
                  <li
                    key={phase.id}
                    className="rounded-xl border border-[#0D1B3E]/10 bg-white px-3 py-3 shadow-sm"
                  >
                    <p className="text-[9.5px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/55">
                      {phase.window}
                    </p>
                    <p className="mt-1 font-serif text-xs font-black leading-snug text-[#0D1B3E] sm:text-[13px]">
                      {phase.title}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[#0D1B3E]/10 shadow-sm">
            <LabIllustration className="block h-full w-full" />
          </div>
        </section>

        <section
          aria-label="Research ecosystem"
          className="mb-12 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
        >
          <div>
            <h2 className="mb-5 font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
              L&apos;Écosystème de Recherche
            </h2>
            <p className="font-serif text-base font-medium leading-relaxed text-[#0D1B3E]/85">
              {ecosystemNote}
              {hasFirstNote ? (
                <sup className="ml-1 align-super text-[10px] font-black text-[#E07A2B]">[1]</sup>
              ) : null}
            </p>
            {phdModel.researchEcosystem.languageOfInstructionReality ? (
              <p className="mt-4 font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/65">
                {phdModel.researchEcosystem.languageOfInstructionReality}
              </p>
            ) : null}
          </div>

          <aside aria-label="Primary institutions" className="lg:pt-2">
            <p className="mb-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#E07A2B]" aria-hidden />
              Institutions primaires
            </p>
            {primaryInstitutions.length > 0 ? (
              <ul className="divide-y divide-[#0D1B3E]/10">
                {primaryInstitutions.map((inst, i) => (
                  <li key={`${inst.url}-${i}`} className="py-3 first:pt-0 last:pb-0">
                    {isExternalUrl(inst.url) ? (
                      <a
                        href={inst.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="font-serif text-sm font-black text-[#0D1B3E] underline-offset-4 hover:underline"
                      >
                        {inst.label}
                      </a>
                    ) : (
                      <span className="font-serif text-sm font-black text-[#0D1B3E]">{inst.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-serif text-sm font-medium text-[#0D1B3E]/65">
                Liste des institutions à enrichir dans le pipeline.
              </p>
            )}
          </aside>
        </section>

        <section aria-label="Metrics & funding" className="mb-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65">
                <Gauge className="h-3.5 w-3.5" aria-hidden /> Visa Friction Index
              </p>
              <span className="rounded-md border border-[#E07A2B]/30 bg-[#E07A2B]/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#E07A2B]">
                Live Index
              </span>
            </div>
            <p className="font-serif text-4xl font-black leading-none text-[#0D1B3E] sm:text-5xl">
              {studyVisaScore != null ? `${studyVisaScore}%` : '—'}
            </p>
            <p className="mt-4 font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/70">
              Proxy d&apos;approbation des permis d&apos;études (PhD) dérivé de notre score visa
              études matérialisé pour {countryName}. Comparé aux études de premier cycle, ce
              segment présente généralement une friction inférieure pour les profils marocains.
            </p>
          </article>

          <article className="rounded-2xl border border-[#0D1B3E]/10 bg-white p-6 shadow-sm sm:p-7">
            <p className="mb-5 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65">
              <BookmarkCheck className="h-3.5 w-3.5" aria-hidden /> Structures de Financement
            </p>
            {fundingItems.length > 0 ? (
              <ul className="space-y-4">
                {fundingItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700"
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-serif text-sm font-black leading-snug text-[#0D1B3E]">
                        {item.title}
                      </p>
                      {item.description ? (
                        <p className="mt-0.5 font-serif text-xs font-medium leading-relaxed text-[#0D1B3E]/65">
                          {item.description}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-serif text-sm font-medium text-[#0D1B3E]/65">
                Sources de financement à enrichir dans le pipeline.
              </p>
            )}
          </article>
        </section>

        <div className="mb-12">
          <GoogleAd slot="country_detail_mid" />
        </div>

        <section
          aria-label="CTA"
          className="mb-16 rounded-2xl border border-[#0D1B3E]/10 bg-[#F4EFE2] px-6 py-10 text-center sm:px-12"
        >
          <h3 className="font-serif text-2xl font-black tracking-tight text-[#0D1B3E] sm:text-3xl">
            Prêt à approfondir vos recherches&nbsp;?
          </h3>
          <p className="mx-auto mt-3 max-w-2xl font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/75 sm:text-base">
            Explorez d&apos;autres parcours académiques, comparez les écosystèmes provinciaux ou
            lancez une évaluation de profil pour évaluer vos options de visa étudiant.
          </p>
          <Link
            href="/education"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0D1B3E] px-6 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md"
          >
            Explore Education Paths <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </section>

        <section aria-label="PhD full dossier" className="mt-4">
          <PhDStudiesSection
            countryName={countryName}
            model={phdModel}
            variant="standalone"
            countryDetailHref={`/countries/${id}`}
          />
        </section>
      </div>
    </div>
  )
}
