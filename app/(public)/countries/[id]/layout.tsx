import { buildCountryDisplayCopy, resolveCountryLayoutMeta } from '@/lib/country-layout-meta';
import { buildCountryPageJsonLd } from '@/lib/country-page-json-ld';
import { getPublicSiteOrigin } from '@/lib/site-public-url';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

type PageParams = { id: string };

function metadataFromNameRegion(name: string, region: string, countryId: string): Metadata {
  const { schengen, regionLabel, title, description } = buildCountryDisplayCopy(name, region);
  const keywords = [
    name,
    region,
    schengen ? 'Schengen' : null,
    'visa',
    'mobilité',
    'études',
    'travail',
    'business',
    'VisaFlow',
    'Maroc',
  ].filter(Boolean) as string[];

  const base: Metadata = {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      locale: 'fr_FR',
      type: 'website',
      siteName: 'VisaFlow Intelligence',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    other: {
      'vf:country-region': regionLabel,
    },
  };

  const origin = getPublicSiteOrigin();
  if (origin) {
    const canonical = `${origin}/countries/${countryId}`;
    return {
      ...base,
      metadataBase: new URL(origin),
      alternates: { canonical },
      openGraph: { ...base.openGraph, url: canonical },
    };
  }
  return base;
}

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const countryId = params.id;
  const id = Number.parseInt(countryId, 10);
  if (!Number.isFinite(id) || id < 1) {
    return {
      title: 'Fiche pays',
      description: 'Détail mobilité, visa, études et retours utilisateurs VisaFlow.',
    };
  }

  const meta = await resolveCountryLayoutMeta(id);
  if (meta) return metadataFromNameRegion(meta.name, meta.region, countryId);

  return {
    title: 'Pays introuvable',
    description: 'Cette fiche pays n’existe pas ou a été retirée.',
  };
}

export default async function CountryDetailLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: PageParams;
}) {
  const countryId = params.id;
  const id = Number.parseInt(countryId, 10);
  const origin = getPublicSiteOrigin();
  let jsonLd: ReturnType<typeof buildCountryPageJsonLd> | null = null;

  if (origin && Number.isFinite(id) && id >= 1) {
    const meta = await resolveCountryLayoutMeta(id);
    if (meta) {
      const { title, description } = buildCountryDisplayCopy(meta.name, meta.region);
      jsonLd = buildCountryPageJsonLd({
        origin,
        countryId,
        name: meta.name,
        region: meta.region,
        title,
        description,
      });
    }
  }

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
          }}
        />
      ) : null}
      {children}
    </>
  );
}
