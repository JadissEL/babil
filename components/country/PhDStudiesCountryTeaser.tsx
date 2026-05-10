import { ChevronRight, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import type { PhdStudiesModel } from '@/lib/country-phd-studies'

function statusPills(meta: PhdStudiesModel['meta']) {
  const enrichment =
    meta.enrichmentStatus === 'verified'
      ? 'Vérifié'
      : meta.enrichmentStatus === 'partial'
        ? 'Partiel'
        : 'Squelette'
  const confidenceFr =
    meta.confidence === 'high' ? 'Confiance forte' : meta.confidence === 'medium' ? 'Confiance moyenne' : 'Confiance faible'
  return { enrichment, confidenceFr }
}

const pill =
  'rounded-xl border border-line bg-inset px-3 py-1.5 text-[10px] font-black uppercase tracking-widest'

/**
 * Aperçu non intrusif : toute la zone mène au guide doctoral détaillé (page dédiée).
 */
export function PhDStudiesCountryTeaser({
  countryId,
  countryName,
  model,
}: {
  countryId: string
  countryName: string
  model: PhdStudiesModel
}) {
  const href = `/countries/${countryId}/doctorat`
  const { enrichment, confidenceFr } = statusPills(model.meta)

  return (
    <section className="min-w-0" aria-labelledby="phd-teaser-heading">
      <Link
        href={href}
        className="group flex min-h-0 w-full flex-col rounded-[2.5rem] border border-line bg-surface p-6 shadow-card transition-colors hover:border-primary/35 hover:bg-primary-soft/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:p-8"
        aria-describedby="phd-teaser-desc"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted">
              Optionnel · parcours avancé
            </p>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary p-2.5 text-white shadow-soft shrink-0 group-hover:bg-primary-hover">
                <GraduationCap className="h-6 w-6" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2
                  id="phd-teaser-heading"
                  className="text-lg font-black tracking-tight text-text sm:text-xl"
                >
                  Doctorat — {countryName}
                </h2>
                <p className="mt-2 text-sm font-bold leading-snug text-text">{model.overview.headline}</p>
              </div>
            </div>
            <p id="phd-teaser-desc" className="line-clamp-3 max-w-prose text-sm font-medium leading-relaxed text-muted">
              {model.overview.executiveSummary}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-start">
            <span className={`${pill} text-text`}>{enrichment}</span>
            <span className={`${pill} text-muted`}>{confidenceFr}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          <p className="text-xs font-medium text-muted">
            Admissions, visas doctorant, financement, débouchés… tout sur une page dédiée.
          </p>
          <span className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-soft transition-colors group-hover:bg-primary-hover">
            Ouvrir le guide doctoral
            <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          </span>
        </div>
      </Link>
    </section>
  )
}
