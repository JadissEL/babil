import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin-auth';
import { publicApiErrorMessage } from '@/lib/api-public-error';
import { isDbUnavailable } from '@/lib/db-resilience';
import prisma from '@/lib/prisma';

/**
 * E.67 — read recent admin audit entries (newest first). Admin-only.
 */
export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(req.url);
  const raw = Number.parseInt(url.searchParams.get('limit') ?? '50', 10);
  const take = Number.isFinite(raw) ? Math.min(100, Math.max(1, raw)) : 50;

  try {
    const rows = await prisma.adminAuditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        createdAt: true,
        adminUserId: true,
        action: true,
        resource: true,
        detail: true,
        metadata: true,
      },
    });
    return NextResponse.json(
      rows.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    );
  } catch (error: unknown) {
    if (isDbUnavailable(error)) return NextResponse.json([], { status: 200 });
    const message = publicApiErrorMessage(error, 'List failed');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
