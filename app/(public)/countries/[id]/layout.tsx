
import { loadFallbackCountries } from '@/lib/countries-fallback'
import { getMergedCountriesListCached } from '@/lib/countries-prisma-merge'
import prisma from '@/lib/prisma'
import { isSchengenMember } from '@/lib/schengen-members'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

type PageParams = { id: string }

function metadataFromNameRegion(name: string, region: string): Metadata {
  const schengen = isSchengenMember(name)
  const title = `${name} — visa & mobilité${schengen ? ' · Schengen' : ''}`
  const regionLabel = schengen ? `${region}, espace Schengen` : region
  const description = `Scores visa, friction, études, business et permis pour ${name} (${regionLabel}) — perspective Maroc / VisaFlow.`
  return {
    title,
    description,
    openGraph: { title, description },
  }
}

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

    if (country) return metadataFromNameRegion(country.name, country.region)
  } catch {
    /* DB error — fall through */
  }

  try {
    const merged = await getMergedCountriesListCached()
    const row = merged.find((c) => c.id === id)
    if (row) return metadataFromNameRegion(row.name, row.region)
  } catch {
    /* ignore */
  }

  try {
    const fallback = await loadFallbackCountries()
    const row = fallback.find((c) => c.id === id)
    if (row) return metadataFromNameRegion(row.name, row.region)
  } catch {
    /* final fallback title */
  }

  return {
    title: 'Pays introuvable',
    description: 'Cette fiche pays n’existe pas ou a été retirée.',
  }
}

export default function CountryDetailLayout({ children }: { children: ReactNode }) {
  return children
}
