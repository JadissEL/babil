import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  getProtectedRouteDisplayRows,
  PROTECTED_ROUTE_PATTERNS,
  PROTECTED_ROUTE_RULES,
  REQUEST_ID_RESOLUTION_PIPELINE,
} from './auth-protected-routes';

describe('PROTECTED_ROUTE_RULES', () => {
  it('exposes every rule with a non-empty pattern, displayPath and a valid requirement', () => {
    assert.ok(PROTECTED_ROUTE_RULES.length >= 14, 'at least 14 rules expected');
    for (const rule of PROTECTED_ROUTE_RULES) {
      assert.ok(rule.pattern.startsWith('/'), `pattern must start with /: ${rule.pattern}`);
      assert.ok(rule.pattern.endsWith('(.*)'), `pattern must use Clerk parens glob: ${rule.pattern}`);
      assert.ok(rule.displayPath.startsWith('/'), `displayPath must start with /: ${rule.displayPath}`);
      assert.ok(
        rule.requirement === 'auth' || rule.requirement === 'auth+rbac',
        `unexpected requirement: ${rule.requirement}`,
      );
      assert.ok(rule.category === 'app' || rule.category === 'api');
    }
  });

  it('has unique patterns (no duplicate matcher entries)', () => {
    const seen = new Set<string>();
    for (const rule of PROTECTED_ROUTE_RULES) {
      assert.ok(!seen.has(rule.pattern), `duplicate pattern: ${rule.pattern}`);
      seen.add(rule.pattern);
    }
  });

  it('PROTECTED_ROUTE_PATTERNS mirrors the rules array length and order', () => {
    assert.equal(PROTECTED_ROUTE_PATTERNS.length, PROTECTED_ROUTE_RULES.length);
    PROTECTED_ROUTE_RULES.forEach((r, i) => {
      assert.equal(PROTECTED_ROUTE_PATTERNS[i], r.pattern);
    });
  });

  it('flags /admin and /moderation as auth+rbac (RBAC enforced downstream)', () => {
    const admin = PROTECTED_ROUTE_RULES.find((r) => r.pattern === '/admin(.*)');
    const moderation = PROTECTED_ROUTE_RULES.find((r) => r.pattern === '/moderation(.*)');
    const apiAdmin = PROTECTED_ROUTE_RULES.find((r) => r.pattern === '/api/admin(.*)');
    assert.equal(admin?.requirement, 'auth+rbac');
    assert.equal(moderation?.requirement, 'auth+rbac');
    assert.equal(apiAdmin?.requirement, 'auth+rbac');
  });
});

describe('getProtectedRouteDisplayRows', () => {
  it('collapses /api/user/* into a single display row', () => {
    const rows = getProtectedRouteDisplayRows();
    const userRow = rows.find((r) => r.displayPath === '/api/user/*');
    assert.ok(userRow, 'expected /api/user/* aggregate row');
    assert.ok(
      userRow.patterns.length >= 3,
      'expected at least 3 /api/user/* patterns grouped',
    );
    assert.equal(userRow.requirement, 'auth');
  });

  it('does not lose any non-/api/user/ rules', () => {
    const rows = getProtectedRouteDisplayRows();
    const nonUserRules = PROTECTED_ROUTE_RULES.filter(
      (r) => !r.displayPath.startsWith('/api/user/'),
    );
    for (const rule of nonUserRules) {
      const match = rows.find((r) => r.displayPath === rule.displayPath);
      assert.ok(match, `display row missing for ${rule.displayPath}`);
    }
  });
});

describe('REQUEST_ID_RESOLUTION_PIPELINE', () => {
  it('describes the 4-step pipeline used by proxy.ts', () => {
    assert.equal(REQUEST_ID_RESOLUTION_PIPELINE.length, 4);
    assert.equal(REQUEST_ID_RESOLUTION_PIPELINE[0].source, 'x-babil-request-id');
    assert.equal(REQUEST_ID_RESOLUTION_PIPELINE[1].source, 'x-request-id');
    assert.equal(REQUEST_ID_RESOLUTION_PIPELINE[2].source, 'x-vercel-id');
    assert.equal(REQUEST_ID_RESOLUTION_PIPELINE[3].source, 'crypto.randomUUID()');
  });
});
