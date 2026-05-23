/**
 * Guard destructive DB writes in CI / local unless explicitly allowed.
 */

export function assertProdWritesAllowed(context: string): void {
  if (process.env.CI !== 'true' && process.env.CI !== '1') return;
  if (process.env.ALLOW_PROD_WRITES === '1' || process.env.ALLOW_PROD_WRITES === 'true') return;
  throw new Error(
    `${context}: CI run blocked without ALLOW_PROD_WRITES=1 (set in GitHub secrets for orchestrator workflows only).`,
  );
}

export function isProdWritesAllowed(): boolean {
  if (process.env.CI !== 'true' && process.env.CI !== '1') return true;
  return process.env.ALLOW_PROD_WRITES === '1' || process.env.ALLOW_PROD_WRITES === 'true';
}
