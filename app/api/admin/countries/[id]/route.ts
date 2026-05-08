import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'

import { getAdminUser } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'
import { parseCountryFullData } from '@/lib/country-full-data-json'
import { materializePublicFullData } from '@/lib/country-full-data-materialize'
import { isDbUnavailable } from '@/lib/db-resilience'

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = Number.parseInt(params.id, 10)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid country id' }, { status: 400 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const data: Prisma.CountryUpdateInput = {}

  const num = (v: unknown) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }

  const t = num(body.tourist_visa_score)
  if (t !== undefined) data.tourist_visa_score = t
  const s = num(body.study_visa_score)
  if (s !== undefined) data.study_visa_score = s
  const w = num(body.work_visa_score)
  if (w !== undefined) data.work_visa_score = w
  const b = num(body.business_visa_score)
  if (b !== undefined) data.business_visa_score = b

  if (typeof body.appointment_difficulty === 'string') {
    data.appointment_difficulty = body.appointment_difficulty
  }

  const patchPayload = body.full_data_patch
  const touchesStructuredPatch =
    patchPayload !== null &&
    patchPayload !== undefined &&
    isRecord(patchPayload) &&
    ('phd_studies' in patchPayload || 'morocco_research_pack' in patchPayload)

  if (touchesStructuredPatch) {
    try {
      const existing = await prisma.country.findUnique({
        where: { id },
        select: { full_data: true },
      })
      if (!existing) {
        return NextResponse.json({ error: 'Country not found' }, { status: 404 })
      }

      const base = parseCountryFullData(existing.full_data)
      const merged: Record<string, unknown> = { ...base }

      if ('phd_studies' in patchPayload) {
        const nextPhd = patchPayload.phd_studies
        if (nextPhd === null) {
          delete merged.phd_studies
        } else if (isRecord(nextPhd)) {
          merged.phd_studies = nextPhd
        } else {
          return NextResponse.json(
            { error: 'full_data_patch.phd_studies must be a JSON object or null to remove the block' },
            { status: 400 },
          )
        }
      }

      if ('morocco_research_pack' in patchPayload) {
        const nextPack = patchPayload.morocco_research_pack
        if (nextPack === null) {
          delete merged.morocco_research_pack
        } else if (isRecord(nextPack)) {
          merged.morocco_research_pack = nextPack
        } else {
          return NextResponse.json(
            {
              error:
                'full_data_patch.morocco_research_pack must be a JSON object or null to remove the block',
            },
            { status: 400 },
          )
        }
      }

      data.full_data = JSON.stringify(materializePublicFullData(merged))
    } catch (readErr: unknown) {
      if (isDbUnavailable(readErr)) {
        return NextResponse.json({ error: 'Database temporarily unavailable' }, { status: 503 })
      }
      throw readErr
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No updatable fields' }, { status: 400 })
  }

  try {
    const updated = await prisma.country.update({
      where: { id },
      data,
    })
    return NextResponse.json(updated)
  } catch (error: unknown) {
    if (isDbUnavailable(error)) {
      return NextResponse.json({ error: 'Database temporarily unavailable' }, { status: 503 })
    }
    const message = error instanceof Error ? error.message : 'Update failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
