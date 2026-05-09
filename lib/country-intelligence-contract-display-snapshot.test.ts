import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'

import { COUNTRY_DETAIL_PAGE_CONTRACT_MARKERS } from './country-intelligence-contract-display-snapshot'

describe('country-intelligence-contract-display-snapshot (B.29)', () => {
  it('public country page still references contract display markers', () => {
    const pagePath = path.join(process.cwd(), 'app/(public)/countries/[id]/page.tsx')
    const src = fs.readFileSync(pagePath, 'utf8')
    for (const m of COUNTRY_DETAIL_PAGE_CONTRACT_MARKERS) {
      assert.ok(
        src.includes(m),
        `Expected app/(public)/countries/[id]/page.tsx to reference "${m}" for contract/UI alignment.`,
      )
    }
  })
})
