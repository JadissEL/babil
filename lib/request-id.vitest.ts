import { describe, expect, it } from 'vitest';
import { getRequestIdFromRequest } from '@/lib/request-id';
import { BABIL_REQUEST_ID_HEADER } from '@/lib/request-id-constants';

describe('getRequestIdFromRequest', () => {
  it('prefers babil header', () => {
    const h = new Headers();
    h.set(BABIL_REQUEST_ID_HEADER, 'rid-1');
    h.set('x-vercel-id', 'v0');
    expect(getRequestIdFromRequest({ headers: h })).toBe('rid-1');
  });

  it('falls back to vercel id', () => {
    const h = new Headers();
    h.set('x-vercel-id', 'v1');
    expect(getRequestIdFromRequest({ headers: h })).toBe('v1');
  });
});
