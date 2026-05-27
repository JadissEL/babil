import { describe, expect, it } from 'vitest';
import { enrichCountryApiRecord } from '@/lib/enrich-country-api';
import {
  applyExplorerFiltersAndSort,
  countryMatchesExplorerFilters,
  resolveExplorerFilterProfile,
  type ExplorerFilterState,
} from '@/lib/explorer-filter-engine';
import { getExplorerFilterProfileForSlug } from '@/lib/explorer-filter-profiles';
import { objectiveWeightedScore, COMPARE_OBJECTIVES } from '@/lib/compare-objectives';

function mockCountry(overrides: Record<string, unknown> = {}) {
  return enrichCountryApiRecord({
    id: 1,
    name: 'Testland',
    region: 'Europe',
    appointment_difficulty: 'Medium',
    tourist_visa_score: 70,
    study_visa_score: 40,
    work_visa_score: 40,
    business_visa_score: 40,
    full_data: {},
    ...overrides,
  });
}

const baseState = (patch: Partial<ExplorerFilterState> = {}): ExplorerFilterState => ({
  objectiveSlug: null,
  goal: 'all',
  region: 'all',
  budget: 'all',
  difficulty: 'all',
  friction: 'all',
  schengenOnly: false,
  q: '',
  mode: 'explorer',
  ...patch,
});

describe('resolveExplorerFilterProfile', () => {
  it('prefers objective URL slug over coarse goal', () => {
    const state = baseState({ goal: 'study', objectiveSlug: 'studies_phd' });
    const profile = resolveExplorerFilterProfile(state, null);
    expect(profile.slug).toBe('studies_phd');
    expect(profile.moduleAccessSignal).toBe('phdPresence');
  });

  it('uses preference slug when objective absent', () => {
    const state = baseState({ goal: 'all' });
    const profile = resolveExplorerFilterProfile(state, 'tourism');
    expect(profile.slug).toBe('tourism');
  });
});

describe('countryMatchesExplorerFilters', () => {
  it('tourism dbScalar treats missing scalar as neutral 50', () => {
    const profile = getExplorerFilterProfileForSlug('tourism')!;
    const missing = mockCountry({ tourist_visa_score: null });
    const state = baseState({ objectiveSlug: 'tourism' });
    expect(countryMatchesExplorerFilters(missing, state, profile, 50)).toBe(true);
  });

  it('tourism dbScalar gate rejects low stored tourism score', () => {
    const profile = {
      ...getExplorerFilterProfileForSlug('tourism')!,
      primaryGatePercentile: undefined,
      primaryScoreMin: 55,
    };
    const weak = mockCountry({ tourist_visa_score: 4 });
    const strong = mockCountry({ tourist_visa_score: 7 });
    const state = baseState({ objectiveSlug: 'tourism' });
    expect(countryMatchesExplorerFilters(weak, state, profile, 55)).toBe(false);
    expect(countryMatchesExplorerFilters(strong, state, profile, 55)).toBe(true);
  });

  it('tourism profile filters a strict subset of a mixed list', () => {
    const list = [
      mockCountry({ id: 1, name: 'Strong', tourist_visa_score: 8 }),
      mockCountry({ id: 2, name: 'Weak', tourist_visa_score: 4 }),
      mockCountry({ id: 3, name: 'Mid', tourist_visa_score: 5 }),
    ];
    const state = baseState({ objectiveSlug: 'tourism' });
    const { filtered } = applyExplorerFiltersAndSort(list, state, 'tourism');
    expect(filtered.length).toBeLessThan(list.length);
    expect(filtered.some((c) => c.name === 'Strong')).toBe(true);
    expect(filtered.some((c) => c.name === 'Weak')).toBe(false);
  });

  it('studies_phd requires phd signal', () => {
    const profile = getExplorerFilterProfileForSlug('studies_phd')!;
    const noPhd = mockCountry({ full_data: {} });
    const state = baseState({ objectiveSlug: 'studies_phd' });
    expect(countryMatchesExplorerFilters(noPhd, state, profile)).toBe(false);
  });

  it('training_language uses languageStudy module gate', () => {
    const profile = getExplorerFilterProfileForSlug('training_language')!;
    const bare = mockCountry({
      full_data: { education_mobility: {} },
      study_visa_score: 80,
    });
    const withLang = mockCountry({
      full_data: {
        education_mobility: {
          language_study: { access: 'high' },
        },
      },
      study_visa_score: 80,
    });
    const state = baseState({ objectiveSlug: 'training_language' });
    expect(countryMatchesExplorerFilters(bare, state, profile)).toBe(false);
    expect(countryMatchesExplorerFilters(withLang, state, profile)).toBe(true);
  });
});

describe('sortExplorerCountries via applyExplorerFiltersAndSort', () => {
  it('recommendation mode sorts by objective-weighted score for tourism', () => {
    const a = mockCountry({ id: 1, name: 'Alpha', tourist_visa_score: 9, work_visa_score: 15 });
    const b = mockCountry({ id: 2, name: 'Beta', tourist_visa_score: 7, work_visa_score: 92 });
    const state = baseState({ objectiveSlug: 'tourism', mode: 'recommendation' });
    const { filtered } = applyExplorerFiltersAndSort([a, b], state, 'tourism');
    expect(filtered.map((c) => c.name)).toEqual(['Alpha', 'Beta']);
  });
});
