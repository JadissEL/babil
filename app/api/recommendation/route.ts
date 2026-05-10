import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { publicApiErrorMessage } from '@/lib/api-public-error';
import { mutationOriginDeniedResponse } from '@/lib/mutation-origin-guard';
import { materializePublicFullDataForApi } from '@/lib/country-full-data-materialize';
import { hasCountryPhdStoredData } from '@/lib/country-phd-studies';
import { buildMergedCountriesList } from '@/lib/countries-prisma-merge';
import { loadFallbackCountries } from '@/lib/countries-fallback';
import { checkEnginePostContentLength } from '@/lib/engine-post-body-limits';
import { checkEnginePostRateLimit } from '@/lib/engine-post-rate-limit';
import { computeBusinessMobility100 } from '@/lib/scoring/business-mobility';
import { computeStudyMobility100 } from '@/lib/scoring/study-mobility';
import { computeTourismMobility100 } from '@/lib/scoring/tourism-mobility';
import { computeWorkMobility100 } from '@/lib/scoring/work-mobility';
import { mergeModelWithDbScalar01to100 } from '@/lib/scoring/scalar-override';
import { BABIL_ENGINE_VERSION, engineVersionHeaders } from '@/lib/engine-version';
import { computeRecommendationTopDrivers } from '@/lib/score-driver-explain';
import { appendProfileContextNarratives } from '@/lib/probability-profile-narrative';
import { buildCountrySheetSignals } from '@/lib/probability-result-display';
import { PUBLIC_READ_ONLY_DEMO_PROFILE } from '@/lib/public-read-only-demo-profile';
import { sanitizePublicSyntheticProfile } from '@/lib/public-synthetic-profile';
import {
  recoProbaPostBodySchema,
  type RecoProbaPostBody,
} from '@/lib/api-schemas/reco-proba-post-body';
import type { EngineCountryListRow } from '@/lib/types/engine-country-list-row';
import type { RecommendationApiItem } from '@/lib/types/api-recommendation-probability';
import { parseUserGoalType, userGoalTypeToEngineGoal } from '@/lib/user-profile-enums';

type Goal = 'TOURISM' | 'STUDY' | 'WORK' | 'BUSINESS' | 'SHORT_COURSE';

