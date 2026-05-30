import { scoreSur100Parts } from '@/lib/ui-display-fr'
import { cn } from '@/lib/utils'

export type ScoreSur100Props = {
  score: number
  /** `badge` / `atlas` / `panel` : empile valeur + échelle ; `inline` : une ligne compacte */
  variant?: 'inline' | 'badge' | 'atlas' | 'panel' | 'strip'
  className?: string
  valueClassName?: string
  scaleClassName?: string
}

/**
 * Affichage score 0–100 avec cadrage typographique stable (évite débordement des cartes).
 */
export function ScoreSur100({
  score,
  variant = 'inline',
  className,
  valueClassName,
  scaleClassName,
}: ScoreSur100Props) {
  const { value, scale } = scoreSur100Parts(score)

  if (variant === 'badge') {
    return (
      <span className={cn('inline-flex flex-col items-end leading-none tabular-nums', className)}>
        <span className={cn('text-sm font-black', valueClassName)}>{value}</span>
        <span className={cn('mt-0.5 text-[9px] font-bold uppercase tracking-wide opacity-90', scaleClassName)}>
          {scale}
        </span>
      </span>
    )
  }

  if (variant === 'atlas') {
    return (
      <p className={cn('mt-auto pt-3 tabular-nums text-[#0D1B3E]', className)}>
        <span className={cn('text-3xl font-black tracking-tight md:text-[2rem]', valueClassName)}>{value}</span>
        <span className={cn('ml-1.5 text-xs font-bold text-muted', scaleClassName)}>{scale}</span>
      </p>
    )
  }

  if (variant === 'panel') {
    return (
      <span
        className={cn('inline-flex shrink-0 flex-col items-end leading-tight tabular-nums', className)}
      >
        <span className={cn('text-base font-black', valueClassName)}>{value}</span>
        <span className={cn('text-[10px] font-semibold text-muted', scaleClassName)}>{scale}</span>
      </span>
    )
  }

  if (variant === 'strip') {
    return (
      <span className={cn('inline-flex flex-col tabular-nums', className)}>
        <span className={cn('text-4xl font-black tracking-tight text-[#0D1B3E]', valueClassName)}>{value}</span>
        <span className={cn('text-[10px] font-semibold text-muted', scaleClassName)}>{scale}</span>
      </span>
    )
  }

  return (
    <span className={cn('inline tabular-nums', className)}>
      <span className={cn('font-black', valueClassName)}>{value}</span>
      <span className={cn('ml-1 text-[0.82em] font-semibold opacity-75', scaleClassName)}>{scale}</span>
    </span>
  )
}
