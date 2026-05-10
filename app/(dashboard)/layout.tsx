import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

import DashboardLayoutClient from '@/components/layout/DashboardLayoutClient'

export const metadata: Metadata = {
  title: {
    default: 'Espace connecté',
    template: '%s | VisaFlow',
  },
  description:
    'Outils connectés VisaFlow : profil, probabilités, recommandations et administration pour la mobilité internationale.',
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/')
  }

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
