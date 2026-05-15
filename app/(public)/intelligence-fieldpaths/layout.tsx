import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { getAdminUser } from '@/lib/admin-auth'

export const metadata: Metadata = {
  title: 'Glossaire des Données — VisaFlow',
  description:
    'Signification des chemins logiques (fieldPath) utilisés par le pipeline intelligence et la provenance des données pays.',
}

export default async function IntelligenceFieldPathsLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const admin = await getAdminUser()
  if (!admin) redirect('/')
  return children
}
