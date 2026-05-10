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
    <>
      {contextLabel ? (
        <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
          <div
            className="rounded-2xl border border-primary/30 bg-primary-soft/40 p-4 text-sm font-medium text-text shadow-soft sm:rounded-[2rem] sm:p-5"
            role="status"
          >
            <span className="font-black text-primary">Contexte pays.</span> Vous arrivez depuis la
            fiche <strong>{contextLabel}</strong> — le champ « pays cibles » du formulaire peut être
            pré-rempli à l’étape suivante.{' '}
            {countryId ? (
              <Link
                href={`/countries/${encodeURIComponent(countryId)}`}
                className="font-black text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
              >
                Revoir la fiche
              </Link>
            ) : null}
            {countryId ? ' · ' : null}
            <Link
              href="/services/delegated-applications"
              className="font-black text-muted underline decoration-muted/50 underline-offset-2 hover:text-primary hover:decoration-primary"
            >
              Effacer le contexte
            </Link>
          </div>
        </div>
      ) : null}
      <DelegatedServiceCatalog applyQuerySuffix={applyQuerySuffix} />
    </>
  );
}
