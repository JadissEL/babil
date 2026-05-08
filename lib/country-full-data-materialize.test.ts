import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { attachCanonicalSchengenFlag, materializePublicFullData } from './country-full-data-materialize'

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

describe('attachCanonicalSchengenFlag', () => {
  it('sets schengen_flag from canonical membership', () => {
    const base = materializePublicFullData({})
    const fr = attachCanonicalSchengenFlag(base, 'Allemagne')
    assert.equal(fr.schengen_flag, true)
    const ma = attachCanonicalSchengenFlag(base, 'Morocco')
    assert.equal(ma.schengen_flag, false)
  })
})
