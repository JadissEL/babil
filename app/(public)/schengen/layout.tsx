import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Schengen Intelligence | VisaFlow',
  description:
    'Terminal Schengen pour profils marocains : membres, comparaison 2–4 pays, acceptation, friction et délais — indicateurs indicatifs.',
}

export default function SchengenLayout({ children }: { children: ReactNode }) {
  return children
}
