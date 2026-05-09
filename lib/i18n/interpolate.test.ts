import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { interpolate } from './interpolate'

describe('i18n interpolate', () => {
  it('replaces named placeholders', () => {
    assert.equal(
      interpolate('Hello {name}, {n} items', { name: 'Ada', n: 3 }),
      'Hello Ada, 3 items',
    )
  })

  it('uses empty string for missing keys', () => {
    assert.equal(interpolate('{a} and {b}', { a: 'x' }), 'x and ')
  })
})
