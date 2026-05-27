'use client'

import { ArrowRight, Scale, ShieldCheck, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { ctaCompareHref, ctaExploreHref } from '@/lib/cta-hrefs'
import {
  NEXUS_FOCUS_VISIBLE,
  NEXUS_TRANSITION,
} from '@/lib/nexus-chrome'
import type { PerspectiveContract } from '@/lib/user-objectives/perspective-contract'
import { cn } from '@/lib/utils'

export type CountryPerspectiveSummaryStripProps = {
  contract: PerspectiveContract
  countryName: string
  primarySlug: string | null | undefined
  tourismScore: number
  tourismDifficulty: string
  isSchengen: boolean
  isGuest?: boolean
  /** Optional cost / process hints when present in data */
  processHint?: string | null
  costHint?: string | null
}

function signInHrefForCompareTarget(comparePath: string): string {
  if (typeof window === 'undefined') {
    return `/sign-in?redirect_url=${encodeURIComponent(comparePath)}`
  }
  const absolute = comparePath.startsWith('http')
    ? comparePath
    : `${window.location.origin}${comparePath.startsWith('/') ? comparePath : `/${comparePath}`}`
  return `/sign-in?redirect_url=${encodeURIComponent(absolute)}`
}

export function CountryPerspectiveSummaryStrip({
  contract,
  countryName,
  primarySlug,
  tourismScore,
  tourismDifficulty,
  isSchengen,
  isGuest = false,
  processHint,
  costHint,
}: CountryPerspectiveSummaryStripProps) {
  if (contract.primaryScoreFocus !== 'tourism') {
    return null
  }

  const exploreHref = ctaExploreHref(primarySlug)
  const compareProductHref = ctaCompareHref(primarySlug)
  const compareHref = isGuest ? signInHrefForCompareTarget(compareProductHref) : compareProductHref

  return (
    <section
      aria-label="Résumé pour votre parcours tourisme"
      className="mb-8 rounded-2xl border border-[#0D1B3E]/12 bg-gradient-to-br from-[#FDFBF4] to-white p-5 shadow-sm sm:p-6"
    >
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/55">
        Décision rapide · Tourisme
      </p>
      <h2 className="mt-1 font-serif text-xl font-black tracking-tight text-[#0D1B3E] sm:text-2xl">
        {countryName} pour un séjour visiteur
      </h2>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[#0D1B3E]/10 bg-white px-3 py-2.5">
          <dt className="text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]/55">
            Score tourisme
          </dt>
          <dd className="mt-0.5 font-serif text-lg font-black text-[#0D1B3E]">{tourismScore}/100</dd>
        </div>
        <div className="rounded-xl border border-[#0D1B3E]/10 bg-white px-3 py-2.5">
          <dt className="text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]/55">
            Difficulté visa
          </dt>
          <dd className="mt-0.5 font-serif text-sm font-black text-[#0D1B3E]">{tourismDifficulty}</dd>
        </div>
        {processHint ? (
          <div className="rounded-xl border border-[#0D1B3E]/10 bg-white px-3 py-2.5">
            <dt className="text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]/55">
              Démarches
            </dt>
            <dd className="mt-0.5 font-serif text-sm font-medium text-[#0D1B3E]/80">{processHint}</dd>
          </div>
        ) : null}
        {costHint ? (
          <div className="rounded-xl border border-[#0D1B3E]/10 bg-white px-3 py-2.5">
            <dt className="text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]/55">
              Coût indicatif
            </dt>
            <dd className="mt-0.5 font-serif text-sm font-medium text-[#0D1B3E]/80">{costHint}</dd>
          </div>
        ) : null}
        <div className="rounded-xl border border-[#0D1B3E]/10 bg-white px-3 py-2.5">
          <dt className="text-[10px] font-black uppercase tracking-widest text-[#0D1B3E]/55">
            Schengen
          </dt>
          <dd className="mt-0.5 inline-flex items-center gap-1 font-serif text-sm font-black text-[#0D1B3E]">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {isSchengen ? 'Membre' : 'Hors zone'}
          </dd>
        </div>
      </dl>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={exploreHref}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-white',
            NEXUS_FOCUS_VISIBLE,
            NEXUS_TRANSITION,
          )}
          style={{ backgroundColor: '#0D1B3E' }}
        >
          Explorer
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
        <Link
          href={compareHref}
          className={cn(
            'inline-flex items-center gap-2 rounded-xl border border-[#0D1B3E]/20 bg-white px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-[#0D1B3E] hover:bg-[#FDFBF4]',
            NEXUS_FOCUS_VISIBLE,
            NEXUS_TRANSITION,
          )}
          title={isGuest ? 'Connexion requise' : undefined}
        >
          <Scale className="h-3.5 w-3.5" aria-hidden />
          Comparer
        </Link>
        <Link
          href="/probability"
          className={cn(
            'inline-flex items-center gap-2 rounded-xl border border-[#0D1B3E]/15 bg-[#FDFBF4] px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-[#0D1B3E] hover:bg-white',
            NEXUS_FOCUS_VISIBLE,
            NEXUS_TRANSITION,
          )}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Probabilités
        </Link>
      </div>
    </section>
  )
}
