/**
 * Enqueue tier-scoped specialized pipeline jobs (visa, education, travel, news).
 *
 * @example
 * npx tsx scripts/intelligence-enqueue-specialized.ts --kind visa_friction --limit 20
 * npx tsx scripts/intelligence-enqueue-specialized.ts --kind education --country-id 12
 */
import 'dotenv/config';
import prisma from '../lib/prisma';
import { assertProdWritesAllowed } from '../lib/prod-write-guard';
import {
  INTELLIGENCE_JOB_KINDS,
  type IntelligenceJobKind,
} from '../lib/intelligence-pipeline/job-kinds';
import { enqueueIntelligenceJob } from '../lib/intelligence-pipeline/enqueue-intelligence-job';

const SPECIALIZED = new Set<string>([
  INTELLIGENCE_JOB_KINDS.visa_friction,
  INTELLIGENCE_JOB_KINDS.education,
  INTELLIGENCE_JOB_KINDS.travel_signals,
  INTELLIGENCE_JOB_KINDS.news_trends,
]);

function argNumber(name: string, fallback: number): number {
  const i = process.argv.indexOf(name);
  if (i === -1 || i + 1 >= process.argv.length) return fallback;
  const n = Number(process.argv[i + 1]);
  return Number.isFinite(n) ? n : fallback;
}

function parseKind(): IntelligenceJobKind {
  const i = process.argv.indexOf('--kind');
  const raw = i >= 0 ? process.argv[i + 1] : undefined;
  if (!raw || !SPECIALIZED.has(raw)) {
    throw new Error(`--kind required: one of ${Array.from(SPECIALIZED).join(', ')}`);
  }
  return raw as IntelligenceJobKind;
}

async function main() {
  assertProdWritesAllowed('intelligence:enqueue-specialized');
  const kind = parseKind();
  const limit = argNumber('--limit', 25);
  const countryId = argNumber('--country-id', 0);
  const priority = argNumber('--priority', 35);

  const countries =
    countryId > 0
      ? await prisma.country.findMany({ where: { id: countryId }, select: { id: true } })
      : await prisma.country.findMany({
          select: { id: true },
          orderBy: { id: 'asc' },
          take: limit,
        });

  let enqueued = 0;
  for (const c of countries) {
    const payload = {
      trigger: `enqueue-specialized:${kind}`,
      countryId: c.id,
      manifestBatchSize: 14,
    };
    const out = await enqueueIntelligenceJob({ kind, payload, priority });
    if (!out.created) {
      if (out.reason === 'budget_exceeded') {
        console.warn(`[intelligence:enqueue-specialized] budget stop: ${out.message}`);
        break;
      }
      continue;
    }
    enqueued += 1;
  }

  console.log(
    `[intelligence:enqueue-specialized] kind=${kind} enqueued=${enqueued}/${countries.length}`,
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
