/**
 * Sets CRON_SECRET on Vercel Production without trailing newline (Windows-safe).
 * Usage: node scripts/vercel-set-cron-secret.mjs
 * Requires: vercel CLI logged in, run from repo root.
 */
import { execSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, writeFileSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const secret = randomBytes(32).toString('hex');
const dir = mkdtempSync(join(tmpdir(), 'babil-cron-'));
const file = join(dir, 'secret.txt');

writeFileSync(file, secret, { encoding: 'utf8' });

try {
  try {
    execSync('vercel env rm CRON_SECRET production --yes', { stdio: 'inherit' });
  } catch {
    /* may not exist */
  }

  if (process.platform === 'win32') {
    execSync(`cmd /c "vercel env add CRON_SECRET production --yes --sensitive < "${file}""`, {
      stdio: 'inherit',
    });
  } else {
    execSync(`vercel env add CRON_SECRET production --yes --sensitive < "${file}"`, {
      stdio: 'inherit',
      shell: true,
    });
  }

  console.log('CRON_SECRET set on Vercel Production (value not printed). Redeploy production to apply.');
} finally {
  try {
    unlinkSync(file);
  } catch {
    /* ignore */
  }
}
