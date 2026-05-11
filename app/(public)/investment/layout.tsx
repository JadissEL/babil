import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Investissement & nationalité',
  description:
    'Programmes CBI et résidence par investissement — filtres, prudence réglementaire et liens vers les fiches pays (données indicatives).',
}

export default function InvestmentLayout({ children }: { children: ReactNode }) {
  return children
}
