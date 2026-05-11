import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Business & investissement',
  description:
    'Hub mobilité économique : juridictions, indices affaires, micro-activité et CBI — données VisaFlow et liens vers l’explorateur.',
}

export default function BusinessLayout({ children }: { children: ReactNode }) {
  return children
}
