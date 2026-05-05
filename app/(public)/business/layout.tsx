import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Business & entrepreneuriat',
  description:
    'Comparez l’accessibilité business par destination : scores, street food, investissement et notes de friction issues du jeu de données VisaFlow.',
}

export default function BusinessLayout({ children }: { children: ReactNode }) {
  return children
}
