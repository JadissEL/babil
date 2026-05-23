import type { IntelligenceSourceTier } from '@prisma/client';

export type DefaultSourceSeed = {
  slug: string;
  name: string;
  tier: IntelligenceSourceTier;
  baseUrl: string | null;
  licenseNote: string | null;
};

/**
 * Registre initial de sources **fiables** — à étendre (OECD, FMI, banques centrales, etc.).
 * Les connecteurs réseau doivent citer ces `slug` en `sourceId` après upsert.
 */
export const DEFAULT_INTELLIGENCE_SOURCES: DefaultSourceSeed[] = [
  {
    slug: 'world_bank_open_data',
    name: 'World Bank Open Data',
    tier: 'TIER_A_OFFICIAL',
    baseUrl: 'https://data.worldbank.org',
    licenseNote: 'CC BY 4.0 — https://www.worldbank.org/en/about/legal',
  },
  {
    slug: 'un_data',
    name: 'UN Data',
    tier: 'TIER_A_OFFICIAL',
    baseUrl: 'https://data.un.org',
    licenseNote: 'United Nations terms of use apply per dataset.',
  },
  {
    slug: 'oecd',
    name: 'OECD',
    tier: 'TIER_B_MULTILATERAL',
    baseUrl: 'https://www.oecd.org',
    licenseNote: 'OECD terms — verify per dataset.',
  },
  {
    slug: 'imf_data',
    name: 'IMF Data',
    tier: 'TIER_B_MULTILATERAL',
    baseUrl: 'https://www.imf.org/en/Data',
    licenseNote: 'IMF data terms — verify per series.',
  },
  {
    slug: 'ilo_stat',
    name: 'ILOSTAT',
    tier: 'TIER_B_MULTILATERAL',
    baseUrl: 'https://ilostat.ilo.org',
    licenseNote: 'ILO terms of use.',
  },
  {
    slug: 'babil_curated_research',
    name: 'Babil curated research (human-reviewed)',
    tier: 'TIER_C_CURATED',
    baseUrl: null,
    licenseNote:
      'Internal editorial / verified research — lower default trust than official statistics.',
  },
];
