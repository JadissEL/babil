/**
 * Single source of truth for the Clerk edge-middleware protected route table.
 *
 * Consumed by:
 *  - `proxy.ts` (Edge middleware — wraps `createRouteMatcher`)
 *  - `app/(dashboard)/admin/rampart/page.tsx` (Stitch PAGE 39 internal dashboard)
 *  - `docs/google-stitch/pages/39-rampart-clerk-edge-middleware.md`
 *
 * Keep this file free of Prisma, React or Next runtime imports so it stays
 * node-testable and importable from the Edge runtime alike.
 */

import { nexusProtectedRoutePatterns } from '@/lib/nexus-shell-routes';

export type ProtectedRouteRequirement = 'auth' | 'auth+rbac';
export type ProtectedRouteCategory = 'app' | 'api';

export type ProtectedRouteRule = {
  /**
   * Matcher pattern compatible with Clerk's `createRouteMatcher`
   * (Next.js path-to-regexp variant with parens-style globs).
   */
  pattern: string;
  /** Human display path used in dashboards (`/admin/*` instead of `/admin(.*)`). */
  displayPath: string;
  /** Stitch §5.2 access level. */
  requirement: ProtectedRouteRequirement;
  /** App-route or API-route grouping for the dashboard table. */
  category: ProtectedRouteCategory;
  /** Free-form explanation surfaced in the dashboard tooltip / doc. */
  note?: string;
};

const NEXUS_RBAC_PREFIXES = ['/admin', '/moderation'] as const;

const NEXUS_APP_ROUTE_RULES: readonly ProtectedRouteRule[] = nexusProtectedRoutePatterns()
  .filter((pattern) => pattern !== '/')
  .filter(
    (pattern) =>
      !NEXUS_RBAC_PREFIXES.some((prefix) => pattern.startsWith(`${prefix}(`)),
  )
  .map((pattern) => {
    const displayPath = pattern.replace('(.*)', '');
    const note =
      displayPath === '/services/delegated-applications'
        ? 'Tunnel application déléguée (intake + suivi).'
        : 'Espace connecté Nexus (outil produit).';
    return {
      pattern,
      displayPath,
      requirement: 'auth' as const,
      category: 'app' as const,
      note,
    };
  });

export const PROTECTED_ROUTE_RULES: readonly ProtectedRouteRule[] = [
  ...NEXUS_APP_ROUTE_RULES,
  {
    pattern: '/moderation(.*)',
    displayPath: '/moderation',
    requirement: 'auth+rbac',
    category: 'app',
    note: 'Modération commentaires — rôle ADMIN requis côté route handler.',
  },
  {
    pattern: '/admin(.*)',
    displayPath: '/admin',
    requirement: 'auth+rbac',
    category: 'app',
    note: 'Console Citadel — rôle ADMIN requis côté route handler.',
  },
  {
    pattern: '/api/admin(.*)',
    displayPath: '/api/admin/*',
    requirement: 'auth+rbac',
    category: 'api',
    note: 'Endpoints administration (audit, country edit, intelligence).',
  },
  {
    pattern: '/api/comments(.*)',
    displayPath: '/api/comments/*',
    requirement: 'auth',
    category: 'api',
    note: 'Création / modération commentaires.',
  },
  {
    pattern: '/api/user/profile(.*)',
    displayPath: '/api/user/profile',
    requirement: 'auth',
    category: 'api',
    note: 'Lecture / patch profil.',
  },
  {
    pattern: '/api/user/favorites(.*)',
    displayPath: '/api/user/favorites',
    requirement: 'auth',
    category: 'api',
    note: 'Favoris pays.',
  },
  {
    pattern: '/api/user/history(.*)',
    displayPath: '/api/user/history',
    requirement: 'auth',
    category: 'api',
    note: 'Journal user (VIEW_COUNTRY, CONTENT_FEEDBACK, …).',
  },
  {
    pattern: '/api/user/data-export(.*)',
    displayPath: '/api/user/data-export',
    requirement: 'auth',
    category: 'api',
    note: 'Export JSON RGPD.',
  },
  {
    pattern: '/api/delegated-application-requests(.*)',
    displayPath: '/api/delegated-application-requests/*',
    requirement: 'auth',
    category: 'api',
    note: 'CRUD demandes services délégués.',
  },
];

/** Patterns shipped to `createRouteMatcher` in `proxy.ts`. */
export const PROTECTED_ROUTE_PATTERNS: readonly string[] = PROTECTED_ROUTE_RULES.map(
  (r) => r.pattern,
);

/**
 * Grouping for the Rampart dashboard table. `/api/user/*` rules collapse into
 * a single display row to mirror the Stitch screenshot intent without losing
 * the underlying matcher precision.
 */
export type ProtectedRouteDisplayRow = {
  displayPath: string;
  requirement: ProtectedRouteRequirement;
  category: ProtectedRouteCategory;
  patterns: string[];
};

export function getProtectedRouteDisplayRows(): ProtectedRouteDisplayRow[] {
  const rows: ProtectedRouteDisplayRow[] = [];
  const seen = new Map<string, number>();

  for (const rule of PROTECTED_ROUTE_RULES) {
    const groupKey = rule.displayPath.startsWith('/api/user/')
      ? '/api/user/*'
      : rule.displayPath;
    const idx = seen.get(groupKey);
    if (idx == null) {
      seen.set(groupKey, rows.length);
      rows.push({
        displayPath: groupKey,
        requirement: rule.requirement,
        category: rule.category,
        patterns: [rule.pattern],
      });
    } else {
      const existing = rows[idx];
      existing.patterns.push(rule.pattern);
      if (rule.requirement === 'auth+rbac') existing.requirement = 'auth+rbac';
    }
  }
  return rows;
}

export const REQUEST_ID_RESOLUTION_PIPELINE: readonly {
  step: number;
  label: string;
  source: string;
}[] = [
  { step: 1, label: 'Header Check', source: 'x-babil-request-id' },
  { step: 2, label: 'Fallback', source: 'x-request-id' },
  { step: 3, label: 'Fallback', source: 'x-vercel-id' },
  { step: 4, label: 'Generate', source: 'crypto.randomUUID()' },
];
