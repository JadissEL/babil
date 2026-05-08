import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { appendProfileContextNarratives, formatGoalTypeLabelFr } from './probability-profile-narrative'

describe('appendProfileContextNarratives', () => {
  it('adds age and goal lines to primary and optional secondary', () => {
    const primary: string[] = []
    const secondary: string[] = []
    appendProfileContextNarratives(
      { age: 20, goal_type: 'études' },
      { primary, secondary },
    )
    assert.ok(primary.some((s) => s.includes('jeune')))
    assert.ok(primary.some((s) => s.includes('études')))
    assert.ok(secondary.some((s) => s.includes('Comparez')))
  })

  it('returns early when goal_type empty', () => {
    const primary: string[] = []
    appendProfileContextNarratives({ age: 30 }, { primary })
    assert.equal(primary.length, 0)
  })
})

describe('formatGoalTypeLabelFr', () => {
  it('maps common goals', () => {
    assert.equal(formatGoalTypeLabelFr('tourism'), 'Tourisme')
    assert.equal(formatGoalTypeLabelFr('STUDY'), 'Études / formation')
    assert.equal(formatGoalTypeLabelFr('travail'), 'Travail')
  })
})
