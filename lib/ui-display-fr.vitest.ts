import { describe, expect, it } from 'vitest'
import {
  appointmentDifficultyLabelFr,
  displayTokenFr,
  educationAccessLabelFr,
  englishScoreLevelToFr,
  formatDelaiJours,
  formatScalarSur10,
  formatScoreSur100,
  frictionBandLabelFr,
  mobilityTierLabelFr,
  scenicPlaceLabelFr,
} from '@/lib/ui-display-fr'

describe('ui-display-fr', () => {
  it('maps mobility tiers to French', () => {
    expect(mobilityTierLabelFr('Strong')).toBe('Favorable')
    expect(mobilityTierLabelFr('Medium')).toBe('Moyen')
    expect(mobilityTierLabelFr('Weak')).toBe('Limité')
  })

  it('maps friction bands to French', () => {
    expect(frictionBandLabelFr('Low')).toContain('faciles')
    expect(frictionBandLabelFr('High')).toContain('difficiles')
  })

  it('formats score and delay in plain French', () => {
    expect(formatScoreSur100(63.2)).toBe('63 sur 100')
    expect(formatScalarSur10(7.5)).toBe('7.5 sur 10')
    expect(formatDelaiJours(1)).toBe('1 jour')
    expect(formatDelaiJours(21)).toBe('21 jours')
  })

  it('maps appointment difficulty and score levels', () => {
    expect(appointmentDifficultyLabelFr('Medium')).toBe('Moyenne')
    expect(appointmentDifficultyLabelFr('Extreme')).toBe('Très difficile')
    expect(englishScoreLevelToFr('Very High')).toBe('Très élevé')
  })

  it('maps education access', () => {
    expect(educationAccessLabelFr('high')).toBe('Élevé')
    expect(educationAccessLabelFr('Moyen')).toBe('Moyen')
  })

  it('scenic place fallback is French', () => {
    expect(scenicPlaceLabelFr('France')).toBe('Lieu emblématique — France')
    expect(scenicPlaceLabelFr('France', 'Paris')).toBe('Paris')
  })

  it('displayTokenFr maps known enums', () => {
    expect(displayTokenFr('Medium')).toBe('Moyen')
  })
})
