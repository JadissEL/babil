import { loadFallbackCountries } from '@/lib/countries-fallback';
import { getMergedCountriesListCached } from '@/lib/countries-prisma-merge';
import prisma from '@/lib/prisma';

export type CountryLayoutMeta = { name: string; region: string };

/**
 * Resolves display name/region for a country id (DB → merged list → static fallback).
 * Shared by country layout metadata and JSON-LD.
 */
export async function resolveCountryLayoutMeta(id: number): Promise<CountryLayoutMeta | null> {
  if (!Number.isFinite(id) || id < 1) return null;

  try {
    const country = await prisma.country.findUnique({
      where: { id },
      select: { name: true, region: true },
    });
    if (country) return country;
  } catch {
    /* DB error — fall through */
  }

  try {
    const merged = await getMergedCountriesListCached();
    const row = merged.find((c) => c.id === id);
    if (row) return { name: row.name, region: row.region };
  } catch {
    /* ignore */
  }

  try {
    const fallback = await loadFallbackCountries();
    const row = fallback.find((c) => c.id === id);
    if (row) return { name: row.name, region: row.region };
  } catch {
    /* ignore */
  }

  return null;
}
