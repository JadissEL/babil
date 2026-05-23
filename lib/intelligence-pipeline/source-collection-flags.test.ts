import assert from 'node:assert/strict';
import { describe, it, afterEach } from 'node:test';
import {
  isIntelligenceSourceCollectionEnabled,
  parseDisabledIntelligenceSourceSlugs,
  resetIntelligenceSourceDisabledCacheForTests,
} from './source-collection-flags';

describe('source-collection-flags (C.52)', () => {
  afterEach(() => {
    delete process.env.INTELLIGENCE_SOURCE_DISABLED_SLUGS;
    resetIntelligenceSourceDisabledCacheForTests();
  });

  it('parseDisabledIntelligenceSourceSlugs splits and lowercases', () => {
    const s = parseDisabledIntelligenceSourceSlugs(' World_bank_OPEN_data , oecd,');
    assert.ok(s.has('world_bank_open_data'));
    assert.ok(s.has('oecd'));
    assert.equal(s.size, 2);
  });

  it('isIntelligenceSourceCollectionEnabled respects env', () => {
    process.env.INTELLIGENCE_SOURCE_DISABLED_SLUGS = 'world_bank_open_data';
    assert.equal(isIntelligenceSourceCollectionEnabled('world_bank_open_data'), false);
    assert.equal(isIntelligenceSourceCollectionEnabled('OECD'), true);
  });
});
