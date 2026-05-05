import { isoForCountryName } from '@/lib/country-card-mappers'

export const COUNTRY_HIGHLIGHTS: Record<string, { place: string; imageUrl: string }> = {
  de: {
    place: 'Brandenburg Gate',
    imageUrl:
      'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1600&q=80',
  },
  fr: {
    place: 'Eiffel Tower',
    imageUrl:
      'https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=1600&q=80',
  },
  ca: {
    place: 'Moraine Lake',
    imageUrl:
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1600&q=80',
  },
  jp: {
    place: 'Mount Fuji',
    imageUrl:
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1600&q=80',
  },
  gb: {
    place: 'Tower Bridge',
    imageUrl:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1600&q=80',
  },
  us: {
    place: 'New York Skyline',
    imageUrl:
      'https://images.unsplash.com/photo-1496588152823-e9b3f88a2f0b?auto=format&fit=crop&w=1600&q=80',
  },
}

export function hasCuratedHighlightByIso(iso: string) {
  return Boolean(COUNTRY_HIGHLIGHTS[iso.toLowerCase().trim()])
}

export function hasCuratedHighlightByCountryName(countryName: string) {
  const iso = isoForCountryName(countryName)
  return hasCuratedHighlightByIso(iso)
}
