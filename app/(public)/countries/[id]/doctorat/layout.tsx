import { getMergedCountriesListCached } from '@/lib/countries-prisma-merge'
import prisma from '@/lib/prisma'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'


type Params = { id: string }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const id = Number.parseInt(params.id, 10)
  if (!Number.isFinite(id) || id < 1) {
    return {
      title: 'Doctorat à l’étranger',
      description: 'Guide doctoral : admissions, visa, financement et débouchés.',
    }
  }

  try {
    const country = await prisma.country.findUnique({
      where: { id },
      select: { name: true },
    })
    if (country) {
      const title = `Doctorat · ${country.name}`
      const description = `Parcours doctoral pour ${country.name} — dossier, séjour légal, financement et débouchés (perspective Maroc).`
      return { title, description, openGraph: { title, description } }
    }
  } catch {
    /* fallback */
  }

  try {
    const list = await getMergedCountriesListCached()
    const row = list.find((c) => c.id === id)
    if (row) {
      const title = `Doctorat · ${row.name}`
      const description = `Parcours doctoral pour ${row.name} — dossier, séjour légal, financement et débouchés.`
      return { title, description, openGraph: { title, description } }
    }
  } catch {
    /* ignore */
  }

  return {
    title: 'Doctorat à l’étranger',
    description: 'Guide doctoral détaillé pour ce pays.',
  }
}

export default function CountryDoctoralLayout({ children }: { children: ReactNode }) {
  return children
}
