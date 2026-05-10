import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  formatObservationConfidencePrintFr,
  formatObservationConfidenceSidebarFr,
  mapPrismaObservationConfidenceAggregate,
  parseObservationConfidenceAggregatePayload,
} from './country-observation-confidence-aggregate'

test('mapPrismaObservationConfidenceAggregate returns null when count is 0', () => {
  assert.equal(
    mapPrismaObservationConfidenceAggregate({
      _count: { _all: 0 },
      _avg: { confidence: null },
      _min: { confidence: null },
      _max: { confidence: null },
    }),
    null,
  )
})

test('mapPrismaObservationConfidenceAggregate maps avg/min/max and meanPercent', () => {
  const out = mapPrismaObservationConfidenceAggregate({
    _count: { _all: 4 },
    _avg: { confidence: 0.755 },
    _min: { confidence: 0.5 },
    _max: { confidence: 0.9 },
  })
  assert.deepEqual(out, {
    count: 4,
    mean: 0.755,
    min: 0.5,
    max: 0.9,
    meanPercent: 76,
  })
})

test('parseObservationConfidenceAggregatePayload accepts API-shaped JSON', () => {
  const p = parseObservationConfidenceAggregatePayload({
    count: 2,
    mean: 0.8,
    min: 0.7,
    max: 0.9,
    meanPercent: 80,
  })
  assert.ok(p)
  assert.equal(p!.meanPercent, 80)
})

test('parseObservationConfidenceAggregatePayload rejects invalid payloads', () => {
  assert.equal(parseObservationConfidenceAggregatePayload(null), null)
  assert.equal(parseObservationConfidenceAggregatePayload({}), null)
  assert.equal(parseObservationConfidenceAggregatePayload({ count: 0 }), null)
})

test('formatters produce French copy with pluralization', () => {
  const one = { count: 1, mean: 0.7, min: 0.7, max: 0.7, meanPercent: 70 }
  assert.match(formatObservationConfidenceSidebarFr(one), /1 observation/)
  assert.match(formatObservationConfidencePrintFr(one), /1 observation/)

  const many = { count: 3, mean: 0.5, min: 0.4, max: 0.6, meanPercent: 50 }
  assert.match(formatObservationConfidenceSidebarFr(many), /3 observations/)
})
