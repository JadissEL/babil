import test from 'node:test'
import assert from 'node:assert/strict'

import { isEconomyIntelFresh } from './intel-freshness'

test('isEconomyIntelFresh is true for recent ISO date', () => {
  const d = new Date(Date.now() - 2 * 864e5).toISOString()
  assert.equal(isEconomyIntelFresh(d, 21), true)
})

test('isEconomyIntelFresh is false for old date', () => {
  const d = new Date(Date.now() - 400 * 864e5).toISOString()
  assert.equal(isEconomyIntelFresh(d, 21), false)
})

test('isEconomyIntelFresh is false for garbage', () => {
  assert.equal(isEconomyIntelFresh(null), false)
  assert.equal(isEconomyIntelFresh(''), false)
  assert.equal(isEconomyIntelFresh('not-a-date'), false)
})
