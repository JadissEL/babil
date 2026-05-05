import PageContainer from '@/components/layout/PageContainer'
import { CompareExperience } from '@/components/compare/CompareExperience'

export const metadata = {
  title: 'Comparer les pays | VisaFlow',
  description: 'Comparez jusqu’à quatre destinations : visa, friction, études, business et score composite.',
}

export default function ComparePage() {
  return (
    <PageContainer className="py-10 sm:py-12">
      <CompareExperience />
    </PageContainer>
  )
}
