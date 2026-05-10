import { FileStack, ShieldCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import {
  APPLICATION_GUARANTEE_MICRO,
  APPLICATION_GUARANTEE_TITLE,
} from '@/lib/delegated-application-catalog'

export function DelegatedApplicationsHomePromo() {
  return (
    <section className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-card md:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-[#f8f2e8] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted">
            <FileStack className="h-3.5 w-3.5 text-primary" /> Assist candidatures
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-text md:text-3xl">
            Déléguez vos candidatures emploi & universités
          </h2>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-muted md:text-base">
            Nous optimisons CV et lettres, préparons vos messages recruteurs ou admissions, et exécutons les dépôts pour
            vous selon le forfait choisi — pour vous concentrer sur la préparation des entretiens et des examens.
          </p>
          <ul className="mt-5 space-y-2 text-sm font-bold text-text">
            <li className="flex gap-2">
              <span className="text-success">✓</span> Gain de temps & exécution coordonnée
            </li>
            <li className="flex gap-2">
              <span className="text-success">✓</span> Forfaits progressifs emploi vs université
            </li>
            <li className="flex gap-2">
              <span className="text-success">✓</span> Réservé aux comptes VisaFlow
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/services/delegated-applications"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-soft hover:bg-primary-hover"
            >
              Voir catalogues & prix <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="self-center text-[10px] font-bold uppercase tracking-wider text-muted">
              Connexion requise
            </span>
          </div>
        </div>
        <div className="rounded-[1.75rem] border border-primary/30 bg-primary-soft p-6 md:p-7">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-white/70 p-2.5 ring-1 ring-primary/25">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">{APPLICATION_GUARANTEE_TITLE}</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-text">{APPLICATION_GUARANTEE_MICRO}</p>
              <p className="mt-4 text-[11px] font-bold italic text-muted">
                Le détail contractuel vous est envoyé avant validation financière · case d’acceptation obligatoire sur le
                formulaire.
              </p>
              <Link
                href="/services/delegated-applications#assist-garantie"
                className="mt-3 inline-block text-[11px] font-black uppercase tracking-wider text-primary hover:text-primary-hover"
              >
                Conditions complètes de la garantie →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
