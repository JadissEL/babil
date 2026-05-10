import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { publicApiErrorMessage } from '@/lib/api-public-error';
import { isDbUnavailable } from '@/lib/db-resilience';
import { mutationOriginDeniedResponse } from '@/lib/mutation-origin-guard';
import prisma from '@/lib/prisma';
import { serializedGoalTypeForProfileResponse } from '@/lib/user-objectives/profile-goal-coalesce';
import { getObjectiveBySlug, isUserObjectiveSlug } from '@/lib/user-objectives/registry';
import { coerceStoredProfession } from '@/lib/user-profile-enums';

function parseSecondarySlugs(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const x of raw) {
    if (typeof x === 'string' && isUserObjectiveSlug(x.trim()) && !out.includes(x.trim())) {
      out.push(x.trim());
    }
  }
  return out.slice(0, 5);
}

export async function POST(req: Request) {
  const denied = mutationOriginDeniedResponse(req);
  if (denied) return denied;

  const { userId } = await auth();
  const user = await currentUser();
  if (!userId || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    const raw = await req.json();
    body = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  /** Skip onboarding without choosing a primary objective (synced for logged-in users). */
  if (body.dismiss_objective_wizard === true) {
    const email = user.emailAddresses?.[0]?.emailAddress ?? `${userId}@unknown.local`;
    const displayName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || null;
    const now = new Date();
    try {
      await prisma.user.upsert({
        where: { id: userId as string },
        update: { email, name: displayName },
        create: { id: userId as string, email, name: displayName },
      });
      const profile = await prisma.userProfile.upsert({
        where: { userId: userId as string },
        update: { objective_wizard_completed_at: now },
        create: {
          userId: userId as string,
          objective_wizard_completed_at: now,
          CNSS_status: false,
          family_in_europe: false,
        },
      });
      return NextResponse.json({
        ok: true,
        objective_wizard_completed_at: profile.objective_wizard_completed_at ?? null,
      });
    } catch (error: unknown) {
      if (isDbUnavailable(error)) {
        return NextResponse.json({ ok: true, degraded: true });
      }
      return NextResponse.json(
        { error: publicApiErrorMessage(error, 'Wizard dismiss failed') },
        { status: 500 },
      );
    }
  }

  /** Clear wizard completion so the objective assistant can show again (logged-in sync). */
  if (body.reopen_objective_wizard === true) {
    const email = user.emailAddresses?.[0]?.emailAddress ?? `${userId}@unknown.local`;
    const displayName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || null;
    try {
      await prisma.user.upsert({
        where: { id: userId as string },
        update: { email, name: displayName },
        create: { id: userId as string, email, name: displayName },
      });
      await prisma.userProfile.updateMany({
        where: { userId: userId as string },
        data: { objective_wizard_completed_at: null },
      });
      return NextResponse.json({ ok: true, objective_wizard_completed_at: null });
    } catch (error: unknown) {
      if (isDbUnavailable(error)) {
        return NextResponse.json({ ok: true, degraded: true });
      }
      return NextResponse.json(
        { error: publicApiErrorMessage(error, 'Wizard reopen failed') },
        { status: 500 },
      );
    }
  }

  const primaryRaw =
    typeof body.primary_objective_slug === 'string' ? body.primary_objective_slug.trim() : '';
  if (!isUserObjectiveSlug(primaryRaw)) {
    return NextResponse.json({ error: 'Invalid primary_objective_slug' }, { status: 400 });
  }

  const secondary = parseSecondarySlugs(body.secondary_objective_slugs);
  const def = getObjectiveBySlug(primaryRaw);
  if (!def) {
    return NextResponse.json({ error: 'Unknown objective' }, { status: 400 });
  }

  const email = user.emailAddresses?.[0]?.emailAddress ?? `${userId}@unknown.local`;
  const displayName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || null;

  try {
    await prisma.user.upsert({
      where: { id: userId as string },
      update: { email, name: displayName },
      create: { id: userId as string, email, name: displayName },
    });

    const now = new Date();
    const profile = await prisma.userProfile.upsert({
      where: { userId: userId as string },
      update: {
        goal_type: def.engineGoal,
        primary_objective_slug: primaryRaw,
        secondary_objective_slugs: secondary,
        objective_wizard_completed_at: now,
      },
      create: {
        userId: userId as string,
        goal_type: def.engineGoal,
        primary_objective_slug: primaryRaw,
        secondary_objective_slugs: secondary,
        objective_wizard_completed_at: now,
        CNSS_status: false,
        family_in_europe: false,
      },
    });

    return NextResponse.json({
      ok: true,
      ...profile,
      profession: coerceStoredProfession(profile.profession),
      goal_type: serializedGoalTypeForProfileResponse({
        goal_type: profile.goal_type,
        primary_objective_slug: profile.primary_objective_slug,
      }),
      primary_objective_slug: profile.primary_objective_slug ?? null,
      secondary_objective_slugs: Array.isArray(profile.secondary_objective_slugs)
        ? profile.secondary_objective_slugs
        : secondary,
      objective_wizard_completed_at: profile.objective_wizard_completed_at ?? null,
    });
  } catch (error: unknown) {
    if (isDbUnavailable(error)) {
      return NextResponse.json({ ok: true, degraded: true });
    }
    return NextResponse.json(
      { error: publicApiErrorMessage(error, 'Objective update failed') },
      { status: 500 },
    );
  }
}
