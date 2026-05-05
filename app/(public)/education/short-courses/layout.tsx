import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Formations courtes',
  description:
    'Formations brèves à l’étranger pour profils marocains : durées, coûts et pays les plus accessibles selon VisaFlow.',
}

export default function ShortCoursesLayout({ children }: { children: ReactNode }) {
  return children
}
