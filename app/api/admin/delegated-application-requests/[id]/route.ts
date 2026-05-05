import { NextResponse } from 'next/server'

import { getAdminUser } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'
import { isDelegatedRequestStatus } from '@/lib/delegated-application-status'
import { isDbUnavailable } from '@/lib/db-resilience'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = Number.parseInt(params.id, 10)
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  try {
    const row = await prisma.delegatedApplicationRequest.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, name: true, id: true } },
      },
    })
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let payloadParsed: unknown
    try {
      payloadParsed = JSON.parse(row.payload)
    } catch {
      payloadParsed = { parseError: true, rawSnippet: row.payload.slice(0, 500) }
    }

    return NextResponse.json({
      id: row.id,
      category: row.category,
      packageId: row.packageId,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      user: row.user,
      payload: payloadParsed,
    })
  } catch (error: unknown) {
    if (isDbUnavailable(error)) return NextResponse.json({ error: 'Database temporarily unavailable' }, { status: 503 })
    const message = error instanceof Error ? error.message : 'Read failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const id = Number.parseInt(params.id, 10)
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const status = typeof body.status === 'string' ? body.status.trim() : ''
  if (!status || !isDelegatedRequestStatus(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  try {
    const updated = await prisma.delegatedApplicationRequest.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { email: true, name: true } },
      },
    })
    return NextResponse.json({
      ok: true,
      id: updated.id,
      status: updated.status,
      userEmail: updated.user.email,
    })
  } catch (error: unknown) {
    if (isDbUnavailable(error)) return NextResponse.json({ error: 'Database temporarily unavailable' }, { status: 503 })
    const message = error instanceof Error ? error.message : 'Update failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
