'use client'

import type { IntelligenceBlockProps } from '@/components/intelligence/IntelligenceBlockRenderer'

export function ScholarshipTable({ value, meta }: Pick<IntelligenceBlockProps, 'value' | 'meta'>) {
  if (value == null) return null
  const rows = Array.isArray(value) ? value : [value]

  return (
    <div className="rounded-lg border border-border bg-card p-3 text-sm">
      <p className="font-medium mb-2">{meta?.label ?? 'Formations et bourses'}</p>
      <ul className="space-y-1 text-muted-foreground list-disc pl-4">
        {rows.slice(0, 8).map((row, i) => (
          <li key={i}>{typeof row === 'object' ? JSON.stringify(row) : String(row)}</li>
        ))}
      </ul>
    </div>
  )
}
