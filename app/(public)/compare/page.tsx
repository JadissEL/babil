import { Suspense } from 'react'

import PageContainer from '@/components/layout/PageContainer'
import { CompareExperience } from '@/components/compare/CompareExperience'

export const metadata = {
  title: 'Comparer les pays | VisaFlow',
  description:
    'Objectif d’abord : tourisme, études, travail, business… Puis comparez jusqu’à quatre pays avec scores et colonnes adaptés.',
}

export default function ComparePage() {
  return (
    <PageContainer className="py-8 sm:py-10 lg:py-12">
      <Suspense
        fallback={
          <div className="py-16 text-center text-sm font-bold text-muted sm:py-20 sm:text-base">
            Chargement…
          </div>
        }
      >
        <CompareExperience />
      </Suspense>
    </PageContainer>
  )
}
