import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { normalizeCountryMatchKey } from './country-match-key'
import {
  chunkIso2ForWorldBank,
  resolveIso2ForBabilCountryName,
  wbBatchRowsToDatumMap,
} from './world-bank-client'

describe('normalizeCountryMatchKey', () => {
  it('lowercases and collapses spaces', () => {
    assert.equal(normalizeCountryMatchKey('  United   States  '), 'united states')
  })
})

describe('resolveIso2ForBabilCountryName', () => {
  it('uses intelligence overrides when WB map has no dataset label', () => {
    const empty = new Map<string, string>()
    assert.equal(resolveIso2ForBabilCountryName('DR Congo', empty), 'cd')
    assert.equal(resolveIso2ForBabilCountryName('South Korea', empty), 'kr')
    assert.equal(resolveIso2ForBabilCountryName('Russia', empty), 'ru')
  })

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

describe('wbBatchRowsToDatumMap', () => {
  it('maps ISO2 from country.id to first row per country', () => {
    const m = wbBatchRowsToDatumMap([
      { country: { id: 'MA' }, date: '2022', value: 37_000_000 },
      { country: { id: 'FR' }, date: '2023', value: 68_000_000 },
      { country: { id: 'ABC' }, date: '2020', value: 1 },
    ])
    assert.equal(m.get('ma')?.value, 37_000_000)
    assert.equal(m.get('ma')?.date, '2022')
    assert.equal(m.get('fr')?.value, 68_000_000)
    assert.equal(m.has('abc'), false)
  })

  it('ignores rows without a 2-letter country id', () => {
    const m = wbBatchRowsToDatumMap([
      { country: { id: 'WORLD' }, date: '2020', value: 1 },
      { country: {}, date: '2020', value: 2 },
    ])
    assert.equal(m.size, 0)
  })
})

describe('chunkIso2ForWorldBank', () => {
  it('splits list into chunks of max size', () => {
    const iso = ['aa', 'bb', 'cc', 'dd', 'ee']
    assert.deepEqual(chunkIso2ForWorldBank(iso, 2), [
      ['aa', 'bb'],
      ['cc', 'dd'],
      ['ee'],
    ])
  })

  it('returns empty when input empty', () => {
    assert.deepEqual(chunkIso2ForWorldBank([], 40), [])
  })
})
