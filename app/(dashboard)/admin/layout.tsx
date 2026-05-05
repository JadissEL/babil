import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Administration',
  description: 'Modération des commentaires et édition des scores pays (comptes administrateur).',
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children
}
