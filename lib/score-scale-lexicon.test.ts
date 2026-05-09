import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { SCORE_SCALE_LEGEND_FR, SCALE_ENGINE_MAX, SCALE_VISA_PRISMA_MAX } from './score-scale-lexicon'

describe('score-scale-lexicon', () => {
  it('exports consistent bounds', () => {
    assert.equal(SCALE_VISA_PRISMA_MAX, 10)
    assert.equal(SCALE_ENGINE_MAX, 100)
  })

  it('legend strings are non-empty', () => {
    assert.ok(SCORE_SCALE_LEGEND_FR.visaBarsSubtitle.length > 20)
    assert.ok(SCORE_SCALE_LEGEND_FR.prismaVisaColumns.includes('1–10'))
    assert.ok(SCORE_SCALE_LEGEND_FR.pipelineObservationConfidence.includes('0–1'))
  })
})
