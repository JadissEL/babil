import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { materializePublicFullData } from './country-full-data-materialize'
import { mergeDisplayedFullData } from './merge-displayed-full-data'

describe('merged public full_data (static + DB)', () => {
  it('materializes driving_rights after mergeDisplayedFullData', () => {
    const staticFull: Record<string, unknown> = {}
    const dbFull: Record<string, unknown> = {
      driving_license: {
        status: 'Recognized',
        duration: '1 year',
        conversion_possible: true,
        conversion_details: '',
      },
    }
    const merged = mergeDisplayedFullData(staticFull, dbFull)
    const out = materializePublicFullData(merged)
    const dr = out.driving_rights as Record<string, unknown> | undefined
    assert.ok(dr && typeof dr === 'object')
    assert.equal((dr.meta as Record<string, unknown>).schemaVersion, 1)
  })
})
