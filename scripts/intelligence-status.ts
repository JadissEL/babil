/**
 * One-shot operator status: manifest map + queue SLO.
 * npm run intelligence:status
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { buildIntelligenceSloReport } from '../lib/intelligence-pipeline/slo-report';

function manifestStats() {
  const p = path.join(process.cwd(), 'data', 'agent-manifest-url-map.committed.json');
  const doc = JSON.parse(readFileSync(p, 'utf8')) as {
    entries: { skipped?: boolean; urlTemplate?: string }[];
  };
  const total = doc.entries.length;
  const fetchable = doc.entries.filter(
    (e) => !e.skipped && (e.urlTemplate ?? '').startsWith('https://'),
  ).length;
  const skipped = doc.entries.filter((e) => e.skipped).length;
  return { total, fetchable, skipped };
}

async function main() {
  const manifest = manifestStats();
  console.log('=== Manifest URL map ===');
  console.log(JSON.stringify(manifest, null, 2));

  try {
    const slo = await buildIntelligenceSloReport();
    console.log('\n=== Pipeline SLO ===');
    console.log(JSON.stringify(slo, null, 2));
    if (slo.alertLevel === 'critical') process.exit(1);
  } catch (e) {
    console.error('\n=== Pipeline SLO (DB unavailable) ===');
    console.error(e instanceof Error ? e.message : e);
    process.exit(2);
  }
}

main();
