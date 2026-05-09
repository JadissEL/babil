import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildCountrySheetSignals,
  describeTopCountrySignals,
  formatCountrySheetSignalsSummary,
  orderedProbabilityBreakdown,
  probabilityBreakdownLabel,
} from './probability-result-display'

describe('probability-result-display', () => {
  it('buildCountrySheetSignals parses friction and brutal', () => {
    assert.deepEqual(
      buildCountrySheetSignals({
        acceptance_rate_morocco: ' 55% ',
        friction_score: 42.2,
        brutal_reality_score: 7,
      }),
      {
        acceptance_rate_morocco: '55%',
        friction_score: 42,
        brutal_reality_score: 7,
      },
    )
  })

  it('formatCountrySheetSignalsSummary returns null when empty', () => {
    assert.equal(formatCountrySheetSignalsSummary(buildCountrySheetSignals({})), null)
    const s = formatCountrySheetSignalsSummary({
      acceptance_rate_morocco: '50%',
      friction_score: null,
      brutal_reality_score: null,
    })
    assert.ok(s && s.includes('50%'))
  })

  it('orders breakdown keys and skips invalid numbers', () => {
    const rows = orderedProbabilityBreakdown({
      visaEase: 70,
      finance: 'x',
      acceptance: 55,
      appointmentEase: 80,
    })
    assert.deepEqual(
      rows.map((r) => r.key),
      ['acceptance', 'visaEase', 'appointmentEase'],
    )
    assert.equal(probabilityBreakdownLabel('acceptance'), 'Acceptation (indicateur fiche)')
  })

  it('describeTopCountrySignals falls back when empty', () => {
    assert.ok(describeTopCountrySignals(null).includes('Les scores combinent'))
    assert.match(
      describeTopCountrySignals({
        acceptance_rate_morocco: '62%',
        friction_score: 41,
        brutal_reality_score: 6,
      }),
      /62%/,
    )
    assert.ok(
      describeTopCountrySignals({
        acceptance_rate_morocco: null,
        friction_score: null,
        brutal_reality_score: null,
      }).includes('Les scores combinent'),
    )
  })
})
