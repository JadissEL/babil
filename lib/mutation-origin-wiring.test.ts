import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

/** E.68 — mutating handlers must call mutationOriginDeniedResponse first (production CSRF / Origin). */
describe('mutation origin guard wiring (E.68)', () => {
  const read = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8')

  const routes = [
    'app/api/user/profile/route.ts',
    'app/api/user/favorites/route.ts',
    'app/api/user/history/route.ts',
    'app/api/comments/route.ts',
    'app/api/comments/[id]/route.ts',
    'app/api/delegated-application-requests/route.ts',
    'app/api/admin/countries/[id]/route.ts',
    'app/api/admin/delegated-application-requests/[id]/route.ts',
    'app/api/recommendation/route.ts',
    'app/api/probability/route.ts',
  ] as const

  for (const rel of routes) {
    it(`${rel} applies mutationOriginDeniedResponse`, () => {
      const src = read(rel)
      assert.match(src, /mutationOriginDeniedResponse/)
    })
  }
})
