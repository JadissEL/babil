import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { toLightCountryListRecord } from './country-list-light'

describe('country-list-light', () => {
  it('strips full_data body and comments', () => {
    const row = {
      id: 1,
      name: 'France',
      region: 'Europe',
      schengen_flag: true,
      tourist_visa_score: 7,
      study_visa_score: 8,
      work_visa_score: 6,
      business_visa_score: 7,
      appointment_difficulty: 'Medium',
      full_data: { friction_score: 40, nested: { a: 1 } },
      comments: [{ id: 1 }],
    }
    const light = toLightCountryListRecord(row)
    assert.deepEqual(light.full_data, {})
    assert.deepEqual(light.comments, [])
    assert.equal(light.name, 'France')
    assert.equal(light.tourist_visa_score, 7)
  })
})
