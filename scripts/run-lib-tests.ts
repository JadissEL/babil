/**
 * Runs all lib `*.test.ts` files with Node's test runner.
 * Expands globs explicitly so CI (Node 20) does not fail on an unexpanded glob argument.
 * One file per process avoids parallel global fetch mock flakes and Windows argv limits.
 */
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const tsxCli = join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs');

function collectTestFiles(dir: string): string[] {
  const out: string[] = [];
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...collectTestFiles(p));
    else if (ent.name.endsWith('.test.ts')) out.push(p.replace(/\\/g, '/'));
  }
  return out;
}

const files = collectTestFiles('lib').sort();
if (files.length === 0) {
  console.error('[test:lib] no *.test.ts files under lib/');
  process.exit(1);
}

let failed = false;

for (const file of files) {
  const result = spawnSync(process.execPath, [tsxCli, '--test', file], {
    stdio: 'inherit',
  });
  if (result.status !== 0) failed = true;
}

process.exit(failed ? 1 : 0);
