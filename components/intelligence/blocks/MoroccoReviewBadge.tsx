'use client'

import type { IntelligenceBlockProps } from '@/components/intelligence/IntelligenceBlockRenderer'

export function MoroccoReviewBadge({ value }: Pick<IntelligenceBlockProps, 'value'>) {
  if (value == null || value === '') return null
  const text = String(value)
  const needsReview = /review|à confirmer|confirm/i.test(text)

  if (!needsReview) return null

  return (
    <span className="inline-flex items-center rounded-full border border-amber-400/80 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-950 dark:bg-amber-950/50 dark:text-amber-100">
      Applicabilité Maroc — à confirmer
    </span>
  )
}
