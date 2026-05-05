import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Modération',
  description:
    'File des commentaires utilisateurs : validation ou rejet des contributions liées aux fiches pays (accès restreint).',
}

export default function ModerationLayout({ children }: { children: ReactNode }) {
  return children
}
