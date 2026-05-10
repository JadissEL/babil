import { resolveCountryLayoutMeta } from '@/lib/country-layout-meta';
import { buildCountryPageJsonLd } from '@/lib/country-page-json-ld';
import { isSchengenMember } from '@/lib/schengen-members';
import { getPublicSiteOrigin } from '@/lib/site-public-url';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

type PageParams = { id: string };

function metadataFromNameRegion(name: string, region: string, countryId: string): Metadata {
  const schengen = isSchengenMember(name);
  const title = `${name} — visa & mobilité${schengen ? ' · Schengen' : ''}`;
  const regionLabel = schengen ? `${region}, espace Schengen` : region;
  const description = `Scores visa, friction, études, business et permis pour ${name} (${regionLabel}) — perspective Maroc / VisaFlow.`;
  const base: Metadata = {
    title,
    description,
    openGraph: { title, description, locale: 'fr_FR', type: 'website' },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
  const origin = getPublicSiteOrigin();
  if (origin) {
    const canonical = `${origin}/countries/${countryId}`;
    return {
      ...base,
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
      const schengen = isSchengenMember(meta.name);
      const title = `${meta.name} — visa & mobilité${schengen ? ' · Schengen' : ''}`;
      const regionLabel = schengen ? `${meta.region}, espace Schengen` : meta.region;
      const description = `Scores visa, friction, études, business et permis pour ${meta.name} (${regionLabel}) — perspective Maroc / VisaFlow.`;
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
