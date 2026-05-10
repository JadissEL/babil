import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { compareHrefForExplorerGoal, compareHrefForExplorerPageState, compareHrefForHomeQuickFilters, explorerGoalToCompareObjectiveId } from '@/lib/explorer-goal-to-compare-objective'

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
    assert.equal(compareHrefForExplorerGoal('study'), '/compare?objective=studies_master')
  })
})

describe('compareHrefForExplorerPageState', () => {
  it('merges objective with explorer-style params', () => {
    const href = compareHrefForExplorerPageState({
      goal: 'work',
      budget: 'low',
      region: 'Europe',
      difficulty: 'Medium',
      schengenOnly: true,
    })
    const q = new URLSearchParams(href.split('?')[1] ?? '')
    assert.equal(q.get('objective'), 'work')
    assert.equal(q.get('budget'), 'low')
    assert.equal(q.get('region'), 'europe')
    assert.equal(q.get('difficulty'), 'Medium')
    assert.equal(q.get('schengen'), '1')
  })
})

describe('compareHrefForHomeQuickFilters', () => {
  it('maps home filters to compare query', () => {
    const href = compareHrefForHomeQuickFilters('study', 'high', 'Schengen', 'low')
    const q = new URLSearchParams(href.split('?')[1] ?? '')
    assert.equal(q.get('objective'), 'studies_master')
    assert.equal(q.get('budget'), 'high')
    assert.equal(q.get('region'), 'schengen')
    assert.equal(q.get('difficulty'), 'Low')
  })
})
