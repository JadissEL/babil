import assert from 'node:assert/strict';
import { test } from 'node:test';
import { recoProbaPostBodySchema } from '@/lib/api-schemas/reco-proba-post-body';

test('recoProbaPostBodySchema accepts empty object and playground', () => {
  assert.equal(recoProbaPostBodySchema.safeParse({}).success, true);
  const r = recoProbaPostBodySchema.safeParse({ playground: true, profile: { age: 30 } });
  assert.equal(r.success, true);
  if (r.success) {
    assert.equal(r.data.playground, true);
    assert.equal((r.data.profile as { age?: number })?.age, 30);
  }
});

test('recoProbaPostBodySchema rejects non-object root', () => {
  assert.equal(recoProbaPostBodySchema.safeParse([]).success, false);
  assert.equal(recoProbaPostBodySchema.safeParse('x').success, false);
});

test('recoProbaPostBodySchema rejects wrong types for known keys', () => {
  assert.equal(recoProbaPostBodySchema.safeParse({ playground: 'yes' }).success, false);
  assert.equal(recoProbaPostBodySchema.safeParse({ profile: 'nope' }).success, false);
});
