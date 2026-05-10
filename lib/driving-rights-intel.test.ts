import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  deriveDrivingRightsVisual,
  drivingRightsFromLegacy,
  enrichCountryRecordWithDrivingRights,
  materializeDrivingRightsIntel,
  syncDrivingRightsIntelIntoFullData,
} from '@/lib/driving-rights-intel'

describe('drivingRightsFromLegacy', () => {
  it('maps legacy Afghanistan-style baseline', () => {
    const intel = drivingRightsFromLegacy({
      status: 'À vérifier',
      international_required: true,
      duration: 'Variable',
      conversion_possible: false,
      conversion_process: 'Selon réglementation locale.',
      restrictions: 'Se référer aux autorités locales.',
    })
    assert.equal(intel.meta.schemaVersion, 1)
    assert.equal(intel.meta.dataCertainty, 'unknown')
    assert.equal(intel.eligibility.idpRequired, true)
    assert.ok(intel.residencyRules.length >= 6)
  })
})

describe('materializeDrivingRightsIntel', () => {
  it('merges driving_rights patch over legacy', () => {
    const intel = materializeDrivingRightsIntel({
      driving_license: { status: 'Valide', international_required: false },
      driving_rights: {
        meta: { schemaVersion: 1, holderNationalities: ['MA'], dataCertainty: 'verified', sources: [] },
        simpleSummaryFr: 'Synthèse test',
      },
    })
    assert.equal(intel.simpleSummaryFr, 'Synthèse test')
    assert.equal(intel.eligibility.moroccanLicenseRecognized, true)
  })
})

describe('deriveDrivingRightsVisual', () => {
  it('flags prohibited when license not recognized', () => {
    const intel = drivingRightsFromLegacy({ status: 'Non reconnu' })
    assert.equal(deriveDrivingRightsVisual(intel), 'prohibited')
  })
})

describe('enrichCountryRecordWithDrivingRights', () => {
  it('skips rebuild when valid v1 already present', () => {
    const row: Record<string, unknown> = {
      country: 'X',
      driving_rights: {
        meta: { schemaVersion: 1, holderNationalities: ['MA'], dataCertainty: 'verified', sources: [] },
        eligibility: {},
      },
    }
    const out = enrichCountryRecordWithDrivingRights(row)
    assert.equal((out.driving_rights as { meta: { schemaVersion: number } }).meta.schemaVersion, 1)
    assert.equal(out.country, 'X')
  })
})

describe('syncDrivingRightsIntelIntoFullData', () => {
  it('attaches driving_rights v1 to full_data', () => {
    const out = syncDrivingRightsIntelIntoFullData({
      driving_license: { status: 'Valide', international_required: true },
    })
    assert.ok(out.driving_rights)
    assert.equal((out.driving_rights as { meta: { schemaVersion: number } }).meta.schemaVersion, 1)
  })
})
