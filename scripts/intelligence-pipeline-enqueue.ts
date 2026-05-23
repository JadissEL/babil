/**
 * C.45 — Enfile un job pipeline (traitement ultérieur par `intelligence:worker-once`).
 *
 * @example
 * npx tsx scripts/intelligence-pipeline-enqueue.ts --kind=world_bank_materialize --world-bank --materialize
 * npx tsx scripts/intelligence-pipeline-enqueue.ts --kind=stubs_only --stub-collectors
 */
import 'dotenv/config';

import prisma from '../lib/prisma';
import { assertProdWritesAllowed } from '../lib/prod-write-guard';
import { enqueueIntelligenceJob } from '../lib/intelligence-pipeline/enqueue-intelligence-job';
import {
  INTELLIGENCE_JOB_KINDS,
  type IntelligenceJobPayload,
} from '../lib/intelligence-pipeline/job-kinds';

const KINDS_WITHOUT_COLLECTOR_FLAGS = new Set<string>([
  INTELLIGENCE_JOB_KINDS.extract_manifest_batch,
  INTELLIGENCE_JOB_KINDS.manifest_fetch,
  INTELLIGENCE_JOB_KINDS.validate_and_materialize,
  INTELLIGENCE_JOB_KINDS.visa_friction,
  INTELLIGENCE_JOB_KINDS.education,
  INTELLIGENCE_JOB_KINDS.travel_signals,
  INTELLIGENCE_JOB_KINDS.news_trends,
]);

function argFlag(name: string): boolean {
  return process.argv.includes(name);
}

function argValue(prefix: string): string | undefined {
  const raw = process.argv.find((a) => a.startsWith(prefix));
  if (!raw) return undefined;
  const v = raw.slice(prefix.length);
  return v === '' ? undefined : v;
}

function argNumber(name: string): number | undefined {
  const i = process.argv.indexOf(name);
  if (i === -1 || i + 1 >= process.argv.length) return undefined;
  const n = Number(process.argv[i + 1]);
  return Number.isFinite(n) ? n : undefined;
}

async function main() {
  assertProdWritesAllowed('intelligence:enqueue-job');
  const kind = argValue('--kind=') ?? 'custom';
  const priorityRaw = argValue('--priority=');
  const priority = priorityRaw !== undefined ? Number(priorityRaw) : argNumber('--priority');
  const prioritySafe = Number.isFinite(priority) ? priority : 0;

  const payload: IntelligenceJobPayload = {
    trigger: argFlag('--cron') ? 'cron' : 'enqueue',
    worldBank: argFlag('--world-bank'),
    materializeEconomy: argFlag('--materialize'),
    worldBankLimit: argNumber('--limit'),
    stubMultilateralCollectors: argFlag('--stub-collectors'),
  };

  if (kind === INTELLIGENCE_JOB_KINDS.extract_manifest_batch) {
    payload.llmTokenBudget = Math.max(
      0,
      Number(process.env.AGENT_LLM_TOKEN_BUDGET_PER_TASK || 2000),
    );
  }

  const needsCollectorFlag = !KINDS_WITHOUT_COLLECTOR_FLAGS.has(kind);
  if (
    needsCollectorFlag &&
    !payload.worldBank &&
    !payload.materializeEconomy &&
    !payload.stubMultilateralCollectors
  ) {
    console.error(
      '[intelligence-pipeline-enqueue] specify at least one of: --world-bank, --materialize, --stub-collectors',
    );
    process.exit(1);
    return;
  }

  const out = await enqueueIntelligenceJob({ kind, payload, priority: prioritySafe });
  if (!out.created) {
    console.log(`[intelligence-pipeline-enqueue] skipped kind=${kind} reason=${out.reason}`);
    await prisma.$disconnect();
    return;
  }

  console.log(`[intelligence-pipeline-enqueue] created job id=${out.jobId} kind=${kind}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
