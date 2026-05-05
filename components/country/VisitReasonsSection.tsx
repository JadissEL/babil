'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { VisitReason } from '@/lib/country-experience-content'

function VisitReasonImage({
  src,
  alt,
  seed,
  eager,
}: {
  src: string
  alt: string
  seed: string
  eager: boolean
}) {
  const fallback = useMemo(
    () => `https://picsum.photos/seed/${encodeURIComponent(seed)}/900/600`,
    [seed],
  )
  const [current, setCurrent] = useState(src)
  return (
    <img
      src={current}
      alt={alt}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      loading={eager ? 'eager' : 'lazy'}
      onError={() => {
        if (current !== fallback) setCurrent(fallback)
      }}
    />
  )
}

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
      <div className="flex min-w-0 items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 className="break-words text-2xl font-black text-text">30 raisons de visiter {countryName}</h2>
          <p className="mt-1 text-sm text-muted">
            Cartes d’inspiration pour un voyage plus immersif et plus pratique.
          </p>
        </div>
        {previewOnly && countryId != null ? (
          <Link
            href={`/countries/${countryId}/reasons`}
            className="shrink-0 rounded-xl border border-line bg-inset px-4 py-2 text-xs font-black uppercase tracking-widest text-text transition-colors hover:border-primary/30 hover:bg-primary-soft"
          >
            Voir tout
          </Link>
        ) : null}
      </div>

      <div className="grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reasons.slice(0, maxItems).map((reason, idx) => (
          <article
            key={reason.id}
            className="group flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card"
          >
            <div className="relative h-40 w-full shrink-0 overflow-hidden">
              <VisitReasonImage
                src={reason.imageUrl}
                alt={reason.imageAlt}
                seed={reason.id}
                eager={idx < 6}
              />
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Raison {idx + 1}</p>
              <h3 className="break-words text-sm font-black leading-snug text-text">{reason.title}</h3>
              <p className="break-words text-sm leading-relaxed text-muted">{reason.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
