import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { publicApiErrorMessage } from '@/lib/api-public-error';
import { isDbUnavailable } from '@/lib/db-resilience';
import { mutationOriginDeniedResponse } from '@/lib/mutation-origin-guard';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const rawLimit = Number(searchParams.get('limit') ?? '50');
  const take = Number.isFinite(rawLimit) ? Math.min(200, Math.max(1, Math.floor(rawLimit))) : 50;

  try {
    const events = await prisma.userHistoryEvent.findMany({
      where: { userId: userId as string },
      orderBy: { createdAt: 'desc' },
      take,
    });

    return NextResponse.json(
      events.map((e) => ({
        ...e,
        payload: e.payload ? JSON.parse(e.payload) : null,
      })),
    );
  } catch (error) {
    if (isDbUnavailable(error)) return NextResponse.json([]);
    return NextResponse.json(
      { error: publicApiErrorMessage(error, 'History read failed') },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const denied = mutationOriginDeniedResponse(req);
  if (denied) return denied;

  const { userId } = await auth();
  const user = await currentUser();
  if (!userId || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // ensure user exists in DB
  try {
    await prisma.user.upsert({
      where: { id: userId as string },
      update: {
        email: user.emailAddresses?.[0]?.emailAddress ?? `${userId}@unknown.local`,
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || null,
      },
      create: {
        id: userId as string,
        email: user.emailAddresses?.[0]?.emailAddress ?? `${userId}@unknown.local`,
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || null,
      },
    });
  } catch (error) {
    if (isDbUnavailable(error)) return NextResponse.json({ ok: true, degraded: true });
    return NextResponse.json(
      { error: publicApiErrorMessage(error, 'History sync failed') },
      { status: 500 },
    );
  }

  const body = await req.json();
  const type = String(body.type || '');
  const payload = body.payload ?? null;

  if (!type) return NextResponse.json({ error: 'type required' }, { status: 400 });

  try {
    await prisma.userHistoryEvent.create({
      data: {
        userId: userId as string,
        type,
        payload: payload ? JSON.stringify(payload) : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (isDbUnavailable(error)) return NextResponse.json({ ok: true, degraded: true });
    return NextResponse.json(
      { error: publicApiErrorMessage(error, 'History write failed') },
      { status: 500 },
    );
  }
}
