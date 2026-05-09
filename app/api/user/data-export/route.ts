import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

import prisma from '@/lib/prisma'
import { isDbUnavailable } from '@/lib/db-resilience'
import { buildGdprExportBundle } from '@/lib/user-gdpr-export'

const HISTORY_CAP = 500

export async function GET(req: Request) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const inline = url.searchParams.get('inline') === '1'

  try {
    const [userRow, profileRow, comments, favorites, historyEvents, delegatedRequests] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId as string },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
      }),
      prisma.userProfile.findUnique({ where: { userId: userId as string } }),
      prisma.comment.findMany({
        where: { userId: userId as string },
        orderBy: { createdAt: 'desc' },
        include: { country: { select: { name: true } } },
      }),
      prisma.favoriteCountry.findMany({
        where: { userId: userId as string },
        orderBy: { createdAt: 'desc' },
        include: { country: { select: { name: true } } },
      }),
      prisma.userHistoryEvent.findMany({
        where: { userId: userId as string },
        orderBy: { createdAt: 'desc' },
        take: HISTORY_CAP,
      }),
      prisma.delegatedApplicationRequest.findMany({
        where: { userId: userId as string },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const exportedAt = new Date()
    const bundle = buildGdprExportBundle({
      exportedAt,
      historyEventsMaxRows: HISTORY_CAP,
      user: userRow,
      profile: profileRow ? { ...profileRow } : null,
      comments,
      favorites,
      historyEvents,
      delegatedRequests,
    })

    const body = JSON.stringify(bundle, null, 2)
    const safeStamp = exportedAt.toISOString().replace(/[:.]/g, '-')
    const filename = `babil-donnees-personnelles-${safeStamp}.json`

    if (inline) {
      return new NextResponse(body, {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      })
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error: unknown) {
    if (isDbUnavailable(error)) {
      return NextResponse.json({ error: 'Database temporarily unavailable' }, { status: 503 })
    }
    const message = error instanceof Error ? error.message : 'Export failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
