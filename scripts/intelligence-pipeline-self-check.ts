/**
 * Offline intelligence ecosystem self-check (no DB writes).
 * Run: npm run intelligence:self-check
 */

import { execSync } from 'node:child_process';

function run(cmd: string, label: string): void {
  console.log(`\n▶ ${label}`);
  execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });
}

async function main(): Promise<void> {
  console.log('Intelligence pipeline self-check');
  run('npm run intelligence:validate-taxonomy', 'taxonomy');
  run('npm run agent:manifest-validate', 'manifest url map');
  console.log('\n✓ Self-check passed (taxonomy + manifest)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
