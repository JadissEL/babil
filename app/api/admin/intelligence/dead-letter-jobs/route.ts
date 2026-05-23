import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin-auth';
import { publicApiErrorMessage } from '@/lib/api-public-error';
import { triageDeadLetterJob } from '@/lib/intelligence-pipeline/dlq-triage';
import { DEAD_LETTER_PREFIX, isDeadLetterJob } from '@/lib/intelligence-pipeline/job-dead-letter';
import prisma from '@/lib/prisma';

/** List terminal dead-letter pipeline jobs for admin triage / redrive. */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const rows = await prisma.intelligencePipelineJob.findMany({
      where: {
        status: 'FAILED',
        errorSummary: { startsWith: DEAD_LETTER_PREFIX },
      },
      orderBy: { finishedAt: 'desc' },
      take: 30,
      select: {
        id: true,
        kind: true,
        finishedAt: true,
        errorSummary: true,
        payloadJson: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      jobs: rows.map((r) => {
        const triage = triageDeadLetterJob(r.errorSummary);
        return {
          id: r.id,
          kind: r.kind,
          finishedAt: r.finishedAt?.toISOString() ?? null,
          errorSummary: r.errorSummary,
          createdAt: r.createdAt.toISOString(),
          isDeadLetter: isDeadLetterJob(r.errorSummary),
          errorClass: triage.errorClass,
          canRedrive: triage.canRedrive,
          previousError: triage.previousError,
        };
      }),
      count: rows.length,
    });
  } catch (e) {
    return NextResponse.json(
      { error: publicApiErrorMessage(e, 'Dead-letter list unavailable') },
      { status: 503 },
    );
  }
}
