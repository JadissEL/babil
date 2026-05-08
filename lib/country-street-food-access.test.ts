import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  deriveStreetFoodBusinessAccessFromFullData,
  ensureStreetFoodBusinessAccessOnFullData,
} from '@/lib/country-street-food-access'

describe('deriveStreetFoodBusinessAccessFromFullData', () => {
  it('prefers top-level street_food_business_access', () => {
    const v = deriveStreetFoodBusinessAccessFromFullData({
      street_food_business_access: ' Medium ',
      street_food: { opportunity: 'High' },
    })
    assert.equal(v, 'Medium')
  })

  it('falls back to street_food.opportunity', () => {
    const v = deriveStreetFoodBusinessAccessFromFullData({
      street_food: { opportunity: 'Low' },
    })
    assert.equal(v, 'Low')
  })
})

describe('ensureStreetFoodBusinessAccessOnFullData', () => {
  it('fills top-level from opportunity when missing', () => {
    const out = ensureStreetFoodBusinessAccessOnFullData({
      street_food: { opportunity: 'High' },
    })
    assert.equal(out.street_food_business_access, 'High')
  })

  it('does not overwrite an existing top-level string', () => {
    const out = ensureStreetFoodBusinessAccessOnFullData({
      street_food_business_access: 'Medium',
      street_food: { opportunity: 'High' },
    })
    assert.equal(out.street_food_business_access, 'Medium')
  })
})
