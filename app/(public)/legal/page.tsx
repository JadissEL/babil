'use client';

import {
  Building2,
  CheckCircle2,
  CookieIcon,
  FileText,
  Mail,
  ScrollText,
  Server,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { openCookiePreferences } from '@/components/cookies/CookieConsentBanner';
import { NEXUS_FOCUS_VISIBLE, NEXUS_FOCUS_VISIBLE_ON_INK_SOLID, NEXUS_TRANSITION } from '@/lib/nexus-chrome';
import { cn } from '@/lib/utils';

const INK = '#0D1B3E';
const INK_10 = 'rgba(13,27,62,0.10)';
const INK_60 = 'rgba(13,27,62,0.60)';
const ACCENT = '#3B7DFF';
const ACCENT_SOFT = 'rgba(59,125,255,0.12)';

const UPDATED_AT_FR = '15 Octobre 2024';

type Section = {
  id: string;
  shortLabel: string;
  title: string;
  numero: string;
};

const SECTIONS: Section[] = [
  { id: 'mentions', shortLabel: 'Mentions Légales', title: 'Mentions Légales', numero: '01' },
  {
    id: 'confidentialite',
    shortLabel: 'Politique de Confidentialité',
    title: 'Politique de Confidentialité',
    numero: '02',
  },
  { id: 'cookies', shortLabel: 'Gestion des Cookies', title: 'Gestion des Cookies', numero: '03' },
  { id: 'cgu', shortLabel: 'CGU', title: "Conditions Générales d'Utilisation", numero: '04' },
];

function SectionHeading({ section }: { section: Section }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-full font-mono text-[11px] font-black"
        style={{ backgroundColor: ACCENT_SOFT, color: ACCENT }}
        aria-hidden
      >
        {section.numero}
      </span>
      <h2 className="font-serif text-[26px] font-black leading-tight tracking-tight text-[#0D1B3E] sm:text-[30px]">
        {section.title}
      </h2>
    </div>
  );
}

function CheckBullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-[14px] leading-relaxed text-[#0D1B3E]/75">
      <CheckCircle2
        className="mt-0.5 h-4 w-4 shrink-0"
        style={{ color: ACCENT }}
        aria-hidden
      />
      <span>{children}</span>
    </li>
  );
}

function CookieRow({
  name,
  purpose,
  duration,
  optional,
}: {
  name: string;
  purpose: string;
  duration: string;
  optional: boolean;
}) {
  return (
    <tr className="border-t" style={{ borderColor: INK_10 }}>
      <td className="px-4 py-3 font-mono text-[12px] font-bold text-[#0D1B3E]">{name}</td>
      <td className="px-4 py-3 text-[13px] text-[#0D1B3E]/75">{purpose}</td>
      <td className="px-4 py-3 text-[13px] text-[#0D1B3E]/75">{duration}</td>
      <td className="px-4 py-3 text-[12px]">
        <span
          className={
            optional
              ? 'inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 font-mono font-black uppercase tracking-[0.18em] text-amber-700'
              : 'inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 font-mono font-black uppercase tracking-[0.18em] text-emerald-700'
          }
        >
          {optional ? 'Opt-in' : 'Essentiel'}
        </span>
      </td>
    </tr>
  );
}

