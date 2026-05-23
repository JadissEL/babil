/**
 * Canary redrive transient dead-letter jobs (max 3 by default).
 * npm run intelligence:dlq-canary-redrive
 */
import 'dotenv/config';
import { redriveDeadLetterCanary } from '../lib/intelligence-pipeline/dlq-canary-redrive';

async function main() {
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : 3;
  const out = await redriveDeadLetterCanary({ limit: Number.isFinite(limit) ? limit : 3 });
  console.log(`[intelligence:dlq-canary-redrive] ${JSON.stringify(out)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
