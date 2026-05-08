import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { compareHrefForExplorerGoal, explorerGoalToCompareObjectiveId } from '@/lib/explorer-goal-to-compare-objective'

describe('explorerGoalToCompareObjectiveId', () => {
  it('maps explorer goals to compare objectives', () => {
    assert.equal(explorerGoalToCompareObjectiveId('tourism'), 'tourism')
    assert.equal(explorerGoalToCompareObjectiveId('study'), 'studies_master')
    assert.equal(explorerGoalToCompareObjectiveId('short_course'), 'training_short_technical')
    assert.equal(explorerGoalToCompareObjectiveId('all'), null)
  })
})

describe('compareHrefForExplorerGoal', () => {
  it('builds compare URLs', () => {
    assert.equal(compareHrefForExplorerGoal('all'), '/compare')
    assert.equal(compareHrefForExplorerGoal('work'), '/compare?objective=work')
  })
})
