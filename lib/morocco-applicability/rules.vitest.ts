import { describe, expect, it } from 'vitest'

import { evaluateMoroccoApplicability } from '@/lib/morocco-applicability/rules'

describe('evaluateMoroccoApplicability', () => {
  it('case A — universal scope includes Morocco', () => {
    const r = evaluateMoroccoApplicability({
      countryIso: 'MA',
      scopeText: 'all nationalities',
      destinationIso: 'FR',
    })
    expect(r.case).toBe('A')
    expect(r.decision).toBe('include')
  })

  it('case E — exempt passport', () => {
    const r = evaluateMoroccoApplicability({
      countryIso: 'MA',
      destinationIso: 'TR',
      moroccanVisaExempt: true,
    })
    expect(r.case).toBe('E')
    expect(r.decision).toBe('include')
  })

  it('never silently excludes unknown scope', () => {
    const r = evaluateMoroccoApplicability({
      countryIso: 'MA',
      scopeText: 'special visa category XYZ',
      destinationIso: 'DE',
    })
    expect(r.decision).toBe('review')
  })
})
