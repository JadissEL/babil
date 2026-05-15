import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Recommandations',
  description:
    'Destinations classées selon votre profil VisaFlow : scores, barrières et pistes concrètes pour citoyens marocains.',
}

export default function RecommendationsLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl">{children}</div>
}
