import { headers } from 'next/headers';
import { getRequestIdFromRequest } from '@/lib/request-id';

export type SlogLevel = 'debug' | 'info' | 'warn' | 'error';

export { getRequestIdFromRequest } from '@/lib/request-id';

/** Resolve request id via Next `headers()` (handler / RSC scope). */
export function getRequestId(): string {
  try {
    const h = headers();
    return getRequestIdFromRequest({ headers: h } as Pick<Request, 'headers'>);
  } catch {
    return 'unknown';
  }
}

/**
 * One JSON line on stdout — Vercel / log drains can parse without extra tooling.
 * Never pass raw PII; keep `fields` to codes and scrubbed messages.
 */
export function slog(level: SlogLevel, msg: string, fields?: Record<string, unknown>): void {
  const line: Record<string, unknown> = {
    level,
    msg,
    requestId: getRequestId(),
    ts: new Date().toISOString(),
    service: 'babil',
    ...(fields ?? {}),
  };
  const serialized = JSON.stringify(line);
  if (level === 'error' || level === 'warn') console.error(serialized);
  else console.log(serialized);
}

/** Prefer in handlers that already hold `req` (avoids relying on `headers()` ordering). */
export function slogRequest(
  level: SlogLevel,
  msg: string,
  req: Pick<Request, 'headers'>,
  fields?: Record<string, unknown>,
): void {
  const line: Record<string, unknown> = {
    level,
    msg,
    requestId: getRequestIdFromRequest(req),
    ts: new Date().toISOString(),
    service: 'babil',
    ...(fields ?? {}),
  };
  const serialized = JSON.stringify(line);
  if (level === 'error' || level === 'warn') console.error(serialized);
  else console.log(serialized);
}
