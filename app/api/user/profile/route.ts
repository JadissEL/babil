import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: userId as string },
    });
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function parseBody(data: Record<string, unknown>) {
  const age = Number.parseInt(String(data.age ?? ''), 10)
  if (!Number.isFinite(age) || age < 16 || age > 120) {
    return { error: 'age must be a number between 16 and 120' as const }
  }

  const income = Number.parseFloat(String(data.income ?? ''))
  const savings = Number.parseFloat(String(data.savings ?? ''))
  if (!Number.isFinite(income) || income < 0) {
    return { error: 'income must be a non-negative number' as const }
  }
  if (!Number.isFinite(savings) || savings < 0) {
    return { error: 'savings must be a non-negative number' as const }
  }

  const profession =
    typeof data.profession === 'string' && data.profession.trim() ? data.profession.trim() : null
  const marital_status =
    typeof data.marital_status === 'string' && data.marital_status.trim()
      ? data.marital_status.trim()
      : null
  const family_details =
    typeof data.family_details === 'string' ? data.family_details.trim().slice(0, 4000) : null
  const goal_type =
    typeof data.goal_type === 'string' && data.goal_type.trim() ? data.goal_type.trim().slice(0, 128) : null

  return {
    value: {
      age,
      profession,
      income,
      savings,
      CNSS_status: Boolean(data.CNSS_status),
      marital_status,
      family_in_europe: Boolean(data.family_in_europe),
      family_details,
      goal_type,
    },
  }
}

export async function POST(req: Request) {
  const { userId } = auth();
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

    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
