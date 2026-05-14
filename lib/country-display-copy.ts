import { isSchengenMember } from '@/lib/schengen-members';

export type CountryDisplayCopy = {
  schengen: boolean;
  regionLabel: string;
  title: string;
  description: string;
};

/**
 * Single source of truth for the visible copy bound to a country segment.
 * Used by `generateMetadata`, the JSON-LD builder, and any future surface
 * (sitemap, OG card generator) to prevent drift between layers.
 *
 * Pure: no Prisma, React or filesystem imports — safe to unit-test under
 * `node:test`.
 */
export function buildCountryDisplayCopy(name: string, region: string): CountryDisplayCopy {
  const schengen = isSchengenMember(name);
  const regionLabel = schengen ? `${region}, espace Schengen` : region;
  const title = `${name} — visa & mobilité${schengen ? ' · Schengen' : ''}`;
  const description = `Scores visa, friction, études, business et permis pour ${name} (${regionLabel}) — perspective Maroc / VisaFlow.`;
  return { schengen, regionLabel, title, description };
}
