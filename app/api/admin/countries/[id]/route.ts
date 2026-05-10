import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { recordAdminAudit } from '@/lib/admin-audit-log';
import { getAdminUser } from '@/lib/admin-auth';
import { publicApiErrorMessage } from '@/lib/api-public-error';
import { MERGED_COUNTRIES_LIST_CACHE_TAG } from '@/lib/countries-prisma-merge';
import { parseCountryFullData } from '@/lib/country-full-data-json';
import { materializePublicFullData } from '@/lib/country-full-data-materialize';
import { isDbUnavailable } from '@/lib/db-resilience';
import { appendFullDataChangelog } from '@/lib/full-data-changelog';
import { mutationOriginDeniedResponse } from '@/lib/mutation-origin-guard';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const denied = mutationOriginDeniedResponse(req);
  if (denied) return denied;

  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = Number.parseInt(params.id, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid country id' }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  let existing: { full_data: string | null } | null;
  try {
    existing = await prisma.country.findUnique({ where: { id }, select: { full_data: true } });
  } catch (readErr: unknown) {
    if (isDbUnavailable(readErr)) {
      return NextResponse.json({ error: 'Database temporarily unavailable' }, { status: 503 });
    }
    throw readErr;
  }
  if (!existing) {
    return NextResponse.json({ error: 'Country not found' }, { status: 404 });
  }

  const data: Prisma.CountryUpdateInput = {};
  const detailParts: string[] = [];

  const num = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const t = num(body.tourist_visa_score);
  if (t !== undefined) {
    data.tourist_visa_score = t;
    detailParts.push('tourist_visa_score');
  }
  const s = num(body.study_visa_score);
  if (s !== undefined) {
    data.study_visa_score = s;
    detailParts.push('study_visa_score');
  }
  const w = num(body.work_visa_score);
  if (w !== undefined) {
    data.work_visa_score = w;
    detailParts.push('work_visa_score');
  }
  const b = num(body.business_visa_score);
  if (b !== undefined) {
    data.business_visa_score = b;
    detailParts.push('business_visa_score');
  }

  if (typeof body.appointment_difficulty === 'string') {
    data.appointment_difficulty = body.appointment_difficulty;
    detailParts.push('appointment_difficulty');
  }

  const patchPayload = body.full_data_patch;
  const touchesStructuredPatch =
    patchPayload !== null &&
    patchPayload !== undefined &&
    isRecord(patchPayload) &&
    ('phd_studies' in patchPayload || 'morocco_research_pack' in patchPayload);

  let mergedFull: Record<string, unknown> = parseCountryFullData(existing.full_data);

  if (touchesStructuredPatch) {
    if ('phd_studies' in patchPayload) {
      const nextPhd = patchPayload.phd_studies;
      if (nextPhd === null) {
        delete mergedFull.phd_studies;
        detailParts.push('phd_studies:removed');
      } else if (isRecord(nextPhd)) {
        mergedFull.phd_studies = nextPhd;
        detailParts.push('phd_studies');
      } else {
        return NextResponse.json(
          {
            error: 'full_data_patch.phd_studies must be a JSON object or null to remove the block',
          },
          { status: 400 },
        );
      }
    }

    if ('morocco_research_pack' in patchPayload) {
      const nextPack = patchPayload.morocco_research_pack;
      if (nextPack === null) {
        delete mergedFull.morocco_research_pack;
        detailParts.push('morocco_research_pack:removed');
      } else if (isRecord(nextPack)) {
        mergedFull.morocco_research_pack = nextPack;
        detailParts.push('morocco_research_pack');
      } else {
        return NextResponse.json(
          {
            error:
              'full_data_patch.morocco_research_pack must be a JSON object or null to remove the block',
          },
          { status: 400 },
        );
      }
    }
  }

  if (Object.keys(data).length === 0 && !touchesStructuredPatch) {
    return NextResponse.json({ error: 'No updatable fields' }, { status: 400 });
  }

  mergedFull = appendFullDataChangelog(mergedFull, {
    actor: 'admin',
    action: 'admin.patch',
    detail: detailParts.length ? detailParts.join(';') : 'admin.patch',
    subjectId: admin.id,
  });

  data.full_data = JSON.stringify(materializePublicFullData(mergedFull));

  try {
    const updated = await prisma.country.update({
      where: { id },
      data,
    });
    try {
      revalidateTag(MERGED_COUNTRIES_LIST_CACHE_TAG);
    } catch {
      /* revalidateTag requires Next server context */
    }
    void recordAdminAudit(admin.id, {
      action: 'country.patch',
      resource: `country:${id}`,
      detail: detailParts.length ? detailParts.join(';') : 'country.patch',
    });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (isDbUnavailable(error)) {
      return NextResponse.json({ error: 'Database temporarily unavailable' }, { status: 503 });
    }
    const message = publicApiErrorMessage(error, 'Update failed');
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
