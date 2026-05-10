import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { publicApiErrorMessage } from '@/lib/api-public-error';
import { isDbUnavailable } from '@/lib/db-resilience';
import { mutationOriginDeniedResponse } from '@/lib/mutation-origin-guard';
import prisma from '@/lib/prisma';
import { serializedGoalTypeForProfileResponse } from '@/lib/user-objectives/profile-goal-coalesce';
import {
  USER_GOAL_TYPES,
  USER_PROFESSIONS,
  coerceStoredProfession,
  parseUserGoalType,
  parseUserProfession,
} from '@/lib/user-profile-enums';

function withObjectiveFields(profile: Record<string, unknown>) {
  return {
    ...profile,
    primary_objective_slug:
      typeof profile.primary_objective_slug === 'string' ? profile.primary_objective_slug : null,
    secondary_objective_slugs: Array.isArray(profile.secondary_objective_slugs)
      ? profile.secondary_objective_slugs
      : [],
    objective_wizard_completed_at: profile.objective_wizard_completed_at ?? null,
  };
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: userId as string },
    });
    if (!profile) return NextResponse.json(null);
    const base = {
      ...profile,
      profession: coerceStoredProfession(profile.profession),
      goal_type: serializedGoalTypeForProfileResponse({
        goal_type: profile.goal_type,
        primary_objective_slug: profile.primary_objective_slug,
      }),
    };
    return NextResponse.json(withObjectiveFields(base as unknown as Record<string, unknown>));
  } catch (error: unknown) {
    if (isDbUnavailable(error)) return NextResponse.json(null);
    return NextResponse.json(
      { error: publicApiErrorMessage(error, 'Profile read failed') },
      { status: 500 },
    );
  }
}

function parseBody(data: Record<string, unknown>) {
  const age = Number.parseInt(String(data.age ?? ''), 10);
  if (!Number.isFinite(age) || age < 16 || age > 120) {
    return { error: 'age must be a number between 16 and 120' as const };
  }

  const income = Number.parseFloat(String(data.income ?? ''));
  const savings = Number.parseFloat(String(data.savings ?? ''));
  if (!Number.isFinite(income) || income < 0) {
    return { error: 'income must be a non-negative number' as const };
  }
  if (!Number.isFinite(savings) || savings < 0) {
    return { error: 'savings must be a non-negative number' as const };
  }

  const marital_status =
    typeof data.marital_status === 'string' && data.marital_status.trim()
      ? data.marital_status.trim()
      : null;
  const family_details =
    typeof data.family_details === 'string' ? data.family_details.trim().slice(0, 4000) : null;

  const professionRaw =
    typeof data.profession === 'string' && data.profession.trim() ? data.profession.trim() : null;
  if (professionRaw) {
    const p = parseUserProfession(professionRaw);
    if (!p) {
      return {
        error: `profession must be one of: ${USER_PROFESSIONS.join(', ')}` as const,
      };
    }
  }

  const goalRaw =
    typeof data.goal_type === 'string' && data.goal_type.trim() ? data.goal_type.trim() : null;
  let goal_type: string | null = null;
  if (goalRaw) {
    const g = parseUserGoalType(goalRaw);
    if (!g) {
      return {
        error:
          `goal_type must be one of: ${USER_GOAL_TYPES.join(', ')} (synonymes: education → study)` as const,
      };
    }
    goal_type = g;
  }

  return {
    value: {
      age,
      profession: professionRaw ? parseUserProfession(professionRaw)! : null,
      income,
      savings,
      CNSS_status: Boolean(data.CNSS_status),
      marital_status,
      family_in_europe: Boolean(data.family_in_europe),
      family_details,
      goal_type,
    },
  };
}

export async function POST(req: Request) {
  const denied = mutationOriginDeniedResponse(req);
  if (denied) return denied;

  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let data: Record<string, unknown>;
  try {
    const raw = await req.json();
    data = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = parseBody(data);
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const email = user.emailAddresses?.[0]?.emailAddress ?? `${userId}@unknown.local`;
  const displayName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || null;

  try {
    await prisma.user.upsert({
      where: { id: userId as string },
      update: { email, name: displayName },
      create: { id: userId as string, email, name: displayName },
    });

    const v = parsed.value;
    const profile = await prisma.userProfile.upsert({
      where: { userId: userId as string },
      update: {
        age: v.age,
        profession: v.profession,
        income: v.income,
        savings: v.savings,
        CNSS_status: v.CNSS_status,
        marital_status: v.marital_status,
        family_in_europe: v.family_in_europe,
        family_details: v.family_details,
        goal_type: v.goal_type,
      },
      create: {
        userId: userId as string,
        age: v.age,
        profession: v.profession,
        income: v.income,
        savings: v.savings,
        CNSS_status: v.CNSS_status,
        marital_status: v.marital_status,
        family_in_europe: v.family_in_europe,
        family_details: v.family_details,
        goal_type: v.goal_type,
      },
    });

    const base = {
      ...profile,
      profession: coerceStoredProfession(profile.profession),
      goal_type: serializedGoalTypeForProfileResponse({
        goal_type: profile.goal_type,
        primary_objective_slug: profile.primary_objective_slug,
      }),
    };
    return NextResponse.json(withObjectiveFields(base as unknown as Record<string, unknown>));
  } catch (error: unknown) {
    return NextResponse.json(
      { error: publicApiErrorMessage(error, 'Profile update failed') },
      { status: 500 },
    );
  }
}
