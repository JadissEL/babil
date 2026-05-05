import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { isDbUnavailable } from '@/lib/db-resilience'

export async function GET() {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const events = await prisma.userHistoryEvent.findMany({
      where: { userId: userId as string },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(
      events.map((e) => ({
        ...e,
        payload: e.payload ? JSON.parse(e.payload) : null,
      })),
    )
  } catch (error) {
    if (isDbUnavailable(error)) return NextResponse.json([])
    return NextResponse.json({ error: String((error as Error)?.message || error) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const { userId } = auth()
  const user = await currentUser()
  if (!userId || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ensure user exists in DB
  try {
    await prisma.user.upsert({
      where: { id: userId as string },
      update: {
        email: user.emailAddresses?.[0]?.emailAddress ?? `${userId}@unknown.local`,
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || null,
      },
      create: {
        id: userId as string,
        email: user.emailAddresses?.[0]?.emailAddress ?? `${userId}@unknown.local`,
        name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || null,
      },
    })
  } catch (error) {
    if (isDbUnavailable(error)) return NextResponse.json({ ok: true, degraded: true })
    return NextResponse.json({ error: String((error as Error)?.message || error) }, { status: 500 })
  }

  const body = await req.json()
  const type = String(body.type || '')
  const payload = body.payload ?? null

  if (!type) return NextResponse.json({ error: 'type required' }, { status: 400 })

  try {
    await prisma.userHistoryEvent.create({
      data: {
        userId: userId as string,
        type,
        payload: payload ? JSON.stringify(payload) : null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (isDbUnavailable(error)) return NextResponse.json({ ok: true, degraded: true })
    return NextResponse.json({ error: String((error as Error)?.message || error) }, { status: 500 })
  }
}

