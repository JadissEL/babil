import { auth } from '@clerk/nextjs/server'
import { Role } from '@prisma/client'
import prisma from '@/lib/prisma'

export async function getAdminUser() {
  const { userId } = await auth()
  if (!userId) return null
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.role !== Role.ADMIN) return null
  return user
}

/** For lightweight RBAC checks (nav, flags) without loading the full user row. */
export async function getUserIsAdmin(): Promise<boolean> {
  const { userId } = await auth()
  if (!userId) return false
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  return row?.role === Role.ADMIN
}
