import { describe, expect, it } from 'vitest'

import {
  describeTopCountrySignals,
  orderedProbabilityBreakdown,
  probabilityBreakdownLabel,
} from './probability-result-display'

describe('probability-result-display', () => {
  it('orders breakdown keys and skips invalid numbers', () => {
    const rows = orderedProbabilityBreakdown({
      visaEase: 70,
      finance: 'x',
      acceptance: 55,
      appointmentEase: 80,
    })
    expect(rows.map((r) => r.key)).toEqual(['acceptance', 'visaEase', 'appointmentEase'])
    expect(probabilityBreakdownLabel('acceptance')).toBe('Acceptation (indicateur fiche)')
  })

  it('describeTopCountrySignals falls back when empty', () => {
    expect(describeTopCountrySignals(null)).toContain('Les scores combinent')
    expect(
      describeTopCountrySignals({
        acceptance_rate_morocco: '62%',
        friction_score: 41,
        brutal_reality_score: 6,
      }),
    ).toMatch(/62%/)
    expect(
      describeTopCountrySignals({
        acceptance_rate_morocco: null,
        friction_score: null,
        brutal_reality_score: null,
      }),
    ).toContain('Les scores combinent')
  })
})
