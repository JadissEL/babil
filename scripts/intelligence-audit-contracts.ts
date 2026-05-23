/**
 * Sample recent observations against data contracts (CI / ops).
 *
 * @example
 * npx tsx scripts/intelligence-audit-contracts.ts
 * npx tsx scripts/intelligence-audit-contracts.ts --fail-on-warning
 */
import 'dotenv/config';
import {
  collectIntelligenceContractSli,
  evaluateContractAlertLevel,
} from '../lib/intelligence-validation/contract-sli';

async function main() {
  const failOnWarning = process.argv.includes('--fail-on-warning');
  const contract = await collectIntelligenceContractSli(300);
  const level = evaluateContractAlertLevel(contract);
  console.log(`[intelligence-audit-contracts] ${JSON.stringify({ level, contract })}`);

  if (level === 'critical') {
    console.error('[intelligence-audit-contracts] CRITICAL: contract violation rate too high.');
    process.exitCode = 1;
  } else if (level === 'warning' && failOnWarning) {
    console.error('[intelligence-audit-contracts] WARNING (--fail-on-warning).');
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
