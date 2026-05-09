import test from 'node:test'
import assert from 'node:assert/strict'
import { buildExplorerRegionScoreBuckets } from './explorer-region-score-buckets'

test('buildExplorerRegionScoreBuckets averages scores per region', () => {
  const rows = [
    { name: 'France', region: 'Europe', _finalScore: 80 },
    { name: 'Germany', region: 'Europe', _finalScore: 60 },
    { name: 'Japan', region: 'Asia', _finalScore: 50 },
  ]
  const buckets = buildExplorerRegionScoreBuckets(rows)
  const europe = buckets.find((b) => b.key === 'europe')
  const asia = buckets.find((b) => b.key === 'asia')
  assert.ok(europe)
  assert.ok(asia)
  assert.equal(europe!.countryCount, 2)
  assert.equal(europe!.avgScore, 70)
  assert.equal(asia!.countryCount, 1)
  assert.equal(asia!.avgScore, 50)
})

test('empty subset yields zero average and zero count', () => {
  const rows = [{ name: 'Japan', region: 'Asia', _finalScore: 40 }]
  const buckets = buildExplorerRegionScoreBuckets(rows)
  const americas = buckets.find((b) => b.key === 'americas')
  assert.ok(americas)
  assert.equal(americas!.countryCount, 0)
  assert.equal(americas!.avgScore, 0)
})