export default function LegalPage() {
  const [activeId, setActiveId] = useState<string>('mentions');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const headings = SECTIONS.map((s) =>
      typeof document !== 'undefined' ? document.getElementById(s.id) : null,
    ).filter((el): el is HTMLElement => !!el);
    if (headings.length === 0) return undefined;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.intersectionRatio > b.intersectionRatio ? -1 : 1));
        if (visible.length > 0) {
          const id = (visible[0].target as HTMLElement).id;
          if (id) setActiveId(id);
        }
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.2, 0.5, 1] },
    );
    headings.forEach((h) => obs.observe(h));
    return () => obs.disconnect();
  }, []);

  const tocItems = useMemo(() => SECTIONS, []);

  return (
    <div className="min-h-screen bg-[#FAF7EE] text-[#0D1B3E]">
      <div
        ref={containerRef}
        className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[260px_1fr] lg:px-8 lg:py-16"
      >
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div
            className="rounded-2xl border bg-[#F5F0E3] p-5"
            style={{ borderColor: INK_10 }}
          >
            <p className="mb-4 font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/55">
              Sommaire légal
            </p>
            <ol className="flex flex-col gap-1">
              {tocItems.map((item) => {
                const active = activeId === item.id;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      aria-current={active ? 'true' : undefined}
                      className={cn(
                        NEXUS_FOCUS_VISIBLE,
                        NEXUS_TRANSITION,
                        active
                          ? 'block rounded-md bg-white px-3 py-2 text-[13px] font-semibold text-[#0D1B3E] shadow-[inset_3px_0_0_0_#0D1B3E]'
                          : 'block rounded-md px-3 py-2 text-[13px] font-medium text-[#0D1B3E]/65 hover:bg-white/60 hover:text-[#0D1B3E]',
                      )}
                    >
                      {item.shortLabel}
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        </aside>

        <article className="min-w-0">
          <header className="mb-8 space-y-4">
            <span
              className="inline-flex items-center rounded-full border px-3 py-1 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/65"
              style={{ borderColor: INK_10, backgroundColor: 'white' }}
            >
              Mise à jour : {UPDATED_AT_FR}
            </span>
            <h1 className="font-serif text-[clamp(2.2rem,4.5vw,3rem)] font-black leading-[1.05] tracking-tight text-[#0D1B3E]">
              Mentions Légales &amp;<br className="hidden sm:block" />
              Confidentialité
            </h1>
            <p className="max-w-2xl text-[15px] leading-relaxed text-[#0D1B3E]/70">
              Ce document définit les conditions d&apos;utilisation et la politique de traitement des
              données de VisaFlow Intelligence. Veuillez lire attentivement ces dispositions.
            </p>
          </header>

          <section id="mentions" className="scroll-mt-28 space-y-6 pb-12">
            <SectionHeading section={SECTIONS[0]} />
            <p className="text-[14px] leading-relaxed text-[#0D1B3E]/75">
              Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance
              dans l&apos;économie numérique, il est précisé aux utilisateurs du site VisaFlow
              l&apos;identité des différents intervenants dans le cadre de sa réalisation et de son
              suivi.
            </p>

            <div
              className="rounded-2xl border bg-white p-6 shadow-[0_1px_2px_rgba(13,27,62,0.04)]"
              style={{ borderColor: INK_10 }}
            >
              <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[#0D1B3E]/80">
                <Building2 className="h-4 w-4" style={{ color: ACCENT }} aria-hidden />
                Éditeur du site
              </div>
              <dl className="grid grid-cols-1 gap-y-2 text-[14px] text-[#0D1B3E]/85 sm:grid-cols-[180px_1fr] sm:gap-x-6">
                <dt className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/55">
                  Société
                </dt>
                <dd className="font-semibold">VisaFlow Intelligence SAS</dd>
                <dt className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/55">
                  Capital social
                </dt>
                <dd>100 000 €</dd>
                <dt className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/55">
                  RCS
                </dt>
                <dd>Paris B 123 456 789</dd>
                <dt className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/55">
                  Directeur de publication
                </dt>
                <dd>JADISS EL ANTAKI</dd>
                <dt className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/55">
                  Contact
                </dt>
                <dd>
                  <a
                    href="mailto:contact@visaflow.com"
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-sm text-[#0D1B3E] underline-offset-2 hover:underline',
                      NEXUS_FOCUS_VISIBLE,
                      NEXUS_TRANSITION,
                    )}
                  >
                    <Mail className="h-3.5 w-3.5" aria-hidden />
                    contact@visaflow.com
                  </a>
                </dd>
              </dl>
            </div>

            <div
              className="rounded-2xl border bg-white p-6"
              style={{ borderColor: INK_10 }}
            >
              <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[#0D1B3E]/80">
                <Server className="h-4 w-4" style={{ color: ACCENT }} aria-hidden />
                Hébergement
              </div>
              <p className="text-[14px] leading-relaxed text-[#0D1B3E]/75">
                Le site est hébergé par <strong>Vercel Inc.</strong> (340 S Lemon Ave #4133, Walnut,
                CA 91789, USA) pour le front-end Next.js et <strong>Render Services Inc.</strong>{' '}
                pour les services applicatifs internes. La base de données relationnelle est opérée
                par <strong>Neon Inc.</strong> sur infrastructure PostgreSQL managée.
              </p>
            </div>
          </section>

          <section id="confidentialite" className="scroll-mt-28 space-y-6 pb-12">
            <SectionHeading section={SECTIONS[1]} />
            <p className="text-[14px] leading-relaxed text-[#0D1B3E]/75">
              VisaFlow s&apos;engage à ce que la collecte et le traitement de vos données, effectués
              à partir de notre plateforme, soient conformes au règlement général sur la protection
              des données (RGPD) et à la loi Informatique et Libertés.
            </p>

            <div>
              <h3 className="mb-3 font-serif text-[18px] font-black text-[#0D1B3E]">
                Collecte des Données
              </h3>
              <p className="mb-3 text-[14px] leading-relaxed text-[#0D1B3E]/75">
                Nous collectons les données suivantes dans le cadre de l&apos;utilisation de nos
                services de comparaison et d&apos;intelligence :
              </p>
              <ul className="space-y-2">
                <CheckBullet>Données d&apos;identification (nom, prénom, adresse email).</CheckBullet>
                <CheckBullet>
                  Données de connexion et d&apos;utilisation du terminal de recherche.
                </CheckBullet>
                <CheckBullet>Historique des requêtes d&apos;intelligence économique.</CheckBullet>
                <CheckBullet>
                  Champs de profil mobilité (objectif, langues, budget) saisis volontairement.
                </CheckBullet>
                <CheckBullet>
                  Pièces de dossier soumises via le formulaire d&apos;application déléguée
                  (uniquement pour le traitement de votre demande).
                </CheckBullet>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 font-serif text-[18px] font-black text-[#0D1B3E]">
                Sous-traitants techniques
              </h3>
              <p className="mb-3 text-[14px] leading-relaxed text-[#0D1B3E]/75">
                Les données peuvent transiter par les sous-traitants suivants, dans le strict cadre
                des finalités décrites&nbsp;:
              </p>
              <ul className="space-y-2">
                <CheckBullet>
                  <strong>Clerk Inc.</strong> — authentification, sessions, gestion des comptes.
                </CheckBullet>
                <CheckBullet>
                  <strong>Vercel Inc.</strong> — hébergement front-end, edge runtime, analytics.
                </CheckBullet>
                <CheckBullet>
                  <strong>Render &amp; Neon</strong> — infrastructure applicative et base de données.
                </CheckBullet>
                <CheckBullet>
                  <strong>Sentry</strong> — collecte d&apos;erreurs anonymisée pour fiabiliser le
                  service.
                </CheckBullet>
              </ul>
            </div>

            <div
              className="rounded-2xl border p-5"
              style={{ borderColor: INK_10, backgroundColor: ACCENT_SOFT }}
            >
              <div className="mb-2 flex items-center gap-2 text-[13px] font-semibold" style={{ color: ACCENT }}>
                <ShieldCheck className="h-4 w-4" aria-hidden />
                Vos droits RGPD
              </div>
              <p className="text-[14px] leading-relaxed text-[#0D1B3E]/80">
                Vous pouvez exercer vos droits d&apos;accès, de rectification, d&apos;opposition,
                d&apos;effacement et de portabilité depuis votre{' '}
                <Link
                  href="/profile"
                  className={cn(
                    'rounded-sm underline-offset-2 hover:underline',
                    NEXUS_FOCUS_VISIBLE,
                    NEXUS_TRANSITION,
                  )}
                >
                  espace profil
                </Link>{' '}
                — un export JSON RGPD complet est disponible via la section
                «&nbsp;Confidentialité&nbsp;» du profil. Pour toute question complémentaire&nbsp;:{' '}
                <a
                  href="mailto:dpo@visaflow.com"
                  className={cn(
                    'rounded-sm font-semibold text-[#0D1B3E] underline-offset-2 hover:underline',
                    NEXUS_FOCUS_VISIBLE,
                    NEXUS_TRANSITION,
                  )}
                >
                  dpo@visaflow.com
                </a>
                .
              </p>
            </div>

            <p className="text-[13px] leading-relaxed text-[#0D1B3E]/60">
              Pour comprendre la nature des champs intelligence affichés sur les fiches pays,
              consultez le{' '}
              <Link
                href="/intelligence-fieldpaths"
                className={cn(
                  'rounded-sm underline-offset-2 hover:underline',
                  NEXUS_FOCUS_VISIBLE,
                  NEXUS_TRANSITION,
                )}
              >
                glossaire des field paths
              </Link>{' '}
              (PAGE 32).
            </p>
          </section>

          <section id="cookies" className="scroll-mt-28 space-y-6 pb-12">
            <SectionHeading section={SECTIONS[2]} />
            <p className="text-[14px] leading-relaxed text-[#0D1B3E]/75">
              Le site VisaFlow utilise un nombre restreint de cookies pour permettre la session
              utilisateur et mesurer l&apos;usage produit. Vous pouvez à tout moment modifier vos
              préférences via le bouton ci-dessous.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full overflow-hidden rounded-2xl border bg-white" style={{ borderColor: INK_10 }}>
                <thead className="bg-[#F5F0E3]">
                  <tr>
                    <th className="px-4 py-3 text-left font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65">
                      Nom
                    </th>
                    <th className="px-4 py-3 text-left font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65">
                      Finalité
                    </th>
                    <th className="px-4 py-3 text-left font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65">
                      Durée
                    </th>
                    <th className="px-4 py-3 text-left font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <CookieRow
                    name="__clerk_session"
                    purpose="Authentification — maintien de la session utilisateur."
                    duration="Session"
                    optional={false}
                  />
                  <CookieRow
                    name="vf.cookies.v1"
                    purpose="Mémorise votre choix de consentement cookies."
                    duration="12 mois"
                    optional={false}
                  />
                  <CookieRow
                    name="vf.objective.v1"
                    purpose="Mémorise l'objectif de mobilité sélectionné pour personnaliser l'UI."
                    duration="6 mois"
                    optional={false}
                  />
                  <CookieRow
                    name="_vercel_speed_insights"
                    purpose="Mesure anonyme de performance et Web Vitals."
                    duration="24 mois"
                    optional
                  />
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={() => openCookiePreferences()}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl bg-[#0D1B3E] px-4 py-2.5 text-[12px] font-bold text-white hover:bg-[#0D1B3E]/90',
                NEXUS_TRANSITION,
                NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
              )}
            >
              <CookieIcon className="h-3.5 w-3.5" aria-hidden />
              Gérer mes préférences cookies
            </button>
          </section>

          <section id="cgu" className="scroll-mt-28 space-y-6 pb-16">
            <SectionHeading section={SECTIONS[3]} />
            <p className="text-[14px] leading-relaxed text-[#0D1B3E]/75">
              L&apos;accès et l&apos;utilisation du terminal VisaFlow valent acceptation des présentes
              Conditions Générales d&apos;Utilisation. VisaFlow Intelligence fournit un outil
              d&apos;aide à la décision&nbsp;: les contenus présentés ne constituent pas un avis
              juridique ni une garantie de résultat sur un dossier d&apos;immigration.
            </p>

            <div>
              <h3 className="mb-3 font-serif text-[18px] font-black text-[#0D1B3E]">
                Engagements utilisateur
              </h3>
              <ul className="space-y-2">
                <CheckBullet>
                  Utiliser le service à des fins personnelles et professionnelles légitimes.
                </CheckBullet>
                <CheckBullet>
                  Ne pas tenter de contourner les protections techniques, les quotas, ou
                  l&apos;authentification Clerk.
                </CheckBullet>
                <CheckBullet>
                  Fournir des informations exactes lors de la soumission de dossiers délégués.
                </CheckBullet>
                <CheckBullet>
                  Respecter les droits d&apos;auteur sur les contenus éditoriaux affichés (citations
                  voyageurs, fiches pays).
                </CheckBullet>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 font-serif text-[18px] font-black text-[#0D1B3E]">
                Limitation de responsabilité
              </h3>
              <p className="text-[14px] leading-relaxed text-[#0D1B3E]/75">
                Les données intelligence (scores, sources officielles, observations) proviennent de
                pipelines automatisés et de sources publiques agrégées. Bien que nous fassions tous
                nos efforts pour garantir leur fraîcheur et leur exactitude, VisaFlow ne peut
                garantir l&apos;absence d&apos;erreur ou d&apos;omission. Toute décision de mobilité
                doit faire l&apos;objet d&apos;une validation auprès des autorités consulaires
                compétentes.
              </p>
            </div>

            <div
              className="flex items-start gap-3 rounded-2xl border bg-white p-5"
              style={{ borderColor: INK_10 }}
            >
              <FileText className="mt-0.5 h-5 w-5 shrink-0" style={{ color: ACCENT }} aria-hidden />
              <p className="text-[13px] leading-relaxed text-[#0D1B3E]/75">
                Pour signaler un litige ou une demande contractuelle&nbsp;:{' '}
                <a
                  href="mailto:legal@visaflow.com"
                  className={cn(
                    'rounded-sm font-semibold text-[#0D1B3E] underline-offset-2 hover:underline',
                    NEXUS_FOCUS_VISIBLE,
                    NEXUS_TRANSITION,
                  )}
                >
                  legal@visaflow.com
                </a>
                . Les présentes CGU sont régies par le droit français&nbsp;; tout litige relèvera des
                tribunaux compétents de Paris, sauf disposition impérative contraire.
              </p>
            </div>
          </section>

          <footer
            className="flex items-center gap-3 border-t pt-6 text-[12px] text-[#0D1B3E]/55"
            style={{ borderColor: INK_10 }}
          >
            <ScrollText className="h-3.5 w-3.5" aria-hidden style={{ color: INK_60 }} />
            Document maintenu par l&apos;équipe Légal &amp; Confidentialité — version du{' '}
            {UPDATED_AT_FR}.
          </footer>
        </article>
      </div>
    </div>
  );
}
