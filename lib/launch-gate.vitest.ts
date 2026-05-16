import { describe, it } from 'vitest';
import assert from 'node:assert/strict';

import { MOROCCO_PACK_VERSION } from '@/lib/morocco-content-constants';
import { evaluateLaunchGate } from '@/lib/launch-gate';

describe('launch gate', () => {
  it('fails when morocco pack version missing', () => {
    const r = evaluateLaunchGate(
      {
        id: 1,
        name: 'Testland',
        region: 'Asia',
        schengen_flag: false,
        tourist_visa_score: 5,
        study_visa_score: 5,
        work_visa_score: 5,
        business_visa_score: 5,
        appointment_difficulty: 'Medium',
        full_data: {
          official_score: 5,
          friction_score: 50,
          acceptance_rate_morocco: 'x',
          tourist_visa_score: 5,
          study_visa_score: 5,
          work_visa_score: 5,
          business_visa_score: 5,
          appointment_difficulty: 'Medium',
          appointment_audit: {
            platform: 'p',
            official_difficulty: 'a',
            real_difficulty: 'b',
            avg_wait_time: 'c',
            issues: ['x'],
          },
          friction_analysis: { risk_level: 'Medium' },
          visa_system: {
            tourism: { difficulty: 'x' },
            work: { availability: true },
            business: { setup: 'x' },
          },
          education_mobility: {
            language_study: { access: 'x' },
            technical_training: { access: 'x' },
            short_courses: { access: 'x' },
          },
          street_food: { opportunity: 'x' },
          driving_license: { status: 'x', conversion_possible: true },
          travel_reasons: [{ id: '1' }],
          traveler_quotes: [{ id: 'q' }],
          traveler_quotes_meta: { status: 'collecting' },
          overview: { extract: 'hello' },
          economy: { gdp_usd: 1 },
          _agent: {
            updatedAt: new Date().toISOString(),
            coverageManifest: {},
            completeness: { score: 99 },
          },
          morocco_research_pack: {},
        },
      },
      { minCompleteness: 0 },
    );
    assert.equal(r.pass, false);
    assert.ok(r.reasons.some((x) => x.includes('morocco_research_pack')));
  });

  it('passes minimal synthetic payload when contract satisfied', () => {
    const full = {
      official_score: 5,
      friction_score: 50,
      acceptance_rate_morocco:
        'À vérifier sur la source officielle (consulat / TLS / VFS) pour un dossier déposé depuis le Maroc.',
      tourist_visa_score: 5,
      study_visa_score: 5,
      work_visa_score: 5,
      business_visa_score: 5,
      appointment_difficulty: 'Medium',
      appointment_audit: {
        platform: 'TLS',
        official_difficulty: 'Medium',
        real_difficulty: 'High',
        avg_wait_time: '4w',
        issues: ['Limited slots'],
      },
      friction_analysis: { risk_level: 'Medium' },
      visa_system: {
        tourism: { difficulty: 'Medium' },
        work: { availability: true },
        business: { setup: 'Standard' },
      },
      education_mobility: {
        language_study: { access: 'OK' },
        technical_training: { access: 'OK' },
        short_courses: { access: 'OK' },
      },
      street_food: { opportunity: 'Medium' },
      driving_license: { status: 'Valid', conversion_possible: false },
      travel_reasons: [{ id: 'r1', title: 't', description: 'd', imageUrl: 'u', imageAlt: 'a' }],
      traveler_quotes: [],
      traveler_quotes_meta: { status: 'collecting' },
      overview: { extract: 'Summary text long enough.' },
      economy: { gdp_usd: 1_000_000 },
      morocco_insights: { reality: 'x', pro_tip: 'y', darija_note: 'z' },
      morocco_research_pack: {
        _pack_version: MOROCCO_PACK_VERSION,
        immigration_legal: { summary: 's' },
        work_business: { summary: 's' },
        education: { summary: 's' },
        costs_life_mad: { summary: 's' },
        society_demographics: { summary: 's' },
        mobility_transport: { summary: 's' },
        climate_geography: { summary: 's' },
        special_programs: { summary: 's' },
        driving_license_detail: { summary: 's' },
        qualitative_moroccan_lens: { summary: 's' },
        extended_criteria: { summary: 's' },
      },
      _agent: {
        updatedAt: new Date().toISOString(),
        coverageManifest: { ok: true },
        completeness: { score: 95 },
      },
    };
    const r = evaluateLaunchGate(
      {
        id: 2,
        name: 'Synthland',
        region: 'Europe',
        schengen_flag: true,
        tourist_visa_score: 5,
        study_visa_score: 5,
        work_visa_score: 5,
        business_visa_score: 5,
        appointment_difficulty: 'Medium',
        full_data: full as unknown as Record<string, unknown>,
      },
      { minCompleteness: 50 },
    );
    assert.equal(r.pass, true);
  });

  it('treats gdp_wb_series_unavailable as economy contract coverage', () => {
    const full = {
      official_score: 5,
      friction_score: 50,
      acceptance_rate_morocco:
        'À vérifier sur la source officielle (consulat / TLS / VFS) pour un dossier déposé depuis le Maroc.',
      tourist_visa_score: 5,
      study_visa_score: 5,
      work_visa_score: 5,
      business_visa_score: 5,
      appointment_difficulty: 'Medium',
      appointment_audit: {
        platform: 'TLS',
        official_difficulty: 'Medium',
        real_difficulty: 'High',
        avg_wait_time: '4w',
        issues: ['Limited slots'],
      },
      friction_analysis: { risk_level: 'Medium' },
      visa_system: {
        tourism: { difficulty: 'Medium' },
        work: { availability: true },
        business: { setup: 'Standard' },
      },
      education_mobility: {
        language_study: { access: 'OK' },
        technical_training: { access: 'OK' },
        short_courses: { access: 'OK' },
      },
      street_food: { opportunity: 'Medium' },
      driving_license: { status: 'Valid', conversion_possible: false },
      travel_reasons: [{ id: 'r1', title: 't', description: 'd', imageUrl: 'u', imageAlt: 'a' }],
      traveler_quotes: [],
      traveler_quotes_meta: { status: 'collecting' },
      overview: { extract: 'Summary text long enough.' },
      economy: { gdp_wb_series_unavailable: true },
      morocco_insights: { reality: 'x', pro_tip: 'y', darija_note: 'z' },
      morocco_research_pack: {
        _pack_version: MOROCCO_PACK_VERSION,
        immigration_legal: { summary: 's' },
        work_business: { summary: 's' },
        education: { summary: 's' },
        costs_life_mad: { summary: 's' },
        society_demographics: { summary: 's' },
        mobility_transport: { summary: 's' },
        climate_geography: { summary: 's' },
        special_programs: { summary: 's' },
        driving_license_detail: { summary: 's' },
        qualitative_moroccan_lens: { summary: 's' },
        extended_criteria: { summary: 's' },
      },
      _agent: {
        updatedAt: new Date().toISOString(),
        coverageManifest: { ok: true },
        completeness: { score: 95 },
      },
    };
    const r = evaluateLaunchGate(
      {
        id: 3,
        name: 'Atollia',
        region: 'Oceania',
        schengen_flag: false,
        tourist_visa_score: 5,
        study_visa_score: 5,
        work_visa_score: 5,
        business_visa_score: 5,
        appointment_difficulty: 'Medium',
        full_data: full as unknown as Record<string, unknown>,
      },
      { minCompleteness: 50 },
    );
    assert.equal(r.pass, true);
    assert.ok(!r.criticalMissingKeys.includes('economy_gdp_usd'));
  });
});
