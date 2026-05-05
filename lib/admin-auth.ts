import { Role } from '@prisma/client'
import { auth } from '@clerk/nextjs/server'

import prisma from '@/lib/prisma'

export async function getAdminUser() {
  const { userId } = auth()
  if (!userId) return null
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.role !== Role.ADMIN) return null
  return user
}
