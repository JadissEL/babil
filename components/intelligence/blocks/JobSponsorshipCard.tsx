'use client'

import type { IntelligenceBlockProps } from '@/components/intelligence/IntelligenceBlockRenderer'

export function JobSponsorshipCard({ value, meta }: Pick<IntelligenceBlockProps, 'value' | 'meta'>) {
  if (value == null || value === '') return null
  const text = typeof value === 'object' ? JSON.stringify(value) : String(value)

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-sm dark:border-emerald-800 dark:bg-emerald-950/30">
      <p className="font-medium">{meta?.label ?? 'Emploi et parrainage'}</p>
      <p className="text-muted-foreground mt-1">{text}</p>
    </div>
  )
}
