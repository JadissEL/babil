/**
 * CI guard: freshness SLI + observation completeness on materialize paths.
 *
 * @example
 * npx tsx scripts/check-intelligence-data-quality.ts
 * npx tsx scripts/check-intelligence-data-quality.ts --fail-on-warning
 */
import 'dotenv/config';
import {
  collectIntelligenceContractSli,
  evaluateContractAlertLevel,
} from '../lib/intelligence-validation/contract-sli';
import {
  collectIntelligenceFreshnessSli,
  evaluateFreshnessAlertLevel,
} from '../lib/intelligence-pipeline/freshness-sli';
import prisma from '../lib/prisma';
import { MATERIALIZE_TARGETS } from '../lib/intelligence-pipeline/taxonomy-v1';

async function main() {
  const failOnWarning = process.argv.includes('--fail-on-warning');
  const [freshness, contract] = await Promise.all([
    collectIntelligenceFreshnessSli({ countryLimit: 250 }),
    collectIntelligenceContractSli(250),
  ]);
  const freshnessLevel = evaluateFreshnessAlertLevel(freshness);
  const contractLevel = evaluateContractAlertLevel(contract);
  const level =
    freshnessLevel === 'critical' || contractLevel === 'critical'
      ? 'critical'
      : freshnessLevel === 'warning' || contractLevel === 'warning'
        ? 'warning'
        : 'ok';

  const paths = Object.keys(MATERIALIZE_TARGETS);
  const [countriesTotal, obsRows] = await Promise.all([
    prisma.country.count(),
    prisma.countryObservation.groupBy({
      by: ['countryId'],
      where: { fieldPath: { in: paths } },
      _count: { _all: true },
    }),
  ]);

  const countriesWithObs = obsRows.length;
  const coverageRatio =
    countriesTotal > 0 ? Math.round((countriesWithObs / countriesTotal) * 1000) / 1000 : 1;

  const payload = {
    level,
    freshness,
    contract,
    contractLevel,
    observationCoverage: {
      countriesTotal,
      countriesWithMaterializeObs: countriesWithObs,
      coverageRatio,
    },
  };
  console.log(`[check-intelligence-data-quality] ${JSON.stringify(payload)}`);

  if (level === 'critical') {
    console.error('[check-intelligence-data-quality] CRITICAL: freshness SLI violated.');
    process.exitCode = 1;
  } else if (level === 'warning' && failOnWarning) {
    console.error('[check-intelligence-data-quality] WARNING (--fail-on-warning).');
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
