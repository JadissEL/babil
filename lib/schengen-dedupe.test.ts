import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { LegacyCountryRecord } from '@/lib/countries-fallback'
import { dedupeSchengenMembersByCanonicalName } from '@/lib/schengen-duplicate-merge'
import { schengenCanonicalEnglishName } from '@/lib/schengen-members'

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
