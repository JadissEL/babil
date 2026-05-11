import assert from 'node:assert/strict'
import test from 'node:test'
import {
  parseVisaScorePercent,
  prismCompositeDisplay,
  prismMedian,
  prismTrendForValue,
} from './compare-prism-ui'

test('prismMedian', () => {
  assert.equal(prismMedian([1, 2, 3]), 2)
  assert.equal(prismMedian([10, 20]), 15)
})

test('prismTrendForValue', () => {
  assert.equal(prismTrendForValue(5, [1, 5, 9]), 'flat')
  assert.equal(prismTrendForValue(9, [1, 5, 9]), 'up')
  assert.equal(prismTrendForValue(1, [1, 5, 9]), 'down')
})

test('parseVisaScorePercent', () => {
  assert.equal(parseVisaScorePercent('82.5'), 83)
  assert.equal(parseVisaScorePercent('nope'), null)
})

test('prismCompositeDisplay', () => {
  assert.equal(prismCompositeDisplay(89), '8.9')
  assert.equal(prismCompositeDisplay(72), '7.2')
})
