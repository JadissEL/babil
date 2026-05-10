import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

/** E.67 — mutating admin routes must call recordAdminAudit after successful writes. */
describe('admin audit wiring (E.67)', () => {
  const read = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8')

  it('PATCH admin country records audit', () => {
    const src = read('app/api/admin/countries/[id]/route.ts')
    assert.match(src, /recordAdminAudit/)
  })

  it('PATCH admin delegated request records audit', () => {
    const src = read('app/api/admin/delegated-application-requests/[id]/route.ts')
    assert.match(src, /recordAdminAudit/)
    assert.match(src, /delegated_request\.status_change/)
  })
})
