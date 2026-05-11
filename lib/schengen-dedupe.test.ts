import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import type { LegacyCountryRecord } from '@/lib/countries-fallback'
import { iso2ForCountryNameOrEmpty } from '@/lib/country-card-mappers'
import { dedupeSchengenMembersByCanonicalName } from '@/lib/schengen-duplicate-merge'
import {
  isSchengenMember,
  listSchengenNormalizedLookupKeys,
  schengenCanonicalEnglishName,
} from '@/lib/schengen-members'

function row(partial: Partial<LegacyCountryRecord> & { id: number; name: string }): LegacyCountryRecord {
  return {
    region: 'Europe',
    schengen_flag: true,
    tourist_visa_score: 5,
    study_visa_score: 5,
    work_visa_score: 5,
    business_visa_score: 5,
    appointment_difficulty: 'Medium',
    full_data: {},
    comments: [],
    ...partial,
  }
}

describe('schengenCanonicalEnglishName', () => {
  it('maps FR and EN names to the same canonical member', () => {
    assert.equal(schengenCanonicalEnglishName('Allemagne'), 'Germany')
    assert.equal(schengenCanonicalEnglishName('Germany'), 'Germany')
    assert.equal(schengenCanonicalEnglishName('Islande'), 'Iceland')
  })

  it('resolves English Schengen names case-insensitively', () => {
    assert.equal(schengenCanonicalEnglishName('france'), 'France')
    assert.equal(schengenCanonicalEnglishName('GERMANY'), 'Germany')
    assert.ok(isSchengenMember('norway'))
  })
})

describe('iso2ForCountryNameOrEmpty', () => {
  it('returns ISO2 for FR, EN, case variants, and Schengen-only aliases', () => {
    assert.equal(iso2ForCountryNameOrEmpty('Allemagne'), 'de')
    assert.equal(iso2ForCountryNameOrEmpty('germany'), 'de')
    assert.equal(iso2ForCountryNameOrEmpty('Islande'), 'is')
    assert.equal(iso2ForCountryNameOrEmpty('Liechtenstein'), 'li')
    assert.equal(iso2ForCountryNameOrEmpty('Pays-Bas'), 'nl')
    assert.equal(iso2ForCountryNameOrEmpty('République tchèque'), 'cz')
    assert.equal(iso2ForCountryNameOrEmpty('Unknownland'), '')
  })
})

describe('listSchengenNormalizedLookupKeys', () => {
  it('includes EN and FR keys used by static clients (keep data/schengen-lookup-keys.json in sync)', () => {
    const keys = listSchengenNormalizedLookupKeys()
    assert.ok(keys.includes('france'))
    assert.ok(keys.includes('espagne'))
    assert.ok(keys.includes('bulgaria'))
    assert.ok(keys.includes('romania'))
  })
})

describe('dedupeSchengenMembersByCanonicalName', () => {
  it('merges Allemagne and Germany into a single row', () => {
    const list: LegacyCountryRecord[] = [
      row({ id: 2, name: 'Allemagne', tourist_visa_score: 6, full_data: { marker: 'static' } }),
      row({ id: 99, name: 'Germany', tourist_visa_score: 7, full_data: { nested: { x: 1 } } }),
      row({ id: 3, name: 'France', tourist_visa_score: 8 }),
    ]
    const out = dedupeSchengenMembersByCanonicalName(list)
    const germanyLike = out.filter((r) => schengenCanonicalEnglishName(r.name) === 'Germany')
    assert.equal(germanyLike.length, 1)
    assert.equal(germanyLike[0].name, 'Germany')
    assert.equal(germanyLike[0].id, 99)
    assert.equal(germanyLike[0].tourist_visa_score, 7)
    assert.equal(out.length, 2)
  })

  it('leaves non-Schengen rows unchanged in count', () => {
    const list: LegacyCountryRecord[] = [
      row({ id: 1, name: 'Morocco', region: 'Africa', schengen_flag: false }),
      row({ id: 2, name: 'France' }),
    ]
    const out = dedupeSchengenMembersByCanonicalName(list)
    assert.equal(out.length, 2)
  })
})
