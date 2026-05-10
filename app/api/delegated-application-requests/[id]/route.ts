import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { publicApiErrorMessage } from '@/lib/api-public-error';
import { isDbUnavailable } from '@/lib/db-resilience';
import { previewDelegatedPayload } from '@/lib/delegated-application-payload-utils';
import prisma from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number.parseInt(params.id, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  try {
    const row = await prisma.delegatedApplicationRequest.findUnique({
      where: { id },
    });
    if (!row || row.userId !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    let payloadParsed: Record<string, unknown>;
    try {
      const p = JSON.parse(row.payload) as unknown;
      payloadParsed =
        typeof p === 'object' && p !== null && !Array.isArray(p)
          ? (p as Record<string, unknown>)
          : { _value: p };
    } catch {
      payloadParsed = { parseError: true, rawSnippet: row.payload.slice(0, 500) };
    }

    const pv = previewDelegatedPayload(row.payload);

    return NextResponse.json({
      id: row.id,
      category: row.category,
      packageId: row.packageId,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      packageName: pv.packageName,
      priceMad: pv.priceMad,
      payload: payloadParsed,
    });
  } catch (error: unknown) {
    if (isDbUnavailable(error)) {
      return NextResponse.json({ error: 'Database temporarily unavailable' }, { status: 503 });
    }
    const message = publicApiErrorMessage(error, 'Read failed');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
