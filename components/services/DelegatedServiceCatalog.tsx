import Link from 'next/link'
import { Briefcase, GraduationCap, Check, ArrowRight } from 'lucide-react'

import {
  APPLICATION_GUARANTEE_MICRO,
  APPLICATION_GUARANTEE_SUMMARY,
  APPLICATION_GUARANTEE_TITLE,
  JOB_PACKAGES,
  UNIVERSITY_PACKAGES,
  formatPriceMad,
  type DelegatedPackage,
} from '@/lib/delegated-application-catalog'

function PackageCard({ pkg }: { pkg: DelegatedPackage }) {
  return (
    <article
      className={`flex flex-col rounded-[2rem] border bg-surface p-6 shadow-soft transition-all ${
        pkg.recommended
          ? 'border-primary ring-2 ring-primary/25 shadow-card'
          : 'border-line hover:border-primary/25'
      }`}
    >
      {pkg.recommended ? (
        <p className="mb-2 inline-flex w-fit rounded-full border border-primary/40 bg-primary-soft px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
          Recommandé
        </p>
      ) : (
        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted">{pkg.tierLabel}</p>
      )}
      <h3 className="text-lg font-black text-text">{pkg.name}</h3>
      <p className="mt-2 text-xs font-medium text-muted">{pkg.tagline}</p>
      <p className="mt-5 text-2xl font-black text-primary">{formatPriceMad(pkg.priceMad)}</p>
      <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-muted">
        Portée indicative : {pkg.applicationsScope} · {pkg.turnaroundNote}
      </p>
      <ul className="mt-5 flex-1 space-y-3">
        {pkg.delivers.map((line) => (
          <li key={line} className="flex gap-2 text-sm font-medium text-text">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden /> {line}
          </li>
        ))}
      </ul>
      <Link
        href={`/services/delegated-applications/apply?category=${pkg.category}&package=${encodeURIComponent(pkg.id)}`}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-center text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-primary-hover"
      >
        Prendre ce forfait <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  )
}

function ComparisonTable({ pkgs }: { pkgs: DelegatedPackage[] }) {
  const labels = pkgs.map((p) => p.name)
  return (
    <div className="mt-10 overflow-x-auto rounded-2xl border border-line bg-[#f8f2e8]">
      <table className="w-full min-w-[520px] text-left text-xs">
        <thead>
          <tr className="border-b border-line bg-surface">
            <th className="p-3 font-black uppercase tracking-wider text-muted">Critère</th>
            {labels.map((lbl) => (
              <th key={lbl} className="border-l border-line p-3 font-black text-text">
                {lbl}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-line">
            <td className="p-3 font-bold text-muted">Investissement</td>
            {pkgs.map((p) => (
              <td key={p.id} className="border-l border-line p-3 font-black text-primary">
                {formatPriceMad(p.priceMad)}
              </td>
            ))}
          </tr>
          <tr className="border-b border-line">
            <td className="p-3 font-bold text-muted">Portée dossiers</td>
            {pkgs.map((p) => (
              <td key={p.id} className="border-l border-line p-3 font-medium text-text">
                {p.applicationsScope}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-3 font-bold text-muted">Calendrier</td>
            {pkgs.map((p) => (
              <td key={p.id} className="border-l border-line p-3 font-medium text-muted">
                {p.turnaroundNote}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function DelegatedServiceCatalog() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 pb-20 sm:px-6 lg:px-8">
      <div
        id="assist-garantie"
        className="scroll-mt-28 mb-10 rounded-[2rem] border border-emerald-500/30 bg-[#e9f9f1]/80 p-6 shadow-soft md:flex md:items-start md:gap-6"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-success/15 text-success ring-1 ring-emerald-500/35">
          <span className="text-xl font-black">50%</span>
        </div>
        <div>
          <h2 className="text-xl font-black text-text">{APPLICATION_GUARANTEE_TITLE}</h2>
          <p className="mt-2 text-sm font-medium leading-relaxed text-text">{APPLICATION_GUARANTEE_SUMMARY}</p>
          <p className="mt-3 border-t border-emerald-500/25 pt-3 text-[11px] font-bold italic text-muted">
            {APPLICATION_GUARANTEE_MICRO}
          </p>
        </div>
      </div>

      <header className="mb-12">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted">
          Assist candidatures VisaFlow · Compte utilisateur uniquement
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-text md:text-4xl">
          Déléguez vos candidatures emploi ou universités
        </h1>
        <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-muted md:text-base">
          Nous optimisons vos supports (CV, lettres, messages), structurons votre stratégie et exécutons les dépôts pour
          vous à hauteur du forfait choisi — avec transparence sur le volume et les délais.
        </p>
      </header>

      <section className="mb-20">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-primary/15 p-3 text-primary ring-1 ring-primary/30">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-text">A. Candidatures emploi</h2>
            <p className="text-sm font-medium text-muted">Progression claire : matériels → volume → exécution terrain.</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">{JOB_PACKAGES.map((p) => <PackageCard key={p.id} pkg={p} />)}</div>
        <ComparisonTable pkgs={JOB_PACKAGES} />
      </section>

      <section>
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-violet-500/15 p-3 text-violet-400 ring-1 ring-violet-500/35">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-text">B. Candidatures universitaires</h2>
            <p className="text-sm font-medium text-muted">De la lettre ciblée au pilotage multi-portails.</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {UNIVERSITY_PACKAGES.map((p) => (
            <PackageCard key={p.id} pkg={p} />
          ))}
        </div>
        <ComparisonTable pkgs={UNIVERSITY_PACKAGES} />
      </section>

      <div className="mt-16 flex flex-wrap gap-4">
        <Link
          href="/overview#assist-requests"
          className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary-hover"
        >
          ← Mes demandes (tableau de bord)
        </Link>
        <Link href="/overview" className="text-xs font-black uppercase tracking-widest text-muted hover:text-primary-hover">
          Tableau de bord
        </Link>
      </div>
    </div>
  )
}
