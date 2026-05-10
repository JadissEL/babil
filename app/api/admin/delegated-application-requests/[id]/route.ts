import { NextResponse } from 'next/server';
import { recordAdminAudit } from '@/lib/admin-audit-log';
import { getAdminUser } from '@/lib/admin-auth';
import { publicApiErrorMessage } from '@/lib/api-public-error';
import { isDbUnavailable } from '@/lib/db-resilience';
import { redactDelegatedPayloadDeep } from '@/lib/delegated-application-payload-utils';
import { isDelegatedRequestStatus } from '@/lib/delegated-application-status';
import { mutationOriginDeniedResponse } from '@/lib/mutation-origin-guard';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(req.url);
  const fullPayload = url.searchParams.get('fullPayload') === '1';

  const id = Number.parseInt(params.id, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  try {
    const row = await prisma.delegatedApplicationRequest.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, name: true, id: true } },
      },
    });
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    let payloadParsed: unknown;
    try {
      payloadParsed = JSON.parse(row.payload);
    } catch {
      payloadParsed = {
        parseError: true,
        rawSnippet: fullPayload
          ? row.payload.slice(0, 500)
          : '[extrait omis — payload illisible ; ne pas afficher en clair]',
      };
    }

    const payloadForResponse = fullPayload
      ? payloadParsed
      : typeof payloadParsed === 'object' && payloadParsed !== null
        ? redactDelegatedPayloadDeep(payloadParsed)
        : payloadParsed;

    return NextResponse.json({
      id: row.id,
      category: row.category,
      packageId: row.packageId,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      user: row.user,
      payload: payloadForResponse,
      payloadRedactionApplied: !fullPayload,
    });
  } catch (error: unknown) {
    if (isDbUnavailable(error))
      return NextResponse.json({ error: 'Database temporarily unavailable' }, { status: 503 });
    const message = publicApiErrorMessage(error, 'Read failed');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const denied = mutationOriginDeniedResponse(req);
  if (denied) return denied;

  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = Number.parseInt(params.id, 10);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const status = typeof body.status === 'string' ? body.status.trim() : '';
  if (!status || !isDelegatedRequestStatus(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  try {
    const existing = await prisma.delegatedApplicationRequest.findUnique({
      where: { id },
      select: { status: true },
    });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.delegatedApplicationRequest.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { email: true, name: true } },
      },
    });
    void recordAdminAudit(admin.id, {
      action: 'delegated_request.status_change',
      resource: `delegated_application_request:${id}`,
      detail: `${existing.status}->${status}`,
    });
    return NextResponse.json({
      ok: true,
      id: updated.id,
      status: updated.status,
      userEmail: updated.user.email,
    });
  } catch (error: unknown) {
    if (isDbUnavailable(error))
      return NextResponse.json({ error: 'Database temporarily unavailable' }, { status: 503 });
    const message = publicApiErrorMessage(error, 'Update failed');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
