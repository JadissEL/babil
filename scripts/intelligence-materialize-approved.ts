/**
 * Materialize only promotion-approved observation fields.
 * npm run intelligence:materialize-approved
 */
import 'dotenv/config';
import prisma from '../lib/prisma';
import { assertProdWritesAllowed } from '../lib/prod-write-guard';
import { materializeApprovedObservations } from '../lib/intelligence-validation';
import { checkPromotionLaunchGateSample } from '../lib/intelligence-validation/promotion-safety';

async function main() {
  assertProdWritesAllowed('intelligence:materialize-approved');
  const { materialized, report } = await materializeApprovedObservations();
  const safety = await checkPromotionLaunchGateSample({ sampleSize: 15 });
  console.log(
    `[intelligence:materialize-approved] materialized=${materialized} promotable=${report.promotable} disputed=${report.disputed}`,
  );
  console.log(
    `[intelligence:materialize-approved] launch-gate sample pass=${safety.pass} failed=${safety.failed.length}`,
  );
  if (!safety.pass) {
    console.error(
      '[intelligence:materialize-approved] launch-gate sample failures:',
      safety.failed,
    );
    process.exit(1);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
