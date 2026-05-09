import test from 'node:test'
import assert from 'node:assert/strict'
import { sanitizePublicSyntheticProfile } from './public-synthetic-profile'

test('sanitizePublicSyntheticProfile clamps income and savings', () => {
  const p = sanitizePublicSyntheticProfile({
    income: 999_999_999,
    savings: -50,
    goal_type: 'study',
  })
  assert.equal(p.income, 15_000_000)
  assert.equal(p.savings, 0)
  assert.equal(p.goal_type, 'study')
})

test('sanitizePublicSyntheticProfile normalizes unknown goal to tourism', () => {
  const p = sanitizePublicSyntheticProfile({ goal_type: 'nope' })
  assert.equal(p.goal_type, 'tourism')
})

test('sanitizePublicSyntheticProfile drops invalid age', () => {
  const p = sanitizePublicSyntheticProfile({ age: 10 })
  assert.equal('age' in p, false)
})

test('sanitizePublicSyntheticProfile maps education to study', () => {
  const p = sanitizePublicSyntheticProfile({ goal_type: 'education' })
  assert.equal(p.goal_type, 'study')
})

test('sanitizePublicSyntheticProfile is idempotent on output shape', () => {
  const a = sanitizePublicSyntheticProfile({ income: 5000, goal_type: 'work' })
  const b = sanitizePublicSyntheticProfile(a as Record<string, unknown>)
  assert.equal(a.income, b.income)
  assert.equal(a.goal_type, b.goal_type)
})
