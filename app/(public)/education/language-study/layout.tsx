import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Cours de langue à l’étranger',
  description:
    'Pays compatibles avec des séjours linguistiques : bac requis ou non, coûts et scores issus des données VisaFlow.',
}

export default function LanguageStudyLayout({ children }: { children: ReactNode }) {
  return children
}
