/**
 * Drain IntelligencePipelineJob queue until empty or max iterations.
 * Run on Render alongside agents (or standalone cron).
 */
import 'dotenv/config';

import { drainIntelligencePipelineJobs } from '../lib/intelligence-pipeline/worker-drain';

function argNumber(name: string, fallback: number): number {
  const i = process.argv.indexOf(name);
  if (i === -1 || i + 1 >= process.argv.length) return fallback;
  const n = Number(process.argv[i + 1]);
  return Number.isFinite(n) ? n : fallback;
}

async function main() {
  const maxJobs = argNumber('--max-jobs', 5);
  const sleepMs = argNumber('--sleep-ms', 2000);
  const { processed, failed } = await drainIntelligencePipelineJobs({ maxJobs, sleepMs });
  console.log(`[intelligence:worker-loop] processed=${processed} failed=${failed}`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
