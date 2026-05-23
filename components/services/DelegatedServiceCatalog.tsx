import { ArrowRight, Check, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';
import {
  APPLICATION_GUARANTEE_MICRO,
  APPLICATION_GUARANTEE_SUMMARY,
  APPLICATION_GUARANTEE_TITLE,
  JOB_PACKAGES,
  UNIVERSITY_PACKAGES,
  formatPriceMad,
  type DelegatedPackage,
} from '@/lib/delegated-application-catalog';

const GOLD = '#D4A857';
const GOLD_SOFT = 'rgba(212,168,87,0.85)';
const SURFACE = '#16181F';
const SURFACE_ELEVATED = '#1B1E27';
const SHELL_BG = '#0F1117';

function PackageCard({
  pkg,
  applyQuerySuffix = '',
}: {
  pkg: DelegatedPackage;
  applyQuerySuffix?: string;
}) {
  const isRecommended = !!pkg.recommended;
  return (
    <article
      className={`flex flex-col rounded-2xl p-6 transition-all ${
        isRecommended
          ? 'shadow-[0_8px_30px_rgba(212,168,87,0.18)] ring-1 ring-[#D4A857]/45'
          : 'ring-1 ring-white/8 hover:ring-white/14'
      }`}
      style={{ backgroundColor: SURFACE }}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className="text-[10px] font-black uppercase tracking-[0.26em]"
          style={{ color: GOLD_SOFT }}
        >
          {pkg.tierLabel}
        </p>
        {isRecommended ? (
          <p
            className="inline-flex items-center rounded-full border border-[#D4A857]/55 bg-[#D4A857]/15 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.22em]"
            style={{ color: GOLD }}
          >
            Point fort
          </p>
        ) : null}
      </div>

      <h3 className="mt-6 font-serif text-xl font-black leading-tight tracking-tight text-white sm:text-2xl">
        {pkg.name}
      </h3>
      <p className="mt-3 text-sm font-medium leading-relaxed text-white/55">{pkg.tagline}</p>

      <div className="mt-6">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
          À partir de
        </p>
        <p
          className="mt-1 font-serif text-2xl font-black tracking-tight sm:text-3xl"
          style={{ color: GOLD }}
        >
          {formatPriceMad(pkg.priceMad)}
        </p>
        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
          {pkg.applicationsScope} · {pkg.turnaroundNote}
        </p>
      </div>

      <ul className="mt-6 flex-1 space-y-2.5">
        {pkg.delivers.map((line) => (
          <li
            key={line}
            className="flex gap-2.5 text-[13px] font-medium leading-relaxed text-white/75"
          >
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: GOLD }} aria-hidden />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <Link
        href={`/services/delegated-applications/apply?category=${pkg.category}&package=${encodeURIComponent(pkg.id)}${applyQuerySuffix}`}
        className={`mt-7 inline-flex items-center justify-center gap-2 rounded-md px-4 py-3 text-[11px] font-black uppercase tracking-[0.22em] transition-colors ${
          isRecommended
            ? 'bg-[#D4A857] text-[#0F1117] hover:bg-[#E8BD6A]'
            : 'border border-white/15 text-white hover:border-[#D4A857]/55 hover:text-[#D4A857]'
        }`}
      >
        Démarrer <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </article>
  );
}

function TrustItem({ icon: Icon, label }: { icon: typeof Clock; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.26em] text-white/55">
      <Icon className="h-3.5 w-3.5" style={{ color: GOLD_SOFT }} aria-hidden />
      {label}
    </span>
  );
}

export function DelegatedServiceCatalog({ applyQuerySuffix = '' }: { applyQuerySuffix?: string }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: SHELL_BG }}>
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-center">
          <p
            className="inline-flex items-center gap-2 rounded-full border border-[#D4A857]/30 bg-[#D4A857]/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.32em]"
            style={{ color: GOLD }}
          >
            <Sparkles className="h-3 w-3" aria-hidden /> Service concierge exclusif
          </p>
        </div>

        <header className="mx-auto mb-12 max-w-3xl text-center">
          <h1 className="font-serif text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl">
            Déléguez vos candidatures :{' '}
            <span className="italic" style={{ color: GOLD }}>
              Sérénité &amp; Clarté
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-relaxed text-white/55 sm:text-base">
            Un processus fluide en 3 étapes : Choisir. Décrire. Suivre. Nous nous occupons du reste
            avec la plus grande précision.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <TrustItem icon={Clock} label="Délai humain" />
            <TrustItem icon={ShieldCheck} label="Sécurité des données" />
          </div>
        </header>

        <section
          id="assist-garantie"
          aria-label="Garantie Sérénité VisaFlow"
          className="scroll-mt-28 mb-16 grid grid-cols-1 items-center gap-6 rounded-2xl p-6 ring-1 ring-[#D4A857]/15 sm:gap-10 sm:p-8 md:grid-cols-[1fr_auto]"
          style={{ backgroundColor: SURFACE_ELEVATED }}
        >
          <div>
            <p
              className="text-[10px] font-black uppercase tracking-[0.28em]"
              style={{ color: GOLD }}
            >
              Engagement d&apos;excellence
            </p>
            <h2 className="mt-3 font-serif text-2xl font-black leading-tight text-white sm:text-3xl">
              {APPLICATION_GUARANTEE_TITLE}
            </h2>
            <p
              className="mt-3 text-sm font-medium leading-relaxed text-white/65 sm:text-[15px]"
              dangerouslySetInnerHTML={{
                __html: APPLICATION_GUARANTEE_SUMMARY.replace(
                  /\*\*(.*?)\*\*/g,
                  '<strong style="color:#D4A857;font-weight:900;">$1</strong>',
                ),
              }}
            />
            <p className="mt-4 border-t border-white/8 pt-3 text-[11px] font-bold italic text-white/45">
              {APPLICATION_GUARANTEE_MICRO}
            </p>
          </div>

          <div
            aria-hidden
            className="mx-auto flex h-28 w-28 flex-col items-center justify-center rounded-full border-2 border-[#D4A857]/45 text-center"
            style={{ backgroundColor: 'rgba(212,168,87,0.07)' }}
          >
            <span
              className="font-serif text-3xl font-black leading-none tracking-tight"
              style={{ color: GOLD }}
            >
              50%
            </span>
            <span
              className="mt-1 max-w-[80px] text-[8px] font-black uppercase leading-tight tracking-[0.18em]"
              style={{ color: GOLD_SOFT }}
            >
              Remboursement garanti
            </span>
          </div>
        </section>

        <section className="mb-16" aria-label="Catégorie A : Emploi">
          <div className="mb-6">
            <h2 className="font-serif text-2xl font-black tracking-tight text-white sm:text-3xl">
              Catégorie A : Emploi
            </h2>
            <p
              className="mt-2 text-[10px] font-black uppercase tracking-[0.28em]"
              style={{ color: GOLD_SOFT }}
            >
              Délégation de candidatures professionnelles
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {JOB_PACKAGES.map((p) => (
              <PackageCard key={p.id} pkg={p} applyQuerySuffix={applyQuerySuffix} />
            ))}
          </div>
        </section>

        <section className="mb-16" aria-label="Catégorie B : Universités">
          <div className="mb-6">
            <h2 className="font-serif text-2xl font-black tracking-tight text-white sm:text-3xl">
              Catégorie B : Universités
            </h2>
            <p
              className="mt-2 text-[10px] font-black uppercase tracking-[0.28em]"
              style={{ color: GOLD_SOFT }}
            >
              Délégation de dossiers d&apos;admission académique
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {UNIVERSITY_PACKAGES.map((p) => (
              <PackageCard key={p.id} pkg={p} applyQuerySuffix={applyQuerySuffix} />
            ))}
          </div>
        </section>

        <section
          aria-label="Appel à l'action concierge"
          className="rounded-2xl p-8 text-center ring-1 ring-white/8 sm:p-10"
          style={{ backgroundColor: SURFACE_ELEVATED }}
        >
          <h2 className="font-serif text-2xl font-black tracking-tight text-white sm:text-3xl">
            Prêt à déléguer ?
          </h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#assist-garantie"
              className="inline-flex items-center justify-center rounded-md px-6 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-[#0F1117] transition-colors hover:bg-[#E8BD6A]"
              style={{ backgroundColor: GOLD }}
            >
              Sélectionner un forfait
            </a>
            <a
              href="mailto:concierge@visaflow.com?subject=Conseil%20concierge%20VisaFlow"
              className="text-[12px] font-black uppercase tracking-[0.18em] text-white/65 underline decoration-[#D4A857]/40 underline-offset-4 transition-colors hover:text-[#D4A857] hover:decoration-[#D4A857]"
            >
              Contacter un conseiller expert
            </a>
          </div>
        </section>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.22em]">
          <Link
            href="/overview#assist-requests"
            className="text-white/55 transition-colors hover:text-[#D4A857]"
          >
            ← Mes demandes (tableau de bord)
          </Link>
          <Link href="/overview" className="text-white/35 transition-colors hover:text-[#D4A857]">
            Tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}
