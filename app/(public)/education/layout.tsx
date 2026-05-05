import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Études & formations',
  description:
    'Hub éducation VisaFlow : langues, formations courtes et techniques — critères bac, coûts et accès par pays.',
}

export default function EducationHubLayout({ children }: { children: ReactNode }) {
  return children
}
