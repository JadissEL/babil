/**
 * Run all Playwright smokes in sequence.
 * Usage: npm run test:smoke [baseUrl]
 */
import { spawnSync } from 'node:child_process';

const base = process.argv[2] ?? process.env.SMOKE_BASE_URL ?? 'http://localhost:3000';

const steps = [
  ['test:smoke:objectives', 'scripts/smoke-objective-change.mjs'],
  ['test:smoke:perspective', 'scripts/smoke-perspective-scope.mjs'],
  ['test:smoke:stitch', 'scripts/smoke-stitch-routes.mjs'],
];

for (const [label, script] of steps) {
  console.log(`\n--- ${label} ---`);
  const r = spawnSync(process.execPath, [script, base], {
    stdio: 'inherit',
    env: process.env,
  });
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}

console.log(`\nOK test:smoke (all) @ ${base}`);
