import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin-auth';
import { publicApiErrorMessage } from '@/lib/api-public-error';
import { triageDeadLetterJob } from '@/lib/intelligence-pipeline/dlq-triage';
import { DEAD_LETTER_PREFIX } from '@/lib/intelligence-pipeline/job-dead-letter';
import { parseJobPayload } from '@/lib/intelligence-pipeline/job-retry';
import prisma from '@/lib/prisma';

type RedriveBody = { jobId: string };

/** Re-queue a dead-letter job with reset attempt counter (canary redrive). */
export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = (await req.json()) as RedriveBody;
    if (!body.jobId) {
      return NextResponse.json({ error: 'jobId required' }, { status: 400 });
    }

    const job = await prisma.intelligencePipelineJob.findUnique({
      where: { id: body.jobId },
    });
    if (!job || job.status !== 'FAILED' || !job.errorSummary?.startsWith(DEAD_LETTER_PREFIX)) {
      return NextResponse.json({ error: 'Not a dead-letter job' }, { status: 404 });
    }

    const triage = triageDeadLetterJob(job.errorSummary);
    if (!triage.canRedrive) {
      return NextResponse.json(
        { error: 'Job classified as poison/permanent — fix root cause before redrive', triage },
        { status: 409 },
      );
    }

    const payload = parseJobPayload(job.payloadJson);
    await prisma.intelligencePipelineJob.update({
      where: { id: job.id },
      data: {
        status: 'PENDING',
        startedAt: null,
        finishedAt: null,
        errorSummary: null,
        resultJson: null,
        priority: Math.max(job.priority ?? 0, 45),
        payloadJson: JSON.stringify({
          ...payload,
          attempt: 0,
          notBefore: undefined,
          trigger: payload.trigger ?? 'admin_redrive',
        }),
      },
    });

    return NextResponse.json({ ok: true, jobId: job.id });
  } catch (e) {
    return NextResponse.json(
      { error: publicApiErrorMessage(e, 'Redrive failed') },
      { status: 500 },
    );
  }
}
