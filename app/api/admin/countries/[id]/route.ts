import { NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'

import { getAdminUser } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'
import { isDbUnavailable } from '@/lib/db-resilience'

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
