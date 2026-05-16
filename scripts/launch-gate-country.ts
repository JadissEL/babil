/**
 * Exhaustive launch gate report for all Country rows.
 *
 * **Two modes**
 * - **Default** (`npx tsx scripts/launch-gate-country.ts`): evaluates **raw Prisma `full_data`**
 *   with **agent provenance** (`_agent`, coverage manifest). Use after enrichment loops;
 *   a sparse seed DB will typically FAIL until agents/admin have materialized contract fields.
 * - **Public Morocco launch bar** (`--as-public`): merges **`data/countries.json`** onto each row
 *   (same path as public country payloads), hydrates Morocco pack defaults, **skips**
 *   `_agent` provenance checks, and **does not fail on `criticalMissing`** (score + Morocco
 *   pack version remain enforced — matches static seed / CI).
 *
 * Usage:
 *   npx tsx scripts/launch-gate-country.ts
 *   npx tsx scripts/launch-gate-country.ts --csv
 *   npx tsx scripts/launch-gate-country.ts --as-public
 *   npx tsx scripts/launch-gate-country.ts --as-public --fail
 *   npx tsx scripts/launch-gate-country.ts --skip-agent-provenance
 */
import 'dotenv/config';

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loadFallbackCountries } from '../lib/countries-fallback';
import { augmentCountryDetailPayload } from '../lib/country-detail-payload-augment';
import { parseCountryFullData } from '../lib/country-full-data-json';
import { evaluateLaunchGate, LAUNCH_GATE_DEFAULT_MIN_COMPLETENESS } from '../lib/launch-gate';
import { hydrateFullDataMoroccoLaunchDefaults } from '../lib/morocco-research-pack-scaffold';
import prisma from '../lib/prisma';

function argNumber(name: string, fallback: number): number {
  const raw = process.argv.find((a) => a.startsWith(`${name}=`));
  if (!raw) return fallback;
  const n = Number(raw.split('=')[1]);
  return Number.isFinite(n) ? n : fallback;
}

async function main() {
  const min = argNumber('--min', LAUNCH_GATE_DEFAULT_MIN_COMPLETENESS);
  const asCsv = process.argv.includes('--csv');
  const shouldFail = process.argv.includes('--fail');
  const asPublic = process.argv.includes('--as-public');
  const skipAgentProvenance = process.argv.includes('--skip-agent-provenance') || asPublic;

  const rows = await prisma.country.findMany({
    orderBy: { id: 'asc' },
  });

  const fallback = asPublic ? await loadFallbackCountries() : null;

  const results = rows.map((r) => {
    let merged = r;
    let full = parseCountryFullData(r.full_data);

    if (asPublic && fallback) {
      const aug = augmentCountryDetailPayload(r as unknown as Record<string, unknown>, fallback);
      merged = aug as unknown as (typeof rows)[number];
      full = hydrateFullDataMoroccoLaunchDefaults(aug.full_data as Record<string, unknown>);
    }

    return evaluateLaunchGate(
      {
        id: merged.id,
        name: merged.name,
        region: merged.region,
        schengen_flag: merged.schengen_flag,
        tourist_visa_score: merged.tourist_visa_score,
        study_visa_score: merged.study_visa_score,
        work_visa_score: merged.work_visa_score,
        business_visa_score: merged.business_visa_score,
        appointment_difficulty: merged.appointment_difficulty,
        full_data: full,
      },
      {
        minCompleteness: min,
        requireAgentProvenance: !skipAgentProvenance,
        ignoreCriticalMissing: asPublic,
      },
    );
  });

  const passed = results.filter((x) => x.pass).length;
  const failed = results.length - passed;

  console.log(
    `=== Launch gate (min ${min}%; as-public=${asPublic}; agent-provenance=${!skipAgentProvenance}) ===\n`,
  );
  console.log(`Countries: ${results.length}`);
  console.log(`PASS: ${passed}`);
  console.log(`FAIL: ${failed}`);
  console.log('');

  if (asCsv) {
    const lines = [
      'id,name,pass,completeness_score,critical_missing,reasons',
      ...results.map((g) => {
        const crit = g.criticalMissingKeys.join('|');
        const reasons = g.reasons.join(';').replace(/"/g, '""');
        return `${g.countryId ?? ''},"${g.countryName.replace(/"/g, '""')}",${g.pass ? '1' : '0'},${g.completenessScore},"${crit}","${reasons}"`;
      }),
    ];
    const outDir = join(process.cwd(), 'tmp');
    try {
      mkdirSync(outDir, { recursive: true });
    } catch {
      /* exists */
    }
    const outPath = join(outDir, `launch-gate-${new Date().toISOString().slice(0, 10)}.csv`);
    writeFileSync(outPath, lines.join('\n'), 'utf8');
    console.log(`Wrote ${outPath}`);
  }

  if (failed > 0) {
    console.log('--- First failures (max 25) ---\n');
    for (const g of results.filter((x) => !x.pass).slice(0, 25)) {
      console.log(`${g.countryName} (id=${g.countryId}): ${g.reasons.join(' ; ')}`);
    }
  }

  if (shouldFail && failed > 0) {
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
