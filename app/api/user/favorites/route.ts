import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const countryId = url.searchParams.get('countryId')

  if (countryId) {
    const cid = Number.parseInt(countryId, 10)
    if (!Number.isFinite(cid)) {
      return NextResponse.json({ error: 'Invalid countryId' }, { status: 400 })
    }
    const existing = await prisma.favoriteCountry.findUnique({
      where: { userId_countryId: { userId: userId as string, countryId: cid } },
    })
    return NextResponse.json({ favorited: Boolean(existing) })
  }

  const favorites = await prisma.favoriteCountry.findMany({
    where: { userId: userId as string },
    include: { country: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(
    favorites.map((f) => ({
      ...f.country,
      favoritedAt: f.createdAt,
      full_data: f.country.full_data ? JSON.parse(f.country.full_data) : {},
    })),
  )
}

export async function POST(req: Request) {
  const { userId } = auth()
  const user = await currentUser()
  if (!userId || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // ensure user exists in DB (same pattern as profile route)
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

  let body: { countryId?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const countryId = Number(body.countryId)
  if (!Number.isFinite(countryId)) {
    return NextResponse.json({ error: 'countryId required' }, { status: 400 })
  }

  const existing = await prisma.favoriteCountry.findUnique({
    where: { userId_countryId: { userId: userId as string, countryId } },
  })

  if (existing) {
    await prisma.favoriteCountry.delete({ where: { id: existing.id } })
    return NextResponse.json({ favorited: false })
  }

  await prisma.favoriteCountry.create({
    data: { userId: userId as string, countryId },
  })

  return NextResponse.json({ favorited: true })
}

