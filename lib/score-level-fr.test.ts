import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { englishScoreLevelToFr } from './score-level-fr'

describe('englishScoreLevelToFr', () => {
  it('maps API levels to French labels', () => {
    assert.equal(englishScoreLevelToFr('Very High'), 'Très élevé')
    assert.equal(englishScoreLevelToFr('High'), 'Élevé')
    assert.equal(englishScoreLevelToFr('Medium'), 'Moyen')
    assert.equal(englishScoreLevelToFr('Low'), 'Faible')
    assert.equal(englishScoreLevelToFr('Very Low'), 'Très faible')
  })

  it('returns undefined for empty input and passes through unknown strings', () => {
    assert.equal(englishScoreLevelToFr(undefined), undefined)
    assert.equal(englishScoreLevelToFr(''), undefined)
    assert.equal(englishScoreLevelToFr('Custom'), 'Custom')
  })
})
