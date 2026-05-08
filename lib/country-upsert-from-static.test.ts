import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildCountryPrismaPayloadFromStaticRecord } from './country-upsert-from-static'
import { parseCountryFullData } from './country-full-data-json'
import { DATA_BACKFILL_META_KEY } from './contract-coverage-snapshot'

describe('buildCountryPrismaPayloadFromStaticRecord', () => {
  it('produces normalized full_data with driving_rights and Prisma columns', () => {
    const payload = buildCountryPrismaPayloadFromStaticRecord({
      country: 'Testland',
      region: 'Europe',
      friction_analysis: { risk_level: 'Low', real_delay: '2 weeks' },
      driving_license: {
        status: 'Recognized',
        duration: '6 months',
        conversion_possible: false,
        conversion_details: '',
      },
      street_food: { opportunity: 'Moderate' },
      education_mobility: {
        language_study: { access: 'Good' },
        technical_training: { access_bac: true },
        short_courses: { duration: '3 months' },
      },
      official_score: 50,
      friction_score: 40,
    })
    assert.equal(payload.name, 'Testland')
    const full = parseCountryFullData(payload.full_data)
    const dr = full.driving_rights as Record<string, unknown> | undefined
    assert.ok(dr && typeof dr === 'object')
    assert.equal((dr.meta as Record<string, unknown>).schemaVersion, 1)
    assert.equal(payload.appointment_difficulty, 'Low')
    assert.equal(payload.language_study_access, 'Good')
    const bf = full[DATA_BACKFILL_META_KEY] as Record<string, unknown> | undefined
    assert.ok(bf && typeof bf === 'object')
    const cov = bf.contractCoverage as Record<string, unknown> | undefined
    assert.ok(cov && typeof cov.score === 'number')
    const hist = bf.history as unknown[] | undefined
    assert.ok(Array.isArray(hist) && hist.length >= 1)
    assert.equal((hist[0] as Record<string, unknown>).source, 'static_seed')
  })
})
