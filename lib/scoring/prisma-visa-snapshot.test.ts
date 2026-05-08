import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  mergedModel100ToStoredScalar01to10,
  prismaVisaScalarsFromFullData,
} from '@/lib/scoring/prisma-visa-snapshot'

describe('mergedModel100ToStoredScalar01to10', () => {
  it('maps 0–100 merged scores to 1–10 with 0.05 steps', () => {
    assert.equal(mergedModel100ToStoredScalar01to10(50), 5)
    assert.equal(mergedModel100ToStoredScalar01to10(52.5), 5.25)
    assert.equal(mergedModel100ToStoredScalar01to10(100), 10)
    assert.equal(mergedModel100ToStoredScalar01to10(5), 1)
  })
})

describe('prismaVisaScalarsFromFullData', () => {
  it('produces differentiated scalars for contrasting full_data stubs', () => {
    const easy = {
      official_score: 8.5,
      friction_score: 20,
      brutal_reality_score: 8.2,
      acceptance_rate_morocco: '82%',
      confidence_score: 70,
      visa_system: {
        tourism: { difficulty: 'Low' },
        study: { access_bac: 'High', access_master: 'High' },
        work: { availability: 'High' },
        business: { rights: 'High', setup: 'Streamlined online', conditions: 'Clear' },
      },
    }
    const hard = {
      official_score: 4.0,
      friction_score: 78,
      brutal_reality_score: 4.5,
      acceptance_rate_morocco: '38%',
      confidence_score: 42,
      visa_system: {
        tourism: { difficulty: 'High' },
        study: { access_bac: 'Low', access_master: 'Low' },
        work: { availability: 'Limited' },
        business: { rights: 'Limited', setup: 'Heavy', conditions: 'Opaque' },
      },
    }
    const sEasy = prismaVisaScalarsFromFullData(easy, {})
    const sHard = prismaVisaScalarsFromFullData(hard, {})
    assert.ok(sEasy.tourist_visa_score > sHard.tourist_visa_score)
    assert.ok(sEasy.business_visa_score > sHard.business_visa_score)
  })
})