type NormalizedProfile = {
  income: number;
  savings: number;
  cnss: boolean;
  maritalStatus: string;
  familyInEU: boolean;
  goal: Goal;
};

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const toNumber = (value: unknown, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

function normalizeProfile(profile: Record<string, unknown>): NormalizedProfile {
  const goal = userGoalTypeToEngineGoal(
    parseUserGoalType(profile.goal ?? profile.goal_type),
  ) as Goal;

  return {
    income: toNumber(profile.income, 0),
    savings: toNumber(profile.savings, 0),
    cnss: Boolean(profile.cnss ?? profile.CNSS_status),
    maritalStatus: String(
      profile.maritalStatus ?? profile.marital_status ?? 'SINGLE',
    ).toUpperCase(),
    familyInEU: Boolean(profile.familyInEU ?? profile.family_in_europe),
    goal,
  };
}

function inferCountryBudgetThreshold(country: Pick<EngineCountryListRow, 'name'>): number {
  const name = String(country.name || '').toLowerCase();
  if (
    ['switzerland', 'norway', 'denmark', 'sweden', 'finland', 'canada', 'usa'].some((x) =>
      name.includes(x),
    )
  )
    return 14000;
  if (
    [
      'france',
      'italie',
      'italy',
      'espagne',
      'spain',
      'germany',
      'allemagne',
      'netherlands',
      'uk',
      'united kingdom',
    ].some((x) => name.includes(x))
  )
    return 10000;
  return 7000;
}

function readCountrySignals(country: EngineCountryListRow) {
  const full = materializePublicFullDataForApi(country.full_data ?? null);
  const normalizedVisa = country.visa ?? {};
  const normalizedFriction = country.friction ?? {};
  const normalizedEdu = country.education ?? {};
  const normalizedBiz = country.business ?? {};

  const frictionAnalysis = full.friction_analysis as Record<string, unknown> | undefined;
  const appointmentAudit = full.appointment_audit as Record<string, unknown> | undefined;
  const educationMobility = full.education_mobility as Record<string, unknown> | undefined;
  const visaSystem = full.visa_system as Record<string, unknown> | undefined;
  const streetFood = full.street_food as Record<string, unknown> | undefined;

  const modelTourism = computeTourismMobility100({ full });
  const touristScore = mergeModelWithDbScalar01to100(modelTourism, country.tourist_visa_score, 12);
  const modelStudy = computeStudyMobility100({ full });
  const studyScore = mergeModelWithDbScalar01to100(modelStudy, country.study_visa_score, 12);
  const modelWork = computeWorkMobility100({ full });
  const workScore = mergeModelWithDbScalar01to100(modelWork, country.work_visa_score, 12);
  const modelBiz = computeBusinessMobility100({
    full,
    streetFoodBusinessAccess:
      typeof country.street_food_business_access === 'string'
        ? country.street_food_business_access
        : null,
  });
  const businessScore = mergeModelWithDbScalar01to100(modelBiz, country.business_visa_score, 12);

  const rejectionRisk = clamp(
    toNumber(normalizedVisa.rejectionRisk ?? frictionAnalysis?.friction_score ?? 45, 45),
  );
  const appointmentDifficulty = clamp(
    toNumber(
      (normalizedFriction.appointmentDifficulty ?? appointmentAudit?.official_difficulty === 'High')
        ? 75
        : appointmentAudit?.official_difficulty === 'Medium'
          ? 50
          : 35,
      50,
    ),
  );

  const averageWaitDays = clamp(
    toNumber(
      normalizedFriction.averageWaitDays ??
        (String(frictionAnalysis?.real_delay || '').includes('mois') ? 90 : 30),
      30,
    ),
    0,
    365,
  );

  const transparencyScore = clamp(
    toNumber(
      normalizedFriction.transparencyScore ?? frictionAnalysis?.transparency_score ?? 50,
      50,
    ),
  );

  const education = {
    languageStudy: Boolean(normalizedEdu.languageStudy ?? educationMobility?.language_study),
    technicalTraining: Boolean(
      normalizedEdu.technicalTraining ?? educationMobility?.technical_training,
    ),
    shortCourses: Boolean(normalizedEdu.shortCourses ?? educationMobility?.short_courses),
    /** `full_data.phd_studies` renseigné (hors squelette UI uniquement) */
    phdStudiesStructured: hasCountryPhdStoredData(full),
  };

  const business = {
    canOpenBusiness: Boolean(normalizedBiz.canOpenBusiness ?? visaSystem?.business),
    streetFoodFriendly: ['high', 'medium'].includes(
      String(streetFood?.opportunity || '').toLowerCase(),
    ),
  };

  return {
    touristScore: clamp(touristScore),
    studyScore: clamp(studyScore),
    workScore: clamp(workScore),
    businessScore: clamp(businessScore),
    rejectionRisk,
    appointmentDifficulty,
    averageWaitDays,
    transparencyScore,
    education,
    business,
    countrySignals: buildCountrySheetSignals(full as Record<string, unknown>),
  };
}

function computeRecommendation(
  country: EngineCountryListRow,
  profile: NormalizedProfile,
): RecommendationApiItem {
  const s = readCountrySignals(country);
  const explanations: string[] = [];
  const warnings: string[] = [];

  // 1) Visa fit
  let visaBase =
    profile.goal === 'STUDY'
      ? s.studyScore
      : profile.goal === 'WORK'
        ? s.workScore
        : profile.goal === 'BUSINESS'
          ? s.businessScore
          : s.touristScore; // TOURISM + SHORT_COURSE

  const threshold = inferCountryBudgetThreshold(country);
  if (profile.income < threshold) {
    const penalty = clamp(((threshold - profile.income) / threshold) * 25, 10, 25);
    visaBase -= penalty;
    warnings.push(`Capacité financière inférieure au seuil estimé (${threshold}).`);
  } else if (profile.savings >= threshold * 6) {
    visaBase += 10;
    explanations.push('Épargne solide pour absorber les coûts de mobilité.');
  } else if (profile.savings >= threshold * 3) {
    visaBase += 5;
  }

  if (profile.cnss) {
    visaBase += 10;
    explanations.push('Stabilité professionnelle (CNSS) favorable au dossier.');
  }

  if (profile.familyInEU) {
    visaBase += 5;
    explanations.push('Présence familiale en Europe renforçant certains scénarios.');
  }

  const visaScore = clamp(visaBase);

  // 2) Friction (inverted)
  const waitNormalized = clamp((s.averageWaitDays / 180) * 100); // 6 months saturates
  const transparencyInverted = 100 - s.transparencyScore;
  const frictionPenalty = clamp(
    s.appointmentDifficulty * 0.5 + waitNormalized * 0.3 + transparencyInverted * 0.2,
  );
  const frictionScore = clamp(100 - frictionPenalty);

  if (frictionScore >= 70) explanations.push('Système de rendez-vous relativement gérable.');
  if (frictionScore < 45)
    warnings.push('Friction élevée: délais/prise de RDV potentiellement critiques.');

  // 3) Goal match
  let goalMatch = 50;
  if (profile.goal === 'STUDY') {
    goalMatch += s.education.languageStudy ? 20 : -5;
    goalMatch += s.education.technicalTraining ? 20 : -10;
    goalMatch += s.education.shortCourses ? 8 : 0;
    if (s.education.phdStudiesStructured) {
      goalMatch += 10;
      explanations.push(
        'Bloc doctorat PhD structuré disponible sur la fiche pays pour affiner visa / financement.',
      );
    }
  } else if (profile.goal === 'BUSINESS') {
    goalMatch += s.business.canOpenBusiness ? 30 : -15;
    goalMatch += s.business.streetFoodFriendly ? 15 : 0;
  } else if (profile.goal === 'SHORT_COURSE') {
    goalMatch += s.education.shortCourses ? 35 : -20;
  } else if (profile.goal === 'WORK') {
    goalMatch += (s.workScore - 50) * 0.7;
  } else {
    // TOURISM neutral
    goalMatch += 5;
  }
  const goalMatchScore = clamp(goalMatch);

  // 4) Risk engine
  let risk = s.rejectionRisk;
  if (
    profile.goal === 'TOURISM' &&
    (profile.income < threshold || profile.savings < threshold * 2)
  ) {
    risk += 15;
    warnings.push('Profil financier limite pour tourisme: risque de refus accru.');
  }
  if (profile.maritalStatus === 'SINGLE') {
    risk += 5;
  }
  if (profile.familyInEU) {
    risk += s.appointmentDifficulty > 65 ? 10 : 5;
  }
  const riskScore = clamp(risk);

  // Final weighted score
  const finalScore = clamp(
    visaScore * 0.4 + frictionScore * 0.2 + goalMatchScore * 0.25 + (100 - riskScore) * 0.15,
  );

  if (visaScore >= 70) explanations.push('Bonne adéquation visa pour votre objectif.');
  if (goalMatchScore >= 70) explanations.push('Objectif utilisateur bien aligné avec le pays.');
  if (riskScore >= 65) warnings.push('Risque de refus au-dessus de la moyenne.');

  const breakdown = {
    visa: Math.round(visaScore),
    friction: Math.round(frictionScore),
    goalMatch: Math.round(goalMatchScore),
    risk: Math.round(riskScore),
  };

  return {
    id: country.id,
    name: country.name,
    score: Math.round(finalScore),
    breakdown,
    topDrivers: computeRecommendationTopDrivers(breakdown),
    countrySignals: s.countrySignals,
    hasPhdStudies: s.education.phdStudiesStructured,
    explanation: explanations.slice(0, 4),
    warnings: warnings.slice(0, 4),
    reason:
      explanations[0] || 'Score équilibré selon visa, friction, adéquation d’objectif et risque.',
    level:
      finalScore >= 80
        ? 'Very High'
        : finalScore >= 68
          ? 'High'
          : finalScore >= 52
            ? 'Medium'
            : 'Low',
    match_score: Number((finalScore / 10).toFixed(1)), // backward compatibility
  };
}

export async function POST(req: Request) {
  const denied = mutationOriginDeniedResponse(req);
  if (denied) return denied;

  const { userId } = await auth();

  const lenCheck = checkEnginePostContentLength(req);
  if (!lenCheck.ok) {
    return NextResponse.json(
      { error: `Request body too large (max ${lenCheck.maxBytes} bytes)` },
      { status: 413, headers: engineVersionHeaders('recommendation') },
    );
  }

  const rl = checkEnginePostRateLimit(userId, req);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfterSec: rl.retryAfterSec, limit: rl.limit },
      {
        status: 429,
        headers: {
          ...engineVersionHeaders('recommendation'),
          'Retry-After': String(rl.retryAfterSec),
        },
      },
    );
  }

  let body: RecoProbaPostBody;
  try {
    const raw = await req.json();
    const parsed = recoProbaPostBodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: parsed.error.flatten() },
        { status: 400, headers: engineVersionHeaders('recommendation') },
      );
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const playground = body.playground === true;
  let profile: Record<string, unknown>;
  if (userId) {
    profile =
      body.profile && typeof body.profile === 'object' && body.profile !== null
        ? (body.profile as Record<string, unknown>)
        : {};
  } else if (
    playground &&
    body.profile &&
    typeof body.profile === 'object' &&
    body.profile !== null
  ) {
    profile = sanitizePublicSyntheticProfile(body.profile as Record<string, unknown>);
  } else {
    profile = { ...PUBLIC_READ_ONLY_DEMO_PROFILE };
  }

  try {
    const normalizedProfile = normalizeProfile(profile);
    let countries: EngineCountryListRow[] = [];
    try {
      countries = await buildMergedCountriesList();
    } catch {
      countries = [];
    }
    if (!countries.length) {
      try {
        countries = await loadFallbackCountries();
      } catch {
        countries = [];
      }
    }
    const recommendations = countries
      .map((c) => computeRecommendation(c, normalizedProfile))
      .sort((a, b) => b.score - a.score);

    const profileRecord =
      profile && typeof profile === 'object' && profile !== null
        ? (profile as Record<string, unknown>)
        : {};
    const narrativePrimary: string[] = [];
    const narrativeSecondary: string[] = [];
    appendProfileContextNarratives(profileRecord, {
      primary: narrativePrimary,
      secondary: narrativeSecondary,
    });
    const narrativePrefix = [...narrativePrimary, ...narrativeSecondary];
    let top = recommendations[0];
    if (narrativePrefix.length > 0 && top) {
      top = {
        ...top,
        explanation: [...narrativePrefix, ...(top.explanation ?? [])].slice(0, 12),
      };
    }
    const rest = recommendations.slice(1);
    const merged = top ? [top, ...rest] : recommendations;

    return NextResponse.json(merged.slice(0, 10), {
      headers: engineVersionHeaders('recommendation'),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: publicApiErrorMessage(error, 'Recommendation failed'),
        engineVersion: BABIL_ENGINE_VERSION,
      },
      { status: 500, headers: engineVersionHeaders('recommendation') },
    );
  }
}
