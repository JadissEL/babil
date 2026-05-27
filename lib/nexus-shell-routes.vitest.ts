import { describe, expect, it } from 'vitest';
import {
  GUEST_READABLE_PATH_PREFIXES,
  isGuestReadablePath,
  isPublicMarketingPath,
  nexusProtectedRoutePatterns,
  normalizePathname,
} from '@/lib/nexus-shell-routes';

describe('nexus-shell-routes guest hybrid', () => {
  it('marks /explorer as guest-readable', () => {
    expect(GUEST_READABLE_PATH_PREFIXES).toContain('/explorer');
    expect(isGuestReadablePath('/explorer')).toBe(true);
    expect(isGuestReadablePath('/explorer?goal=tourism')).toBe(true);
  });

  it('excludes /explorer from Clerk protected patterns', () => {
    const patterns = nexusProtectedRoutePatterns();
    expect(patterns.some((p) => p === '/explorer(.*)')).toBe(false);
    expect(patterns.some((p) => p === '/compare(.*)')).toBe(true);
  });

  it('treats guest explorer as public marketing path', () => {
    expect(isPublicMarketingPath('/explorer')).toBe(true);
    expect(isPublicMarketingPath('/compare')).toBe(false);
  });

  it('normalizes trailing slashes', () => {
    expect(normalizePathname('/explorer/')).toBe('/explorer');
  });
});
