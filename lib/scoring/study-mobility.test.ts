import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { computeStudyMobility100, educationAccessTo01to100 } from '@/lib/scoring/study-mobility'

describe('educationAccessTo01to100', () => {
  it('ranks access labels', () => {
    assert.ok(educationAccessTo01to100('Élevé') > educationAccessTo01to100('Moyen'))
  })
})

describe('computeStudyMobility100', () => {
  it('separates weak vs strong education profiles', () => {
    const weak = computeStudyMobility100({
      full: {
        official_score: 5.2,
        friction_score: 55,
        brutal_reality_score: 5.5,
        acceptance_rate_morocco: '55%',
        confidence_score: 58,
        education_mobility: {
          language_study: { access: 'Moyen' },
          technical_training: { access: 'Moyen', access_bac: 'Parfois requis' },
          short_courses: { access: 'Moyen' },
        },
      },
    })
    const strong = computeStudyMobility100({
      full: {
        official_score: 8.8,
        friction_score: 18,
        brutal_reality_score: 8.5,
        acceptance_rate_morocco: '82%',
        confidence_score: 75,
        education_mobility: {
          language_study: { access: 'Élevé' },
          technical_training: { access: 'Élevé', access_bac: 'Non requis' },
          short_courses: { access: 'Élevé' },
        },
      },
    })
    assert.ok(strong - weak > 12, `gap ${strong - weak}`)
  })
})
