import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin-auth';
import { publicApiErrorMessage } from '@/lib/api-public-error';
import { buildIntelligenceSloReport } from '@/lib/intelligence-pipeline/slo-report';

/** Operator SLO snapshot (queue depth, DLQ, observation verification mix). */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const report = await buildIntelligenceSloReport();
    return NextResponse.json(report, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    return NextResponse.json(
      { error: publicApiErrorMessage(e, 'Intelligence metrics unavailable') },
      { status: 503 },
    );
  }
}
