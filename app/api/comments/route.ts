import { CommentStatus, Role } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { checkCommentPostRateLimit } from '@/lib/comment-post-rate-limit';
import { isDbUnavailable } from '@/lib/db-resilience'

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let user
  try {
    user = await prisma.user.findUnique({
      where: { id: userId as string }
    });
  } catch (error) {
    if (isDbUnavailable(error)) return NextResponse.json([])
    return NextResponse.json({ error: String((error as Error)?.message || error) }, { status: 500 })
  }

  if (user?.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const statusRaw = req.nextUrl.searchParams.get('status') || undefined;
    const status =
      statusRaw && Object.values(CommentStatus).includes(statusRaw as CommentStatus)
        ? (statusRaw as CommentStatus)
        : undefined;
    if (statusRaw && !status) {
      return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
    }
    const comments = await prisma.comment.findMany({
      where: status ? { status } : undefined,
      include: {
        user: { select: { name: true, email: true } },
        country: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(comments);
  } catch (error: any) {
    if (isDbUnavailable(error)) return NextResponse.json([])
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rl = checkCommentPostRateLimit(userId, req);
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfterSec: rl.retryAfterSec, limit: rl.limit },
      {
        status: 429,
        headers: { 'Retry-After': String(rl.retryAfterSec) },
      },
    );
  }

  let body: { countryId?: unknown; content?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const countryIdNum = Number(body.countryId);
  if (!Number.isFinite(countryIdNum)) {
    return NextResponse.json({ error: 'Invalid countryId' }, { status: 400 });
  }

  const contentStr = typeof body.content === 'string' ? body.content.trim() : '';
  if (!contentStr) {
    return NextResponse.json({ error: 'content is required' }, { status: 400 });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        content: contentStr,
        userId: userId as string,
        countryId: countryIdNum,
        status: 'PENDING',
      },
    });
    return NextResponse.json(comment);
  } catch (error: any) {
    if (isDbUnavailable(error)) {
      return NextResponse.json({ ok: true, degraded: true, queued: false, message: 'Service temporairement indisponible' })
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
