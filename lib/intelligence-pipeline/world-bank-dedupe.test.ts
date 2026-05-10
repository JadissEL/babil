import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { worldBankObservationDedupeKey } from './world-bank-dedupe'

describe('world-bank-dedupe (C.43)', () => {
  it('builds stable versioned keys', () => {
    assert.equal(worldBankObservationDedupeKey('SP.POP.TOTL', 'ma', 2023), 'wb:v1:SP.POP.TOTL:MA:2023')
    assert.equal(worldBankObservationDedupeKey('NY.GDP.MKTP.CD', 'FR', '2022'), 'wb:v1:NY.GDP.MKTP.CD:FR:2022')
  })
})
