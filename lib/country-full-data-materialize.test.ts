import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { materializePublicFullData } from './country-full-data-materialize'

describe('materializePublicFullData', () => {
  it('materializes driving_rights v1 from legacy driving_license', () => {
    const out = materializePublicFullData({
      driving_license: {
        status: 'Recognized',
        duration: '6 months',
        conversion_possible: true,
        conversion_details: '',
      },
    })
    const dr = out.driving_rights as Record<string, unknown> | undefined
    assert.ok(dr && typeof dr === 'object')
    const meta = dr.meta as Record<string, unknown> | undefined
    assert.equal(meta?.schemaVersion, 1)
  })
})
