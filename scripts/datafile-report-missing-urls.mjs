#!/usr/bin/env node
/**
 * Report sources without baseUrl (excluding procedural / skipped tiers).
 * Usage: npm run datafile:report-urls [-- --csv]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MASTER = path.join(ROOT, 'datafile', 'sources.master.json');
const asCsv = process.argv.includes('--csv');

const master = JSON.parse(fs.readFileSync(MASTER, 'utf8'));
const missing = (master.sources ?? []).filter(
  (s) =>
    !s.baseUrl &&
    s.requiresDiscoveryGate !== false &&
    s.notes !== 'procedural_no_fetch' &&
    !String(s.notes ?? '').startsWith('tier_skipped:'),
);

if (asCsv) {
  console.log('id,name,categoryId,tier');
  for (const s of missing) {
    const line = [s.id, s.name, s.categoryId ?? '', s.tier]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`)
      .join(',');
    console.log(line);
  }
} else {
  console.log(`Missing baseUrl: ${missing.length} / ${master.sources?.length ?? 0}`);
  for (const s of missing.slice(0, 50)) {
    console.log(`  ${s.id}\t${s.name}`);
  }
  if (missing.length > 50) console.log(`  ... and ${missing.length - 50} more`);
}
