import { ExternalLink } from 'lucide-react'
import type { OfficialSourceLink } from '@/lib/official-sources'

type Props = {
  countryName: string
  links: OfficialSourceLink[]
  className?: string
}

export function OfficialSourcesCard({ countryName, links, className = '' }: Props) {
  if (!links.length) return null

  return (
    <section
      className={`rounded-2xl border border-primary/25 bg-primary-soft/35 p-5 shadow-card sm:rounded-[2rem] sm:p-6 ${className}`}
      aria-labelledby="official-sources-heading"
    >
      <div className="mb-4 flex flex-col gap-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Sources officielles</p>
        <h2 id="official-sources-heading" className="text-lg font-black text-text">
          Liens institutionnels — {countryName}
        </h2>
        <p className="text-xs font-medium text-muted">
          Points d’entrée publics (visa, UE, données). Complément à notre analyse ; ne remplace pas un conseil
          juridique.
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {links.map((L) => (
          <li key={L.id}>
            <a
              href={L.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 transition-colors hover:border-primary/35 hover:bg-primary-soft/50"
            >
              <ExternalLink
                className="mt-0.5 h-4 w-4 shrink-0 text-primary opacity-80 group-hover:opacity-100"
                aria-hidden
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-text">{L.label}</span>
                {L.publisher ? (
                  <span className="mt-0.5 block text-[11px] font-bold text-muted">{L.publisher}</span>
                ) : null}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
