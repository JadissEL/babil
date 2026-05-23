/**
 * Per-host circuit breaker for manifest HTTP fetches (prevents retry storms).
 */

type HostState = { failures: number; openedUntil: number };

const hostState = new Map<string, HostState>();

const FAILURE_THRESHOLD = Math.max(
  2,
  Math.floor(Number(process.env.INTELLIGENCE_FETCH_CB_THRESHOLD || 5)),
);
const COOLDOWN_MS = Math.max(
  60_000,
  Math.floor(Number(process.env.INTELLIGENCE_FETCH_CB_COOLDOWN_MS || 300_000)),
);

export function isHostCircuitOpen(hostname: string): boolean {
  const s = hostState.get(hostname);
  if (!s) return false;
  if (Date.now() < s.openedUntil) return true;
  if (s.openedUntil > 0 && Date.now() >= s.openedUntil) {
    hostState.delete(hostname);
  }
  return false;
}

export function recordFetchSuccess(hostname: string): void {
  hostState.delete(hostname);
}

export function recordFetchFailure(hostname: string): void {
  const prev = hostState.get(hostname) ?? { failures: 0, openedUntil: 0 };
  const failures = prev.failures + 1;
  if (failures >= FAILURE_THRESHOLD) {
    hostState.set(hostname, { failures, openedUntil: Date.now() + COOLDOWN_MS });
  } else {
    hostState.set(hostname, { failures, openedUntil: 0 });
  }
}

export function circuitBreakerSnapshot(): { openHosts: string[]; tracked: number } {
  const now = Date.now();
  const openHosts: string[] = [];
  for (const [host, s] of Array.from(hostState.entries())) {
    if (s.openedUntil > now) openHosts.push(host);
  }
  return { openHosts, tracked: hostState.size };
}
