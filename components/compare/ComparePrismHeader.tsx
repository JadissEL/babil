'use client'

import type { CompareObjectiveDefinition } from '@/lib/compare-objectives'
import { PRISM_NAVY } from '@/lib/compare-prism-ui'
import { cn } from '@/lib/utils'

type Step = 'category' | 'objective' | 'countries'

type Props = {
  step: Step
  objective: CompareObjectiveDefinition
  className?: string
}

/**
 * En-tête maquette PAGE 03 : fil d’Ariane, fond topographique léger, titrage serif marine.
 */
export function ComparePrismHeader({ step, objective, className }: Props) {
  const title =
    step === 'countries'
      ? 'Analyse de destinations comparée'
      : step === 'objective'
        ? 'Précisez votre objectif'
        : 'Comparer les destinations'

  const subtitle =
    step === 'countries'
      ? `${objective.scoringRationale} Données indicatives — non juridiques ; vérifier auprès des autorités compétentes.`
      : step === 'objective'
        ? `Objectif courant : ${objective.label}. Choisissez la variante la plus proche de votre projet.`
        : 'Sélectionnez un domaine, puis un objectif : le tableau et les scores s’adaptent automatiquement.'

  return (
    <header
      className={cn(
        'relative overflow-hidden rounded-2xl border border-[#0D1B3E]/10 px-5 py-6 sm:px-8 sm:py-8',
        className,
      )}
      style={{
        backgroundColor: PRISM_CREAM,
        color: PRISM_NAVY,
        backgroundImage: `
          radial-gradient(circle at 18% 22%, rgba(13, 27, 62, 0.06) 0%, transparent 42%),
          radial-gradient(circle at 82% 8%, rgba(13, 27, 62, 0.05) 0%, transparent 38%),
          radial-gradient(circle at 70% 88%, rgba(13, 27, 62, 0.045) 0%, transparent 40%),
          linear-gradient(180deg, rgba(253, 251, 244, 0.97) 0%, rgba(253, 251, 244, 1) 100%)
        `,
      }}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/70">
        Comparatif <span className="text-[#0D1B3E]/40">›</span> Prism
      </p>
      <h1 className="mt-2 font-serif text-2xl font-bold leading-tight tracking-tight text-[#0D1B3E] sm:text-3xl md:text-[2rem]">
        {title}
      </h1>
      <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-[#0D1B3E]/75">{subtitle}</p>
    </header>
  )
}
