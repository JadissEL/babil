'use client'

import { Newspaper, ChevronDown, ChevronUp } from 'lucide-react'
import { useId, useState } from 'react'
import type { CountryDbInsightPublic } from '@/lib/country-db-insights'

function FieldBlock({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'default' | 'warning' | 'muted'
}) {
  const border =
    tone === 'warning'
      ? 'border-amber-200/80 bg-amber-50/60'
      : tone === 'muted'
        ? 'border-line bg-inset/60'
        : 'border-line bg-surface'
  return (
    <div className={`rounded-xl border p-3 ${border}`}>
      <p className="text-[10px] font-black uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm font-medium leading-relaxed text-text">{value}</p>
    </div>
  )
}

/** Notes terrain : rédactionnel `CountryInsight` (non versionné). Voir docs/country-insight-vs-observations.md — distinct des faits `CountryObservation` / matérialisation `full_data`. */
export function CountryDbInsightsCollapsible({ rows }: { rows: CountryDbInsightPublic[] }) {
  const panelId = useId()
  const headingId = useId()
  const [open, setOpen] = useState(false)
  if (rows.length === 0) return null

  return (
    <div className="mt-6 rounded-2xl border border-line bg-inset/80 p-4 sm:p-5">
      <button
        type="button"
        id={headingId}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <span className="flex items-center gap-2 text-sm font-black text-text">
          <Newspaper className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          Notes terrain (base de données)
        </span>
        {open ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-muted" aria-hidden />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-muted" aria-hidden />
        )}
      </button>
      <p className="mt-2 text-[11px] font-medium leading-relaxed text-muted">
        Synthèses et retours qualitatifs (table dédiée, pas le journal d’observations chiffrées). Complète les
        blocs structurés de la fiche et du pipeline intelligence — ne les remplace pas.
      </p>

      <div
        id={panelId}
        role="region"
        aria-labelledby={headingId}
        hidden={!open}
        className="mt-4 space-y-4 border-t border-line pt-4"
      >
        {rows.map((row, idx) => (
          <div key={row.id} className="space-y-3">
            {rows.length > 1 ? (
              <p className="text-[10px] font-black uppercase tracking-widest text-muted">
                Fiche {idx + 1} / {rows.length}
              </p>
            ) : null}
            {row.osint_insights?.trim() ? (
              <FieldBlock label="Contexte open source" value={row.osint_insights.trim()} tone="default" />
            ) : null}
            {row.real_world_friction?.trim() ? (
              <FieldBlock label="Friction terrain" value={row.real_world_friction.trim()} tone="warning" />
            ) : null}
            {row.community_sentiment?.trim() ? (
              <FieldBlock label="Sentiment / retours" value={row.community_sentiment.trim()} tone="muted" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
