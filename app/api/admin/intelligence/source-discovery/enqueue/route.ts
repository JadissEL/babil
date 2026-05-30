import { NextResponse } from 'next/server';

import { getAdminUser } from '@/lib/admin-auth';
import { publicApiErrorMessage } from '@/lib/api-public-error';
import { enqueueIntelligenceJob } from '@/lib/intelligence-pipeline/enqueue-intelligence-job';
import { INTELLIGENCE_JOB_KINDS } from '@/lib/intelligence-pipeline/job-kinds';
import prisma from '@/lib/prisma';

/** POST { sourceId } — enqueue source_discovery for one source. */
export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = (await req.json()) as { sourceId?: string };
    const sourceId = body.sourceId?.trim();
    if (!sourceId) {
      return NextResponse.json({ error: 'sourceId required' }, { status: 400 });
    }

    const source = await prisma.intelligenceSource.findUnique({
      where: { id: sourceId },
      select: { id: true, slug: true, discoveryStatus: true, baseUrl: true },
    });
    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    const out = await enqueueIntelligenceJob({
      kind: INTELLIGENCE_JOB_KINDS.source_discovery,
      payload: { sourceId, trigger: 'admin:source_discovery' },
      priority: 3,
    });

    return NextResponse.json({ source, enqueue: out });
  } catch (e) {
    return NextResponse.json(
      { error: publicApiErrorMessage(e, 'Enqueue discovery failed') },
      { status: 500 },
    );
  }
}
