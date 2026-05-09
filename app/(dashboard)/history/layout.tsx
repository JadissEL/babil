import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Historique',
  description:
    'Journal des actions enregistrées sur votre compte VisaFlow : consultations de fiches pays et autres événements.',
}

export default function HistoryLayout({ children }: { children: ReactNode }) {
  return children
}
