import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { materializePublicFullData } from '@/lib/country-full-data-materialize'
import { hasCountryPhdStoredData } from '@/lib/country-phd-studies'
import { buildMergedCountriesList } from '@/lib/countries-prisma-merge'
import { loadFallbackCountries } from '@/lib/countries-fallback'
import { computeBusinessMobility100 } from '@/lib/scoring/business-mobility'
import { computeStudyMobility100 } from '@/lib/scoring/study-mobility'
import { computeTourismMobility100 } from '@/lib/scoring/tourism-mobility'
import { computeWorkMobility100 } from '@/lib/scoring/work-mobility'
import { mergeModelWithDbScalar01to100 } from '@/lib/scoring/scalar-override'

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

function normalizeProfile(profile: any): NormalizedProfile {
  const goalRaw = String(profile.goal ?? profile.goal_type ?? 'TOURISM').toUpperCase();
  const allowed: Goal[] = ['TOURISM', 'STUDY', 'WORK', 'BUSINESS', 'SHORT_COURSE'];
  const goal = (allowed.includes(goalRaw as Goal) ? goalRaw : 'TOURISM') as Goal;

  return {
    income: toNumber(profile.income, 0),
    savings: toNumber(profile.savings, 0),
    cnss: Boolean(profile.cnss ?? profile.CNSS_status),
    maritalStatus: String(profile.maritalStatus ?? profile.marital_status ?? 'SINGLE').toUpperCase(),
    familyInEU: Boolean(profile.familyInEU ?? profile.family_in_europe),
    goal,
  };
}

function inferCountryBudgetThreshold(country: any): number {
  const name = String(country.name || '').toLowerCase();
  if (['switzerland', 'norway', 'denmark', 'sweden', 'finland', 'canada', 'usa'].some((x) => name.includes(x))) return 14000;
  if (['france', 'italie', 'italy', 'espagne', 'spain', 'germany', 'allemagne', 'netherlands', 'uk', 'united kingdom'].some((x) => name.includes(x))) return 10000;
  return 7000;
}

function readCountrySignals(country: any) {
  const full = materializePublicFullData(country.full_data ?? null);
  const normalizedVisa = country.visa ?? {};
  const normalizedFriction = country.friction ?? {};
  const normalizedEdu = country.education ?? {};
  const normalizedBiz = country.business ?? {};

  const frictionAnalysis = full.friction_analysis as Record<string, unknown> | undefined;
  const appointmentAudit = full.appointment_audit as Record<string, unknown> | undefined;
  const educationMobility = full.education_mobility as Record<string, unknown> | undefined;
  const visaSystem = full.visa_system as Record<string, unknown> | undefined;
  const streetFood = full.street_food as Record<string, unknown> | undefined;

  const modelTourism = computeTourismMobility100({ full })
  const touristScore = mergeModelWithDbScalar01to100(modelTourism, country.tourist_visa_score, 12)
  const modelStudy = computeStudyMobility100({ full })
  const studyScore = mergeModelWithDbScalar01to100(modelStudy, country.study_visa_score, 12)
  const modelWork = computeWorkMobility100({ full })
  const workScore = mergeModelWithDbScalar01to100(modelWork, country.work_visa_score, 12)
  const modelBiz = computeBusinessMobility100({
    full,
    streetFoodBusinessAccess:
      typeof country.street_food_business_access === 'string' ? country.street_food_business_access : null,
  })
  const businessScore = mergeModelWithDbScalar01to100(modelBiz, country.business_visa_score, 12)

  const rejectionRisk = clamp(toNumber(normalizedVisa.rejectionRisk ?? frictionAnalysis?.friction_score ?? 45, 45));
  const appointmentDifficulty = clamp(
    toNumber(
      normalizedFriction.appointmentDifficulty ??
      appointmentAudit?.official_difficulty === 'High'
        ? 75
        : appointmentAudit?.official_difficulty === 'Medium'
          ? 50
          : 35,
      50
    )
  );

  const averageWaitDays = clamp(
    toNumber(
      normalizedFriction.averageWaitDays ??
      (String(frictionAnalysis?.real_delay || '').includes('mois') ? 90 : 30),
      30
    ),
    0,
    365
  );

  const transparencyScore = clamp(
    toNumber(normalizedFriction.transparencyScore ?? frictionAnalysis?.transparency_score ?? 50, 50)
  );

  const education = {
    languageStudy: Boolean(normalizedEdu.languageStudy ?? educationMobility?.language_study),
    technicalTraining: Boolean(normalizedEdu.technicalTraining ?? educationMobility?.technical_training),
    shortCourses: Boolean(normalizedEdu.shortCourses ?? educationMobility?.short_courses),
    /** `full_data.phd_studies` renseigné (hors squelette UI uniquement) */
    phdStudiesStructured: hasCountryPhdStoredData(full),
  };

  const business = {
    canOpenBusiness: Boolean(normalizedBiz.canOpenBusiness ?? visaSystem?.business),
    streetFoodFriendly: ['high', 'medium'].includes(String(streetFood?.opportunity || '').toLowerCase()),
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
  };
}

