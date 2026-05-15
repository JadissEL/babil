import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { getUserIsAdmin } from '@/lib/admin-auth'
import { publicApiErrorMessage } from '@/lib/api-public-error'

/** Nexus shell: whether the signed-in user has Prisma `Role.ADMIN`. */
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const isAdmin = await getUserIsAdmin()
    return NextResponse.json({ isAdmin })
  } catch (error: unknown) {
    return NextResponse.json(
      { error: publicApiErrorMessage(error, 'Access read failed') },
      { status: 500 },
    )
  }
}
