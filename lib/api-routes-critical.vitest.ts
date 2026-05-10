import { describe, it, expect, vi, beforeAll } from 'vitest';
import { GET as getCountries } from '@/app/api/countries/route';
import { POST as postProbability } from '@/app/api/probability/route';
import { POST as postRecommendation } from '@/app/api/recommendation/route';
import type { LegacyCountryRecord } from '@/lib/countries-fallback';

beforeAll(() => {
  process.env.BABIL_ENGINE_RATE_LIMIT_DISABLED = '1';
});

const { testMergedCountries } = vi.hoisted(() => {
  const high: LegacyCountryRecord = {
    id: 99,
    name: 'HighScoreland',
    region: 'Other',
    schengen_flag: false,
    tourist_visa_score: 10,
    study_visa_score: 10,
    work_visa_score: 10,
    business_visa_score: 10,
    appointment_difficulty: 'Low',
    full_data: {
      acceptance_rate_morocco: '99',
      friction_score: 5,
      brutal_reality_score: 1,
    },
    comments: [],
  };
  const low: LegacyCountryRecord = {
    id: 42,
    name: 'Testland',
    region: 'Other',
    schengen_flag: false,
    tourist_visa_score: 6,
    study_visa_score: 6,
    work_visa_score: 6,
    business_visa_score: 6,
    appointment_difficulty: 'Low',
    full_data: {
      acceptance_rate_morocco: '40',
      friction_score: 80,
      brutal_reality_score: 6,
    },
    comments: [],
  };
  return { testMergedCountries: [high, low] };
});

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => Promise.resolve({ userId: null as string | null })),
}));

vi.mock('@/lib/countries-prisma-merge', () => ({
  augmentPrismaCountriesForPublicPayload: vi.fn(
    (countries: unknown, _mergeFallback: unknown) => countries as LegacyCountryRecord[],
  ),
  buildMergedCountriesList: vi.fn(() => Promise.resolve(testMergedCountries)),
}));

describe('GET /api/countries (minimal)', () => {
  it('returns 200 and a JSON array when merge returns rows', async () => {
    const res = await getCountries(new Request('http://test.local/api/countries'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(2);
    expect(data[0]).toMatchObject({ id: 99, name: 'HighScoreland' });
  });

  it('returns paginated envelope when limit is set', async () => {
    const res = await getCountries(new Request('http://test.local/api/countries?limit=10'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.items).toHaveLength(2);
    expect(data.hasMore).toBe(false);
  });
});

describe('POST /api/recommendation (minimal)', () => {
  it('rejects invalid body with 400', async () => {
    const res = await postRecommendation(
      new Request('http://test.local/api/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: 'not-an-object' }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it('returns ranked recommendations for anonymous demo profile', async () => {
    const res = await postRecommendation(
      new Request('http://test.local/api/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data.length).toBeLessThanOrEqual(10);
    expect(data[0]).toMatchObject({
      id: 99,
      score: expect.any(Number),
      breakdown: expect.any(Object),
    });
  });

  it('pins focusCountryId first when provided', async () => {
    const res = await postRecommendation(
      new Request('http://test.local/api/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focusCountryId: 42 }),
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toMatchObject({ id: 42, name: 'Testland' });
  });
});

describe('POST /api/probability (minimal)', () => {
  it('rejects invalid body with 400', async () => {
    const res = await postProbability(
      new Request('http://test.local/api/probability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: ['x'] }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it('returns probability rows for anonymous user', async () => {
    const res = await postProbability(
      new Request('http://test.local/api/probability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toMatchObject({
      id: 99,
      country: 'HighScoreland',
      globalScore: expect.any(Number),
      breakdown: expect.any(Object),
    });
  });

  it('pins focusCountryId first when provided', async () => {
    const res = await postProbability(
      new Request('http://test.local/api/probability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focusCountryId: 42 }),
      }),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toMatchObject({ id: 42, country: 'Testland' });
  });
});
