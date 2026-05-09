import { Suspense } from 'react'

import PageContainer from '@/components/layout/PageContainer'
import { CompareExperience } from '@/components/compare/CompareExperience'
import { CompareExperienceSkeleton } from '@/components/compare/CompareExperienceSkeleton'

export const metadata = {
  title: 'Comparer les pays | VisaFlow',
  description:
    'Objectif d’abord : tourisme, études, travail, business… Puis comparez jusqu’à quatre pays avec scores et colonnes adaptés.',
}

export default function ComparePage() {
  return (
    <PageContainer className="py-8 sm:py-10 lg:py-12">
      <Suspense
        fallback={<CompareExperienceSkeleton />}
      >
        <CompareExperience />
      </Suspense>
    </PageContainer>
  )
}
