'use client'

import { VisitReason } from '@/lib/country-experience-content'

type VisitReasonsSectionProps = {
  countryName: string
  reasons: VisitReason[]
}

export function VisitReasonsSection({ countryName, reasons }: VisitReasonsSectionProps) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-text">30 Reasons to Visit {countryName}</h2>
        <p className="mt-1 text-sm text-muted">
          Curated inspiration cards designed for immersive and practical trip planning.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reasons.slice(0, 30).map((reason, idx) => (
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
