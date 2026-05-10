import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildCountrySheetSignals,
  describeTopCountrySignals,
  formatCountrySheetSignalsSummary,
  inferProbabilitySheetDefaultsFromFull,
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

  it('formatCountrySheetSignalsSummary states missing sheet fields (B.30)', () => {
    const empty = formatCountrySheetSignalsSummary(buildCountrySheetSignals({}))
    assert.ok(empty && empty.includes('non renseigné'))
    const s = formatCountrySheetSignalsSummary({
      acceptance_rate_morocco: '50%',
      friction_score: null,
      brutal_reality_score: null,
    })
    assert.ok(s && s.includes('50%'))
    assert.ok(s && s.includes('non renseignée'))
  })

  it('inferProbabilitySheetDefaultsFromFull detects gaps', () => {
    assert.deepEqual(inferProbabilitySheetDefaultsFromFull({}), [
      'acceptance_rate_morocco',
      'friction_score',
      'brutal_reality_score',
    ])
    assert.deepEqual(
      inferProbabilitySheetDefaultsFromFull({
        acceptance_rate_morocco: '40%',
        friction_score: 10,
        brutal_reality_score: 5,
      }),
      [],
    )
  })

  it('orderedProbabilityBreakdown annotates labels when defaults used', () => {
    const rows = orderedProbabilityBreakdown(
      { acceptance: 50, countryContext: 60, appointmentEase: 40, riskImmigration: 55 },
      ['acceptance_rate_morocco', 'friction_score'],
    )
    const acc = rows.find((r) => r.key === 'acceptance')
    const appt = rows.find((r) => r.key === 'appointmentEase')
    assert.ok(acc?.label.includes('neutre'))
    assert.ok(appt?.label.includes('neutre'))
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
      }).includes('non renseigné'),
    )
  })
})
