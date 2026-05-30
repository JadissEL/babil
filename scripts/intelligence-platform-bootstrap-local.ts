#!/usr/bin/env tsx
/**
 * Local bootstrap (prod DB): migrate, ingest datafile, taxonomy, enqueue discovery, drain once.
 * Requires DATABASE_URL. Set ALLOW_PROD_WRITES=1 when CI=true.
 */
import { execSync } from 'node:child_process';

import { drainIntelligencePipelineJobs } from '@/lib/intelligence-pipeline/worker-drain';
import { assertProdWritesAllowed } from '@/lib/prod-write-guard';

const limit = Number(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? 10);
const drainJobs = Number(process.argv.find((a) => a.startsWith('--drain='))?.split('=')[1] ?? 3);

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }
  assertProdWritesAllowed('intelligence-platform-bootstrap-local');

  execSync('npm run db:migrate-deploy', { stdio: 'inherit' });
  execSync('npm run datafile:build-master', { stdio: 'inherit' });
  execSync('npm run datafile:ingest:db', { stdio: 'inherit', env: process.env });
  execSync('npm run intelligence:classify-observations', { stdio: 'inherit', env: process.env });
  execSync(`npx tsx scripts/intelligence-enqueue-discovery-batch.ts --limit=${limit}`, {
    stdio: 'inherit',
    env: process.env,
  });

  const drain = await drainIntelligencePipelineJobs({ maxJobs: drainJobs, sleepMs: 500 });
  console.log(JSON.stringify({ limit, drain }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
