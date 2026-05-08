import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma'
import { materializePublicFullData } from '@/lib/country-full-data-materialize'
import { hasCountryPhdStoredData } from '@/lib/country-phd-studies'
import { loadFallbackCountries } from '@/lib/countries-fallback'
import { buildMergedCountriesList } from '@/lib/countries-prisma-merge'
import { mergedVisaScores100WithDb } from '@/lib/scoring/prisma-visa-snapshot'

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

  let profile: unknown = body.profile;
  if (
    profile === null ||
    profile === undefined ||
    (typeof profile === 'object' &&
      !Array.isArray(profile) &&
      Object.keys(profile as Record<string, unknown>).length === 0)
  ) {
    profile = undefined;
  }

  try {
    // If no profile provided in body, try to fetch from DB
    if (!profile) {
      const dbProfile = await prisma.userProfile.findUnique({
        where: { userId: userId as string }
      });
      if (dbProfile) {
        profile = dbProfile;
      } else {
        // Fallback to demo profile if nothing found
        profile = {
          age: 35,
          marital_status: 'single',
          profession: 'self-employed',
          income: 8000,
          savings: 70000,
          CNSS_status: true,
          family_in_europe: true,
          family_details: "Frère PR Italie, Sœur PR France"
        };
      }
    }

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

    const p = profile as Record<string, unknown>
    const savings = Number(p.savings ?? 0)
    const income = Number(p.income ?? 0)
    const safeSavings = Number.isFinite(savings) && savings >= 0 ? savings : 0
    const safeIncome = Number.isFinite(income) && income >= 0 ? income : 0
    
    const results = countries.map((c: any) => {
      const full = materializePublicFullData(c.full_data ?? null);
      const phdStudiesData = hasCountryPhdStoredData(full);
      
      // 📊 FACTEURS DE CALCUL
      
      // 1. 💰 FACTEUR FINANCIER (20%)
      const financialScore = Math.min(100, (safeSavings / 100000) * 100 * 0.6 + (safeIncome / 15000) * 100 * 0.4);
      
      // 2. 🧾 FACTEUR PROFESSIONNEL (20%)
      let profScore = 40; // Default
      if (Boolean(p.CNSS_status)) profScore += 40;
      if (p.profession === 'public') profScore += 20;
      else if (p.profession === 'self-employed') profScore += 10;
      
      // 3. 👨‍👩‍👧 FACTEUR LIENS SOCIAUX (20%)
      let socialScore = 50;
      if (String(p.marital_status ?? '').toLowerCase() === 'married') socialScore += 10;
      if (Boolean(p.family_in_europe)) {
        // Double effect: credibility network vs suspicion
        if (['Italie', 'France', 'Espagne', 'Grèce'].includes(c.name)) {
          socialScore += 20; // Stronger network
        } else {
          socialScore -= 5; // Suspicion risk
        }
      }
      
      // 4. 🌍 FACTEUR PAYS (20%) — taux d’acceptation + facilité visa (mêmes moteurs que enrich / compare)
      const acceptanceRaw = String(full.acceptance_rate_morocco ?? '50').replace(/%/g, '').trim()
      const acceptanceParsed = Number.parseInt(acceptanceRaw, 10)
      const acceptanceScore = Number.isFinite(acceptanceParsed)
        ? Math.min(100, Math.max(0, acceptanceParsed))
        : 50
      const visaMerged = mergedVisaScores100WithDb(c.full_data ?? full, {
        tourist_visa_score: c.tourist_visa_score,
        study_visa_score: c.study_visa_score,
        work_visa_score: c.work_visa_score,
        business_visa_score: c.business_visa_score,
        street_food_business_access: c.street_food_business_access,
      })
      const visaEase100 =
        (visaMerged.tourism + visaMerged.study + visaMerged.work + visaMerged.business) / 4
      const countryContextScore = Math.min(
        100,
        Math.max(0, acceptanceScore * 0.58 + visaEase100 * 0.42),
      )
      
      // 5. 📅 FACTEUR RENDEZ-VOUS (10%)
      const friction = Number(full.friction_score)
      const accessibilityScore = Number.isFinite(friction)
        ? Math.min(100, Math.max(0, 100 - friction))
        : 50;
      
      // 6. 📉 FACTEUR RISQUE IMMIGRATION (10%)
      const brutal = Number(full.brutal_reality_score)
      const riskScore = Number.isFinite(brutal)
        ? Math.min(100, Math.max(0, 100 - brutal * 10))
        : 50;

      let globalScore = Math.round(
        financialScore * 0.2 +
          profScore * 0.2 +
          socialScore * 0.2 +
          countryContextScore * 0.2 +
          accessibilityScore * 0.1 +
          riskScore * 0.1,
      )
      if (phdStudiesData) globalScore = Math.min(100, globalScore + 3);

      let level = "Medium";
      if (globalScore >= 80) level = "Very High";
      else if (globalScore >= 60) level = "High";
      else if (globalScore < 40) level = "Low";
      else if (globalScore < 20) level = "Very Low";

      // ⚠️ KEY REASONS
      const reasons = [];
      if (Boolean(p.CNSS_status)) reasons.push("La déclaration CNSS est un atout majeur pour votre dossier.");
      if (safeSavings > 50000) reasons.push("Votre épargne démontre une solidité financière rassurante.");
      if (Boolean(p.family_in_europe)) reasons.push("Vos attaches familiales en Europe peuvent servir de garanties.");
      if (globalScore < 50) reasons.push("Le statut d'indépendant sans revenus élevés est perçu comme un risque migratoire.");
      if (phdStudiesData) {
        reasons.push('Fiche pays avec bloc doctorat PhD structuré (visa long séjour / financement).');
      }

      // 💡 STRATEGY LAYER
      const strategy = [];
      if (safeSavings < 50000) strategy.push("Augmentez votre épargne bloquée pour atteindre le seuil de 70k MAD.");
      if (!Boolean(p.CNSS_status)) strategy.push("Régularisez votre situation CNSS au moins 6 mois avant la demande.");
      strategy.push("Privilégiez une demande hors période de haute saison pour éviter la saturation des rendez-vous.");

      return {
        id: c.id,
        country: c.name,
        globalScore,
        level,
        reasons,
        strategy,
        breakdown: {
          finance: Math.round(financialScore),
          profession: Math.round(profScore),
          social: Math.round(socialScore),
          acceptance: Math.round(acceptanceScore),
          visaEase: Math.round(visaEase100),
          countryContext: Math.round(countryContextScore),
          phdStudiesData,
        }
      };
    }).sort((a: any, b: any) => b.globalScore - a.globalScore);

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
