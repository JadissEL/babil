import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { historyEventTypeLabelFr } from './history-event-labels'

describe('historyEventTypeLabelFr', () => {
  it('maps known API types', () => {
    assert.equal(historyEventTypeLabelFr('VIEW_COUNTRY'), 'Consultation fiche pays')
  })

  it('passes through unknown types', () => {
    assert.equal(historyEventTypeLabelFr('CUSTOM_EVENT'), 'CUSTOM_EVENT')
  })
})
