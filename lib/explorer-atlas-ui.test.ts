import assert from 'node:assert/strict'
import test from 'node:test'
import {
  atlasCategoryLabel,
  atlasVisaDelayDays,
  explorerRegionToAtlasScoreBucketKey,
} from './explorer-atlas-ui'

test('atlasCategoryLabel marks Schengen members', () => {
  assert.equal(atlasCategoryLabel('Suisse', 'Europe'), 'Schengen')
  assert.equal(atlasCategoryLabel('Canada', 'Americas'), 'Amériques')
  assert.equal(atlasCategoryLabel('Japan', 'asia'), 'Asie')
})

test('atlasVisaDelayDays parses digits from string', () => {
  assert.equal(atlasVisaDelayDays({ visa_processing_time: '15 working days' }, 1), 15)
  assert.equal(atlasVisaDelayDays({ visa_processing_time: 'Unknown' }, 99), 12 + (99 % 35))
})

test('explorerRegionToAtlasScoreBucketKey', () => {
  assert.equal(explorerRegionToAtlasScoreBucketKey('Asia'), 'asia')
  assert.equal(explorerRegionToAtlasScoreBucketKey('Schengen'), null)
})
