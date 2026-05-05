import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import prisma from '@/lib/prisma'

type PageParams = { id: string }

export async function generateMetadata({ params }: { params: PageParams }): Promise<Metadata> {
  const id = Number.parseInt(params.id, 10)
  if (!Number.isFinite(id) || id < 1) {
    return {
      title: 'Fiche pays',
      description: 'Détail mobilité, visa, études et retours utilisateurs VisaFlow.',
    }
  }

  try {
    const country = await prisma.country.findUnique({
      where: { id },
      select: { name: true, region: true },
    })

    if (!country) {
      return {
        title: 'Pays introuvable',
        description: 'Cette fiche pays n’existe pas ou a été retirée.',
      }
    }

    const title = `${country.name} — visa & mobilité`
    const description = `Scores visa, friction, études, business et permis pour ${country.name} (${country.region}) — perspective Maroc / VisaFlow.`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
      },
    }
  } catch {
    return {
      title: 'Fiche pays',
      description: 'Détail mobilité et visa VisaFlow.',
    }
  }
}

export default function CountryDetailLayout({ children }: { children: ReactNode }) {
  return children
}
