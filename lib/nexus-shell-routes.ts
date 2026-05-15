/**
 * Nexus workspace shell route catalog (PAGE 35).
 *
 * Edge-safe — no React / Lucide imports. Keep hrefs in sync with
 * `components/layout/dashboard-nav-config.tsx`.
 */

const NEXUS_NAV_HREFS = [
  '/',
  '/overview',
  '/history',
  '/probability',
  '/recommendation-engine',
  '/recommendations',
  '/profile',
  '/admin',
  '/design-system',
  '/explorer',
  '/schengen',
  '/compare',
  '/community',
  '/business',
  '/investment',
  '/education',
  '/permis',
  '/moderation',
] as const;

const AUTH_PATH_PREFIXES = ['/sign-in', '/sign-up'] as const;

function hrefToPathPrefix(href: string): string {
  const pathOnly = href.split('?')[0]?.trim() || href;
  if (!pathOnly || pathOnly === '/') return '/';
  return pathOnly.endsWith('/') && pathOnly.length > 1
    ? pathOnly.slice(0, -1)
    : pathOnly;
}

function collectNavPrefixes(): string[] {
  const set = new Set<string>();
  for (const href of NEXUS_NAV_HREFS) {
    set.add(hrefToPathPrefix(href));
  }
  return Array.from(set).sort((a, b) => b.length - a.length);
}

/** Longest-prefix-first list for `pathname.startsWith` checks. */
export const NEXUS_PATH_PREFIXES: readonly string[] = collectNavPrefixes();

export function normalizePathname(pathname: string | null | undefined): string {
  if (pathname == null || pathname === '') return '/';
  const base = pathname.split('?')[0] || '/';
  if (base.length > 1 && base.endsWith('/')) return base.slice(0, -1);
  return base;
}

export function isAuthPath(pathname: string | null | undefined): boolean {
  const p = normalizePathname(pathname);
  return AUTH_PATH_PREFIXES.some(
    (prefix) => p === prefix || p.startsWith(`${prefix}/`),
  );
}

export function isNexusPath(pathname: string | null | undefined): boolean {
  const p = normalizePathname(pathname);
  if (isAuthPath(p)) return false;
  if (p === '/') return true;
  return NEXUS_PATH_PREFIXES.some(
    (prefix) => prefix !== '/' && (p === prefix || p.startsWith(`${prefix}/`)),
  );
}

/** Residual marketing shell (Harbor / Quay) — not Nexus product workspace. */
export function isPublicMarketingPath(pathname: string | null | undefined): boolean {
  const p = normalizePathname(pathname);
  if (isAuthPath(p) || isNexusPath(p)) return false;
  return true;
}

/** Clerk `createRouteMatcher` patterns for Nexus app routes requiring sign-in. */
export function nexusProtectedRoutePatterns(): string[] {
  const patterns = new Set<string>();
  patterns.add('/');
  for (const prefix of NEXUS_PATH_PREFIXES) {
    if (prefix === '/') continue;
    patterns.add(`${prefix}(.*)`);
  }
  return Array.from(patterns);
}
