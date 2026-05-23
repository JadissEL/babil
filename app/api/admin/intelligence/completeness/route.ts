import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin-auth';
import { publicApiErrorMessage } from '@/lib/api-public-error';
import { listCountryCompletenessScores } from '@/lib/intelligence-pipeline/country-completeness';

/** Lowest/highest intelligence completeness scores for prioritization. */
export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const url = new URL(req.url);
  const limit = Math.min(50, Math.max(5, Number(url.searchParams.get('limit') || 20)));

  try {
    const all = await listCountryCompletenessScores({ limit: limit * 2 });
    const lowest = all.slice(0, limit);
    const highest = [...all].sort((a, b) => b.score - a.score).slice(0, limit);
    const avg = all.length > 0 ? Math.round(all.reduce((s, c) => s + c.score, 0) / all.length) : 0;

    return NextResponse.json({
      sampled: all.length,
      averageScore: avg,
      lowest,
      highest,
    });
  } catch (e) {
    return NextResponse.json(
      { error: publicApiErrorMessage(e, 'Completeness scores unavailable') },
      { status: 503 },
    );
  }
}
