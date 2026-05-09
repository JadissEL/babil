import test from 'node:test'
import assert from 'node:assert/strict'

import { isEconomyIntelFresh, latestMaterializedIsoFromIntelMeta } from './intel-freshness'

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

test('latestMaterializedIsoFromIntelMeta picks newest *_materialized_at', () => {
  const older = new Date(Date.now() - 10 * 864e5).toISOString()
  const newer = new Date(Date.now() - 864e5).toISOString()
  const got = latestMaterializedIsoFromIntelMeta({
    economy_materialized_at: older,
    health_materialized_at: newer,
    taxonomy: 'v1',
  })
  assert.equal(Date.parse(got ?? ''), Date.parse(newer))
})

test('latestMaterializedIsoFromIntelMeta returns null when empty', () => {
  assert.equal(latestMaterializedIsoFromIntelMeta(null), null)
  assert.equal(latestMaterializedIsoFromIntelMeta({}), null)
})
