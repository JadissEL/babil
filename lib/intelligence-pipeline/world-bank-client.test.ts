import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { normalizeCountryMatchKey, resolveIso2ForBabilCountryName } from './world-bank-client'

describe('normalizeCountryMatchKey', () => {
  it('lowercases and collapses spaces', () => {
    assert.equal(normalizeCountryMatchKey('  United   States  '), 'united states')
  })
})

describe('resolveIso2ForBabilCountryName', () => {
  it('uses World Bank map for English names', () => {
    const m = new Map([
      [normalizeCountryMatchKey('Afghanistan'), 'af'],
      [normalizeCountryMatchKey('Morocco'), 'ma'],
    ])
    assert.equal(resolveIso2ForBabilCountryName('Afghanistan', m), 'af')
    assert.equal(resolveIso2ForBabilCountryName('Morocco', m), 'ma')
  })

  it('returns null when unmapped', () => {
    assert.equal(resolveIso2ForBabilCountryName('Unknownland', new Map()), null)
  })
})
