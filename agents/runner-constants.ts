import path from 'node:path';

export const STATE_DIR = path.join(process.cwd(), '.agent-state');
export const STATE_FILE = path.join(STATE_DIR, 'tasks.json');

export const TICK_MS = Number(process.env.AGENT_TICK_MS || 30_000);
export const REFRESH_MS = Number(process.env.AGENT_REFRESH_MS || 6 * 60 * 60 * 1000);
export const WORKER_BATCH = Number(process.env.AGENT_WORKER_BATCH || 1);
export const TASK_TTL_HOURS = Number(process.env.AGENT_TASK_TTL_HOURS || 72);
export const RETRY_BASE_DELAY_MS = Number(process.env.AGENT_RETRY_BASE_DELAY_MS || 10 * 60 * 1000);
export const RETRY_MAX_DELAY_MS = Number(
  process.env.AGENT_RETRY_MAX_DELAY_MS || 6 * 60 * 60 * 1000,
);
export const AGENT_VERBOSE_LEVEL = Number(process.env.AGENT_VERBOSE || 1);
export const MAX_RECURSION_PASSES = Number(process.env.AGENT_MAX_RECURSION_PASSES || 4);
export const COMPLETENESS_TARGET_SCORE = Number(process.env.AGENT_COMPLETENESS_TARGET || 85);
export const STABLE_SCORE_MIN_ATTEMPTS = Number(process.env.AGENT_STABLE_SCORE_MIN_ATTEMPTS || 3);
export const STABLE_SCORE_DELTA = Number(process.env.AGENT_STABLE_SCORE_DELTA || 0);
export const REENRICH_INTERVAL_HOURS = Number(process.env.AGENT_REENRICH_INTERVAL_HOURS || 24);
/** When unset or not `0`, runner processes `data/world-country-run-order.json` strictly one country at a time in file order (wrap after last). */
export const SEQUENTIAL_WORLD_ORDER_ENABLED = process.env.AGENT_SEQUENTIAL_WORLD_ORDER !== '0';
/** `AGENT_STRICT_COUNTRY_GATE=1`: mark task `done` only when `advancementGate.passed` (no plateau shortcut). */
export const AGENT_STRICT_COUNTRY_GATE = process.env.AGENT_STRICT_COUNTRY_GATE === '1';
/** `AGENT_STRICT_QUALITY_MANIFEST=1`: gate requires critical fields to be `ok` or `single_official_ok` in quality manifest (heuristic). */
export const AGENT_STRICT_QUALITY_MANIFEST = process.env.AGENT_STRICT_QUALITY_MANIFEST === '1';
/** `AGENT_CHILD_MODE=shadow|canary`: shadow compares child vs supervisor metrics; canary may apply child payload when `AGENT_CHILD_CANARY_WRITE=1`. */
export const AGENT_CHILD_MODE = (process.env.AGENT_CHILD_MODE || 'off').toLowerCase();
/** When > 0, exit after this many ms (e.g. `180000` for 3 minutes). `0` or unset = no limit. */
export const AGENT_MAX_RUNTIME_MS = Math.max(
  0,
  Math.floor(Number(process.env.AGENT_MAX_RUNTIME_MS || 0)),
);
/** Set `AGENT_MANIFEST_FETCH_ENABLED=0` to skip manifest URL-map HTTP batch. */
export const AGENT_MANIFEST_FETCH_ENABLED = process.env.AGENT_MANIFEST_FETCH_ENABLED !== '0';
