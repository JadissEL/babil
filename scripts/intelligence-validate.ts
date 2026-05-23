/**
 * Validate observations (consensus + verificationStatus tags).
 * npm run intelligence:validate
 */
import 'dotenv/config';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import prisma from '../lib/prisma';
import { assertProdWritesAllowed } from '../lib/prod-write-guard';
import { runIntelligenceValidation } from '../lib/intelligence-validation';

async function main() {
  assertProdWritesAllowed('intelligence:validate');
  const report = await runIntelligenceValidation();
  const outPath = path.join(process.cwd(), '.agent-state', 'intelligence-validation-report.json');
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(
    `[intelligence:validate] fields=${report.fieldsValidated} disputed=${report.disputed} promotable=${report.promotable}`,
  );
  console.log(`[intelligence:validate] report → ${outPath}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
