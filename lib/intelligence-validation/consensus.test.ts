import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildFieldConsensus, canPromoteField } from './consensus';

describe('buildFieldConsensus', () => {
  it('marks numeric disagreement as disputed', () => {
    const consensus = buildFieldConsensus(1, 'economy.gdp_usd_current', [
      {
        id: 'a',
        countryId: 1,
        fieldPath: 'economy.gdp_usd_current',
        valueJson: JSON.stringify({ value: 100 }),
        valueNumeric: 100,
        confidence: 0.9,
        observedAt: new Date('2026-01-01'),
        tier: 'TIER_A_OFFICIAL',
      },
      {
        id: 'b',
        countryId: 1,
        fieldPath: 'economy.gdp_usd_current',
        valueJson: JSON.stringify({ value: 200 }),
        valueNumeric: 200,
        confidence: 0.9,
        observedAt: new Date('2026-01-02'),
        tier: 'TIER_B_MULTILATERAL',
      },
    ]);
    assert.equal(consensus.disputed, true);
    assert.equal(consensus.verificationStatus, 'disputed');
    assert.equal(canPromoteField(consensus), false);
  });

  it('allows promotion for agreeing official-tier observations', () => {
    const consensus = buildFieldConsensus(1, 'economy.gdp_usd_current', [
      {
        id: 'a',
        countryId: 1,
        fieldPath: 'economy.gdp_usd_current',
        valueJson: JSON.stringify({ value: 100 }),
        valueNumeric: 100,
        confidence: 0.8,
        observedAt: new Date('2026-01-01'),
        tier: 'TIER_A_OFFICIAL',
      },
      {
        id: 'b',
        countryId: 1,
        fieldPath: 'economy.gdp_usd_current',
        valueJson: JSON.stringify({ value: 102 }),
        valueNumeric: 102,
        confidence: 0.75,
        observedAt: new Date('2026-01-02'),
        tier: 'TIER_A_OFFICIAL',
      },
    ]);
    assert.equal(consensus.disputed, false);
    assert.ok(canPromoteField(consensus));
  });
});
