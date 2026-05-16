/**
 * Backfill `full_data.economy.gdp_usd` from World Bank WDI (NY.GDP.MKTP.CD) for launch-gate / contract coverage.
 * Rows still without a numeric GDP after API attempts get `gdp_wb_series_unavailable` (see `country-completeness` economy waiver).
 *
 *   npx tsx scripts/backfill-economy-gdp-wb.ts --dry-run
 *   npx tsx scripts/backfill-economy-gdp-wb.ts --apply
 */
import 'dotenv/config';

import { fetchWorldBankGdp } from '@/lib/agent-country-enrichment-merge';
import { parseCountryFullData } from '@/lib/country-full-data-json';
import { appendFullDataChangelog } from '@/lib/full-data-changelog';
import {
  chunkIso2ForWorldBank,
  fetchWorldBankCountryIso2Map,
  fetchWorldBankLatestDataForCountriesBatch,
  fetchWorldBankLatestDatum,
  resolveIso2ForBabilCountryName,
} from '@/lib/intelligence-pipeline/world-bank-client';
import { WORLD_BANK_INDICATORS } from '@/lib/intelligence-pipeline/taxonomy-v1';
import prisma from '@/lib/prisma';

function argFlag(name: string): boolean {
  return process.argv.includes(name);
}

function readFiniteGdp(v: unknown): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  return v;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Batch when allowed; per-ISO requests when multi-country calls fail (e.g. HTTP 403). */
async function loadGdpDatumByIso(
  uniqueIsos: string[],
  indicator: string,
): Promise<Map<string, { value: number | null; date: string }>> {
  const datumByIso = new Map<string, { value: number | null; date: string }>();

  for (const chunk of chunkIso2ForWorldBank(uniqueIsos, 40)) {
    try {
      const batch = await fetchWorldBankLatestDataForCountriesBatch(chunk, indicator);
      for (const iso of chunk) {
        const d = batch.get(iso.toLowerCase());
        if (d && typeof d.value === 'number' && Number.isFinite(d.value)) {
          datumByIso.set(iso.toLowerCase(), d);
        }
      }
      continue;
    } catch {
      for (let j = 0; j < chunk.length; j += 1) {
        const iso = chunk[j];
        const d = await fetchWorldBankLatestDatum(iso, indicator);
        if (d && typeof d.value === 'number' && Number.isFinite(d.value)) {
          datumByIso.set(iso.toLowerCase(), d);
        }
        if (j % 8 === 7) await sleep(80);
      }
    }
  }

  for (let i = 0; i < uniqueIsos.length; i += 1) {
    const iso = uniqueIsos[i].toLowerCase();
    const got = datumByIso.get(iso);
    if (got && typeof got.value === 'number' && Number.isFinite(got.value)) continue;
    const d = await fetchWorldBankLatestDatum(iso, indicator);
    if (d && typeof d.value === 'number' && Number.isFinite(d.value)) {
      datumByIso.set(iso, d);
    }
    if (i % 8 === 7) await sleep(80);
  }

  return datumByIso;
}

