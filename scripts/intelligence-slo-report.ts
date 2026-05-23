/**
 * Print intelligence pipeline SLO report (operator / CI).
 * npm run intelligence:slo-report
 */
import 'dotenv/config';
import { buildIntelligenceSloReport } from '../lib/intelligence-pipeline/slo-report';

async function main() {
  const report = await buildIntelligenceSloReport();
  console.log(JSON.stringify(report, null, 2));
  if (report.alertLevel === 'critical') process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
