import { tryLoadWorldCountryRunOrderFile } from '../lib/agent-world-country-order';

function inferRegion(raw: string): string {
  const v = String(raw || 'Other');
  if (v === 'Europe') return 'Europe';
  if (v === 'Asia') return 'Asia';
  if (v === 'Africa') return 'Africa';
  if (v === 'Americas') return 'Americas';
  if (v === 'Oceania') return 'Oceania';
  return 'Other';
}

/** Fallback HTTP seed when `data/world-country-run-order.json` is absent or empty. */
export async function fetchCountriesSeed(): Promise<Array<{ country: string; region: string }>> {
  const res = await fetch('https://restcountries.com/v3.1/all?fields=name,region');
  if (!res.ok) throw new Error(`restcountries ${res.status}`);
  const data = (await res.json()) as Array<{ name?: { common?: string }; region?: string }>;
  return data
    .map((c) => ({
      country: String(c.name?.common || '').trim(),
      region: inferRegion(String(c.region || 'Other')),
    }))
    .filter((c) => c.country.length > 0);
}

/** Ordre fichier monde si présent, sinon API restcountries. */
export async function resolveScheduleSeeds(): Promise<Array<{ country: string; region: string }>> {
  const fileOrder = await tryLoadWorldCountryRunOrderFile();
  if (fileOrder?.length) return fileOrder;
  return fetchCountriesSeed();
}
