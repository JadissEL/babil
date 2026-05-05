import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Explorer | VisaFlow',
  description:
    'Filtrez et comparez les destinations : scores visa, friction, objectifs étude et business pour les citoyens marocains.',
}

export default function ExplorerLayout({ children }: { children: ReactNode }) {
  return children
}
