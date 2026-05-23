import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { evaluateIngestionQualityGate } from './quality-gates';

describe('evaluateIngestionQualityGate', () => {
  it('quarantines low-confidence numeric', () => {
    const r = evaluateIngestionQualityGate({
      fieldPath: 'economy.gdp_usd_current',
      confidence: 0.4,
      hasNumericValue: true,
      sourceUrl: 'https://example.com',
      rawExcerpt: null,
    });
    assert.equal(r.decision, 'quarantine');
    assert.equal(r.verificationStatus, 'pending');
  });

  it('rejects empty field path', () => {
    const r = evaluateIngestionQualityGate({
      fieldPath: '',
      confidence: 0.9,
      hasNumericValue: true,
      sourceUrl: null,
      rawExcerpt: null,
    });
    assert.equal(r.decision, 'reject');
  });
});
