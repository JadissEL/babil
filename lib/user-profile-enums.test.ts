import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  USER_GOAL_TYPES,
  coerceStoredProfession,
  parseUserGoalType,
  parseUserProfession,
  userGoalTypeToEngineGoal,
} from './user-profile-enums'

describe('user-profile-enums (B.34–B.35)', () => {
  it('parses goals with synonyms and education → study', () => {
    assert.equal(parseUserGoalType('education'), 'study')
    assert.equal(parseUserGoalType('TOURISM'), 'tourism')
    assert.equal(parseUserGoalType('short_course'), 'short_course')
    assert.equal(parseUserGoalType('nope'), null)
    assert.ok(USER_GOAL_TYPES.includes('short_course'))
  })

  it('maps to engine uppercase goals', () => {
    assert.equal(userGoalTypeToEngineGoal('study'), 'STUDY')
    assert.equal(userGoalTypeToEngineGoal(null), 'TOURISM')
  })

  it('parses profession enum only', () => {
    assert.equal(parseUserProfession('public'), 'public')
    assert.equal(parseUserProfession('not-a-job'), null)
  })

  it('coerceStoredProfession maps unknown to other', () => {
    assert.equal(coerceStoredProfession('legacy-text'), 'other')
    assert.equal(coerceStoredProfession(null), null)
  })
})
