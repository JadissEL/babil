import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

function listFilesRecursive(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      out.push(...listFilesRecursive(p))
    } else if (name === 'route.ts') {
      out.push(p)
    }
  }
  return out.sort()
}

describe('admin API RBAC', () => {
  it('every app/api/admin/**/route.ts uses getAdminUser and returns Forbidden when unauthorized', () => {
    const adminDir = join(process.cwd(), 'app', 'api', 'admin')
    const files = listFilesRecursive(adminDir)
    assert.ok(files.length > 0, 'expected admin route files')
    for (const file of files) {
      const src = readFileSync(file, 'utf8')
      assert.match(src, /getAdminUser/, `${file} should call getAdminUser`)
      assert.match(src, /Forbidden/, `${file} should reject with Forbidden`)
    }
  })
})
