'use client'

import Link from 'next/link'
import { VisitReason } from '@/lib/country-experience-content'

type VisitReasonsSectionProps = {
  countryName: string
  reasons: VisitReason[]
  countryId?: string | number
  previewOnly?: boolean
}

export function VisitReasonsSection({
  countryName,
  reasons,
  countryId,
  previewOnly = false,
}: VisitReasonsSectionProps) {
  const maxItems = previewOnly ? 3 : 30

  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
        <h2 className="text-2xl font-black text-text">30 Reasons to Visit {countryName}</h2>
        <p className="mt-1 text-sm text-muted">
          Curated inspiration cards designed for immersive and practical trip planning.
        </p>
        </div>
        {previewOnly && countryId != null ? (
          <Link
            href={`/countries/${countryId}/reasons`}
            className="shrink-0 rounded-xl border border-line bg-[#f8f2e8] px-4 py-2 text-xs font-black uppercase tracking-widest text-text transition-colors hover:border-primary/30 hover:bg-primary-soft"
          >
            Voir tout
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reasons.slice(0, maxItems).map((reason, idx) => (
          <article
            key={reason.id}
            className="group overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card"
          >
            <div className="relative h-40 w-full overflow-hidden">
              <img
                src={reason.imageUrl}
                alt={reason.imageAlt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading={idx < 6 ? 'eager' : 'lazy'}
              />
            </div>
            <div className="space-y-2 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Reason {idx + 1}</p>
              <h3 className="text-sm font-black leading-snug text-text">{reason.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{reason.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
