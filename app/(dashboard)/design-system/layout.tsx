import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { getAdminUser } from '@/lib/admin-auth'

export const metadata: Metadata = {
  title: 'Design system',
  robots: { index: false, follow: false },
}

export default async function DesignSystemLayout({ children }: { children: ReactNode }) {
  const admin = await getAdminUser()
  if (!admin) redirect('/')
  return children
}
