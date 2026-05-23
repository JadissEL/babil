import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin-auth';
import { publicApiErrorMessage } from '@/lib/api-public-error';
import { redriveDeadLetterCanary } from '@/lib/intelligence-pipeline/dlq-canary-redrive';

type BulkRedriveBody = { limit?: number };

/** Canary bulk redrive — transient DLQ only, bounded (default 3). */
export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = (await req.json().catch(() => ({}))) as BulkRedriveBody;
    const limit = Math.min(5, Math.max(1, body.limit ?? 3));
    const result = await redriveDeadLetterCanary({ limit, onlyTransient: true });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      { error: publicApiErrorMessage(e, 'Bulk redrive failed') },
      { status: 500 },
    );
  }
}