function computeRecommendation(country: any, profile: NormalizedProfile) {
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
    s.appointmentDifficulty * 0.5 + waitNormalized * 0.3 + transparencyInverted * 0.2
  );
  const frictionScore = clamp(100 - frictionPenalty);

  if (frictionScore >= 70) explanations.push('Système de rendez-vous relativement gérable.');
  if (frictionScore < 45) warnings.push('Friction élevée: délais/prise de RDV potentiellement critiques.');

  // 3) Goal match
  let goalMatch = 50;
  if (profile.goal === 'STUDY') {
    goalMatch += s.education.languageStudy ? 20 : -5;
    goalMatch += s.education.technicalTraining ? 20 : -10;
    goalMatch += s.education.shortCourses ? 8 : 0;
    if (s.education.phdStudiesStructured) {
      goalMatch += 10;
      explanations.push('Bloc doctorat PhD structuré disponible sur la fiche pays pour affiner visa / financement.');
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
  if (profile.goal === 'TOURISM' && (profile.income < threshold || profile.savings < threshold * 2)) {
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
    visaScore * 0.4 +
    frictionScore * 0.2 +
    goalMatchScore * 0.25 +
    (100 - riskScore) * 0.15
  );

  if (visaScore >= 70) explanations.push('Bonne adéquation visa pour votre objectif.');
  if (goalMatchScore >= 70) explanations.push('Objectif utilisateur bien aligné avec le pays.');
  if (riskScore >= 65) warnings.push('Risque de refus au-dessus de la moyenne.');

  return {
    id: country.id,
    name: country.name,
    score: Math.round(finalScore),
    breakdown: {
      visa: Math.round(visaScore),
      friction: Math.round(frictionScore),
      goalMatch: Math.round(goalMatchScore),
      risk: Math.round(riskScore),
    },
    explanation: explanations.slice(0, 4),
    warnings: warnings.slice(0, 4),
    reason:
      explanations[0] ||
      'Score équilibré selon visa, friction, adéquation d’objectif et risque.',
    level:
      finalScore >= 80 ? 'Very High' : finalScore >= 68 ? 'High' : finalScore >= 52 ? 'Medium' : 'Low',
    match_score: Number((finalScore / 10).toFixed(1)), // backward compatibility
  };
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    const raw = await req.json();
    body = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const profile =
    body.profile && typeof body.profile === 'object' && body.profile !== null ? body.profile : {};

  try {
    const normalizedProfile = normalizeProfile(profile);
    let countries: any[] = []
    try {
      countries = await buildMergedCountriesList()
    } catch {
      countries = []
    }
    if (!countries.length) {
      try {
        countries = await loadFallbackCountries()
      } catch {
        countries = []
      }
    }
    const recommendations = countries
      .map((c: any) => computeRecommendation(c, normalizedProfile))
      .sort((a, b) => b.score - a.score);

    return NextResponse.json(recommendations.slice(0, 10));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
