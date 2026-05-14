import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildCountryDisplayCopy } from './country-display-copy';

describe('buildCountryDisplayCopy', () => {
  it('adds the Schengen suffix to title and region label for member countries', () => {
    const copy = buildCountryDisplayCopy('France', 'Europe');
    assert.equal(copy.schengen, true);
    assert.equal(copy.regionLabel, 'Europe, espace Schengen');
    assert.equal(copy.title, 'France — visa & mobilité · Schengen');
    assert.match(copy.description, /^Scores visa, friction, études, business et permis pour France/);
    assert.match(copy.description, /\(Europe, espace Schengen\)/);
    assert.match(copy.description, /perspective Maroc \/ VisaFlow\.$/);
  });

  it('omits the Schengen suffix for non-member countries', () => {
    const copy = buildCountryDisplayCopy('Canada', 'Amérique du Nord');
    assert.equal(copy.schengen, false);
    assert.equal(copy.regionLabel, 'Amérique du Nord');
    assert.equal(copy.title, 'Canada — visa & mobilité');
    assert.match(copy.description, /\(Amérique du Nord\) — perspective Maroc \/ VisaFlow\.$/);
  });

  it('handles Schengen alias names (English canonical forms)', () => {
    const copy = buildCountryDisplayCopy('Germany', 'Europe');
    assert.equal(copy.schengen, true);
    assert.equal(copy.title, 'Germany — visa & mobilité · Schengen');
  });

  it('produces a stable description shape that matches the JSON-LD builder contract', () => {
    const copy = buildCountryDisplayCopy('Maroc', 'Afrique du Nord');
    assert.equal(copy.title, 'Maroc — visa & mobilité');
    assert.ok(copy.description.includes('Maroc'));
    assert.ok(copy.description.includes('Afrique du Nord'));
  });
});