async function main() {
  const dryRun = argFlag('--dry-run');
  const apply = argFlag('--apply');
  if (!dryRun && !apply) {
    console.error('Specify --dry-run or --apply');
    process.exit(1);
  }

  const rows = await prisma.country.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, name: true, full_data: true },
  });

  console.log(`Loading World Bank country index… (${rows.length} DB rows)`);
  const wbMap = await fetchWorldBankCountryIso2Map();

  const isoByCountryId = new Map<number, string | null>();
  const countriesByIso = new Map<string, number[]>();
  for (const r of rows) {
    const iso2 = resolveIso2ForBabilCountryName(r.name, wbMap);
    isoByCountryId.set(r.id, iso2);
    if (iso2) {
      const k = iso2.toLowerCase();
      const list = countriesByIso.get(k) ?? [];
      list.push(r.id);
      countriesByIso.set(k, list);
    }
  }

  const uniqueIsos = Array.from(countriesByIso.keys());
  const ind = WORLD_BANK_INDICATORS.gdpUsd;

  console.log('Fetching GDP (WDI) per ISO — batch first, then per-country fallback if needed…');
  const datumByIso = await loadGdpDatumByIso(uniqueIsos, ind);

  let wouldUpdate = 0;
  let skippedHasGdp = 0;
  let nameFallback = 0;

  for (const r of rows) {
    const full = parseCountryFullData(r.full_data);
    const econ = full.economy;
    const existingGdp =
      econ !== null && typeof econ === 'object' && !Array.isArray(econ)
        ? readFiniteGdp((econ as Record<string, unknown>).gdp_usd)
        : null;
    if (existingGdp != null) {
      skippedHasGdp += 1;
      continue;
    }

    const iso2 = isoByCountryId.get(r.id);
    let gdp_usd: number | null = null;
    let year: string | null = null;

    if (iso2) {
      const d = datumByIso.get(iso2.toLowerCase());
      if (d && d.value != null && Number.isFinite(d.value)) {
        gdp_usd = d.value;
        year = d.date;
      }
    }

    if (gdp_usd == null) {
      const one = await fetchWorldBankGdp(r.name);
      if (one && typeof one.gdp_usd === 'number') {
        gdp_usd = one.gdp_usd;
        year = one.year;
        nameFallback += 1;
      }
    }

    if (gdp_usd == null) continue;

    wouldUpdate += 1;
    if (dryRun) {
      console.log(`  [dry-run] ${r.name} (id=${r.id}) → gdp_usd=${gdp_usd} year=${year ?? '—'}`);
      continue;
    }

    const nextEconomy = {
      ...(econ !== null && typeof econ === 'object' && !Array.isArray(econ)
        ? { ...(econ as Record<string, unknown>) }
        : {}),
      gdp_usd,
      year,
      source: 'worldbank',
    };
    delete (nextEconomy as Record<string, unknown>).gdp_wb_series_unavailable;
    delete (nextEconomy as Record<string, unknown>).gdp_coverage_note_fr;
    let nextFull: Record<string, unknown> = { ...full, economy: nextEconomy };
    nextFull = appendFullDataChangelog(nextFull, {
      actor: 'pipeline',
      action: 'backfill.economy_gdp_wb',
      detail: `countryId=${r.id};year=${year ?? ''}`,
    });

    await prisma.country.update({
      where: { id: r.id },
      data: { full_data: JSON.stringify(nextFull) },
    });
  }

  let waivers = 0;
  for (const r of rows) {
    const full = parseCountryFullData(r.full_data);
    const econ = full.economy;
    const existingGdp =
      econ !== null && typeof econ === 'object' && !Array.isArray(econ)
        ? readFiniteGdp((econ as Record<string, unknown>).gdp_usd)
        : null;
    if (existingGdp != null) continue;

    const eRec =
      econ !== null && typeof econ === 'object' && !Array.isArray(econ)
        ? { ...(econ as Record<string, unknown>) }
        : {};
    if (eRec.gdp_wb_series_unavailable === true) continue;

    waivers += 1;
    if (dryRun) {
      console.log(`  [dry-run] waiver: ${r.name} (id=${r.id})`);
      continue;
    }

    const nextEconomy = {
      ...eRec,
      gdp_wb_series_unavailable: true,
      gdp_coverage_note_fr:
        'Aucune série PIB distincte (World Bank WDI) pour cette entité ; ne pas comparer directement à un pays souverain.',
    };
    if (typeof eRec.source !== 'string' || !eRec.source.trim()) {
      (nextEconomy as Record<string, unknown>).source = 'worldbank_absent';
    }

    let nextFull: Record<string, unknown> = { ...full, economy: nextEconomy };
    nextFull = appendFullDataChangelog(nextFull, {
      actor: 'pipeline',
      action: 'backfill.economy_gdp_wb_waiver',
      detail: `countryId=${r.id}`,
    });

    await prisma.country.update({
      where: { id: r.id },
      data: { full_data: JSON.stringify(nextFull) },
    });
  }

  console.log(
    `\nDone — would/update: ${wouldUpdate}, already had gdp_usd: ${skippedHasGdp}, name fallbacks: ${nameFallback}, waivers: ${waivers}`,
  );
  if (dryRun) console.log('(dry-run: no DB writes)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
