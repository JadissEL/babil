import { BABIL_REQUEST_ID_HEADER } from '@/lib/request-id-constants';

/** No `next/headers` — safe for tests and any runtime. */
export function getRequestIdFromRequest(req: Pick<Request, 'headers'>): string {
  return (
    req.headers.get(BABIL_REQUEST_ID_HEADER)?.trim() ||
    req.headers.get('x-vercel-id')?.trim() ||
    req.headers.get('x-request-id')?.trim() ||
    'unknown'
  );
}
