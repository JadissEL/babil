import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'

import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

export const metadata: Metadata = {
  title: {
    default: 'Espace connecté',
    template: '%s | VisaFlow',
  },
  description:
    'Outils connectés VisaFlow : profil, probabilités, recommandations et administration pour la mobilité internationale.',
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { userId } = auth()

  if (!userId) {
    redirect('/')
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-bg text-text">
      <DashboardSidebar />

      <main className="flex-1 bg-bg px-8 py-10 lg:px-12">{children}</main>
    </div>
  )
}
