'use client'

import type { IntelligenceBlockProps } from '@/components/intelligence/IntelligenceBlockRenderer'

export function BusinessSetupSteps({ value, meta }: Pick<IntelligenceBlockProps, 'value' | 'meta'>) {
  const steps = Array.isArray(value)
    ? value.map(String)
    : value != null
      ? [String(value)]
      : []

  if (steps.length === 0) return null

  return (
    <div className="rounded-lg border border-border bg-card p-3 text-sm">
      <p className="font-medium mb-2">{meta?.label ?? 'Création d\'activité'}</p>
      <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
        {steps.slice(0, 6).map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
    </div>
  )
}
