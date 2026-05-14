import Link from 'next/link';
import { DelegatedServiceCatalog } from '@/components/services/DelegatedServiceCatalog';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Assist candidatures — emploi & universités | VisaFlow',
  description:
    'Déléguez vos candidatures : optimisation CV, lettres de motivation et dépôts. Forfaits progressifs avec garantie 50 % remboursés si absence de résultats éligibles.',
};

function firstParam(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function DelegatedApplicationsServicePage({ searchParams }: PageProps) {
  const countryId = firstParam(searchParams.countryId)?.trim();
  const countryName = firstParam(searchParams.countryName)?.trim();
  const applyQuerySuffix =
    countryId != null && countryId !== ''
      ? `&countryId=${encodeURIComponent(countryId)}${
          countryName ? `&countryName=${encodeURIComponent(countryName)}` : ''
        }`
      : '';

  const contextLabel = countryName || (countryId ? `Pays #${countryId}` : null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0F1117' }}>
      {contextLabel ? (
        <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-6 lg:px-8">
          <div
            className="rounded-xl border border-[#D4A857]/25 bg-[#1B1E27] p-4 text-[13px] font-medium text-white/75 sm:p-5"
            role="status"
          >
            <span className="font-black uppercase tracking-[0.18em] text-[#D4A857]">
              Contexte pays.
            </span>{' '}
            Vous arrivez depuis la fiche <strong className="text-white">{contextLabel}</strong> — le
            champ « pays cibles » du formulaire peut être pré-rempli à l&apos;étape suivante.{' '}
            {countryId ? (
              <Link
                href={`/countries/${encodeURIComponent(countryId)}`}
                className="font-black text-[#D4A857] underline decoration-[#D4A857]/40 underline-offset-2 hover:decoration-[#D4A857]"
              >
                Revoir la fiche
              </Link>
            ) : null}
            {countryId ? ' · ' : null}
            <Link
              href="/services/delegated-applications"
              className="font-black text-white/55 underline decoration-white/30 underline-offset-2 hover:text-[#D4A857] hover:decoration-[#D4A857]"
            >
              Effacer le contexte
            </Link>
          </div>
        </div>
      ) : null}
      <DelegatedServiceCatalog applyQuerySuffix={applyQuerySuffix} />
    </div>
  );
}
