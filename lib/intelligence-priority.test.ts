import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { scoreCountryPriority } from './intelligence-priority';

describe('scoreCountryPriority', () => {
  it('scores stale agent data higher', () => {
    const stale = scoreCountryPriority({
      countryId: 1,
      name: 'France',
      region: 'Europe',
      fullData: {},
    });
    const fresh = scoreCountryPriority({
      countryId: 2,
      name: 'Spain',
      region: 'Europe',
      fullData: { _agent: { updatedAt: new Date().toISOString() } },
    });
    assert.ok(stale > fresh);
  });
});
