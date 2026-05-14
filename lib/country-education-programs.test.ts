import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  bucketBac,
  bucketCost,
  bucketWorkRights,
  extractEducationPrograms,
  type EducationProgramRow,
} from '@/lib/country-education-programs'

describe('bucketCost', () => {
  it('maps French / English variants to LOW / MEDIUM / HIGH', () => {
    assert.equal(bucketCost('Bas'), 'LOW')
    assert.equal(bucketCost('Low cost'), 'LOW')
    assert.equal(bucketCost('Moyen'), 'MEDIUM')
    assert.equal(bucketCost('Medium'), 'MEDIUM')
    assert.equal(bucketCost('Élevé'), 'HIGH')
    assert.equal(bucketCost('Eleve'), 'HIGH')
    assert.equal(bucketCost('High'), 'HIGH')
  })

  it('returns UNKNOWN when input is empty or nullish', () => {
    assert.equal(bucketCost(''), 'UNKNOWN')
    assert.equal(bucketCost(null), 'UNKNOWN')
    assert.equal(bucketCost(undefined), 'UNKNOWN')
  })
})

describe('bucketBac', () => {
  it('detects FR / EN forms', () => {
    assert.equal(bucketBac('Requis'), 'REQUIRED')
    assert.equal(bucketBac('Required'), 'REQUIRED')
    assert.equal(bucketBac('Non requis'), 'NOT_REQUIRED')
    assert.equal(bucketBac('Not required'), 'NOT_REQUIRED')
    assert.equal(bucketBac("Dépend de l'école"), 'SCHOOL_DEPENDENT')
    assert.equal(bucketBac('School dependent'), 'SCHOOL_DEPENDENT')
    assert.equal(bucketBac(''), 'UNKNOWN')
  })
})

describe('bucketWorkRights', () => {
  it('classifies allowed / limited / forbidden / unknown', () => {
    assert.equal(bucketWorkRights('Autorisé'), 'ALLOWED')
    assert.equal(bucketWorkRights('Allowed'), 'ALLOWED')
    assert.equal(bucketWorkRights('Interdit'), 'FORBIDDEN')
    assert.equal(bucketWorkRights('Forbidden'), 'FORBIDDEN')
    assert.equal(bucketWorkRights('Limité'), 'LIMITED')
    assert.equal(bucketWorkRights(''), 'UNKNOWN')
  })
})

describe('extractEducationPrograms', () => {
  it('returns an empty list when full_data has no education_mobility block', () => {
    assert.deepEqual(extractEducationPrograms(null), [])
    assert.deepEqual(extractEducationPrograms({}), [])
    assert.deepEqual(extractEducationPrograms({ education_mobility: 'nope' }), [])
  })

  it('builds one row per kind with bucketized fields', () => {
    const full = {
      education_mobility: {
        language_study: {
          bac_required: 'Non requis',
          estimated_cost: 'Moyen — 600€/mois',
          program_type: 'École de langue',
          visa: 'Visa étudiant court',
          access: 'Facile',
          insight: 'Bon réseau.',
        },
        short_courses: {
          bac_required: 'Requis',
          cost: 'Élevé',
          duration: '1 mois',
          visa: 'Schengen tourisme',
          types: ['data', 'design', ''],
        },
        technical_training: {
          access_bac: true,
          access_no_bac: false,
          cost: 'Bas',
          work_rights: 'Interdit pendant études',
          types: ['mécanique'],
        },
      },
    }

    const rows = extractEducationPrograms(full)
    const byKind = new Map<string, EducationProgramRow>(rows.map((r) => [r.kind, r]))

    assert.equal(rows.length, 3)

    const ls = byKind.get('LANGUAGE_STUDY')!
    assert.equal(ls.bacBucket, 'NOT_REQUIRED')
    assert.equal(ls.costBucket, 'MEDIUM')
    assert.equal(ls.programType, 'École de langue')
    assert.equal(ls.visaType, 'Visa étudiant court')
    assert.equal(ls.access, 'Facile')

    const sc = byKind.get('SHORT_COURSES')!
    assert.equal(sc.bacBucket, 'REQUIRED')
    assert.equal(sc.costBucket, 'HIGH')
    assert.equal(sc.durationText, '1 mois')
    assert.deepEqual(sc.types, ['data', 'design'])

    const tt = byKind.get('TECHNICAL_TRAINING')!
    assert.equal(tt.costBucket, 'LOW')
    assert.equal(tt.workRightsBucket, 'FORBIDDEN')
    assert.equal(tt.accessBac, true)
    assert.equal(tt.accessNoBac, false)
    assert.deepEqual(tt.types, ['mécanique'])
  })

  it('skips kinds whose block is missing or not a plain object', () => {
    const full = {
      education_mobility: {
        language_study: { bac_required: 'Requis' },
        short_courses: ['array, ignored'],
        technical_training: null,
      },
    }
    const rows = extractEducationPrograms(full)
    assert.equal(rows.length, 1)
    assert.equal(rows[0].kind, 'LANGUAGE_STUDY')
  })
})
