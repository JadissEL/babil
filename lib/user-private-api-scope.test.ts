import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

/**
 * E.75 — Guard: user-scoped routes must not take a foreign `userId` from query/body for reads/exports.
 * (Auth is always `await auth()`; this test catches accidental regressions.)
 */
describe('user private API scope (E.75)', () => {
  const read = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8')

  it('favorites route scopes queries to auth userId only', () => {
    const src = read('app/api/user/favorites/route.ts')
    assert.match(src, /where:\s*\{\s*userId:\s*userId\s+as\s+string/)
    assert.doesNotMatch(src, /searchParams\.get\(\s*['"]userId['"]\s*\)/)
    assert.doesNotMatch(src, /body\.userId/)
  })

  it('history route scopes queries to auth userId only', () => {
    const src = read('app/api/user/history/route.ts')
    assert.match(src, /where:\s*\{\s*userId:\s*userId\s+as\s+string\s*\}/)
    assert.doesNotMatch(src, /searchParams\.get\(\s*['"]userId['"]\s*\)/)
  })

  it('data-export scopes all bundles to auth userId only', () => {
    const src = read('app/api/user/data-export/route.ts')
    const occurrences = src.match(/where:\s*\{\s*userId:\s*userId\s+as\s+string/g) ?? []
    assert.ok(occurrences.length >= 3, 'expected multiple userId-scoped where clauses')
    assert.doesNotMatch(src, /searchParams\.get\(\s*['"]userId['"]\s*\)/)
  })
})
