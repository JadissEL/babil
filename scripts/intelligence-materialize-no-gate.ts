/**
 * Materialize approved observations without launch-gate sample (ops).
 * npm run intelligence:materialize-no-gate
 */
import 'dotenv/config';
import prisma from '../lib/prisma';
import { materializeApprovedObservations } from '../lib/intelligence-validation';

async function main() {
  const { materialized, report } = await materializeApprovedObservations({ limit: 250 });
  console.log(
    `[materialize-no-gate] materialized=${materialized} promotable=${report.promotable} disputed=${report.disputed}`,
  );
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
