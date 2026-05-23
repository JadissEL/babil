/**
 * Structured logs for intelligence pipeline (stdout JSON — log drains).
 */

import { slog } from '@/lib/structured-log';

export function logIntelligence(
  level: 'info' | 'warn' | 'error',
  msg: string,
  fields?: Record<string, unknown>,
): void {
  slog(level, msg, { domain: 'intelligence', ...fields });
}
