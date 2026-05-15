import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  isExplorerNavHrefInPerspective,
  isPhdPerspectiveRelevant,
} from '@/lib/user-objectives/perspective-nav';
import { getObjectiveBySlug } from '@/lib/user-objectives/registry';

describe('perspective-nav', () => {
  it('shows all hubs when no primary objective (onboarding)', () => {
    assert.equal(isExplorerNavHrefInPerspective('/education', null), true);
    assert.equal(isExplorerNavHrefInPerspective('/business', null), true);
    assert.equal(isPhdPerspectiveRelevant(null), true);
  });

  it('hides education hub for work perspective', () => {
    const def = getObjectiveBySlug('work');
    assert.ok(def);
    assert.equal(isExplorerNavHrefInPerspective('/education', def), false);
    assert.equal(isExplorerNavHrefInPerspective('/education/language-study', def), false);
    assert.equal(isPhdPerspectiveRelevant(def), false);
  });

  it('shows education hub for studies / training / events', () => {
    assert.equal(
      isExplorerNavHrefInPerspective('/education', getObjectiveBySlug('studies_phd')),
      true,
    );
    assert.equal(
      isExplorerNavHrefInPerspective('/education', getObjectiveBySlug('training_language')),
      true,
    );
    assert.equal(
      isExplorerNavHrefInPerspective('/education', getObjectiveBySlug('events')),
      true,
    );
    assert.equal(isPhdPerspectiveRelevant(getObjectiveBySlug('studies_phd')), true);
    assert.equal(isPhdPerspectiveRelevant(getObjectiveBySlug('training_language')), false);
  });

  it('gates investment nav for work-only perspective', () => {
    const work = getObjectiveBySlug('work');
    assert.ok(work);
    assert.equal(isExplorerNavHrefInPerspective('/investment', work), false);
    assert.equal(isExplorerNavHrefInPerspective('/business', work), true);
  });

  it('shows investment for investment slug', () => {
    const inv = getObjectiveBySlug('investment');
    assert.ok(inv);
    assert.equal(isExplorerNavHrefInPerspective('/investment', inv), true);
  });
});
