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
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80',
  },
  ca: {
    place: 'CN Tower & skyline',
    imageUrl:
      'https://images.unsplash.com/photo-1517935701353-4b5219354e08?auto=format&fit=crop&w=1600&q=80',
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
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1600&q=80',
  },
  es: {
    place: 'Sagrada Família',
    imageUrl:
      'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1600&q=80',
  },
  ma: {
    place: 'Medina souks',
    imageUrl:
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=80',
  },
  it: {
    place: 'Colosseum',
    imageUrl:
      'https://images.unsplash.com/photo-1552832230-c0197dd771b6?auto=format&fit=crop&w=1600&q=80',
  },
  pt: {
    place: 'Lisbon & tram',
    imageUrl:
      'https://images.unsplash.com/photo-1555881400-74d453aca0b6?auto=format&fit=crop&w=1600&q=80',
  },
  nl: {
    place: 'Amsterdam canals',
    imageUrl:
      'https://images.unsplash.com/photo-1534351590667-13e3e96b5017?auto=format&fit=crop&w=1600&q=80',
  },
  be: {
    place: 'Grand-Place',
    imageUrl:
      'https://images.unsplash.com/photo-1559564484-701530c79cb0?auto=format&fit=crop&w=1600&q=80',
  },
  at: {
    place: "St. Stephen's Cathedral",
    imageUrl:
      'https://images.unsplash.com/photo-1516550893923-42d28e5647f2?auto=format&fit=crop&w=1600&q=80',
  },
  ch: {
    place: 'Swiss Alps',
    imageUrl:
      'https://images.unsplash.com/photo-1531366937837-27bf6d5c1198?auto=format&fit=crop&w=1600&q=80',
  },
  se: {
    place: 'Gamla Stan',
    imageUrl:
      'https://images.unsplash.com/photo-1509359677900-92e580f7049d?auto=format&fit=crop&w=1600&q=80',
  },
  pl: {
    place: 'Old Town Kraków',
    imageUrl:
      'https://images.unsplash.com/photo-1519196215724-3a0dd499e269?auto=format&fit=crop&w=1600&q=80',
  },
  ae: {
    place: 'Dubai skyline',
    imageUrl:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80',
  },
  kr: {
    place: 'Seoul cityscape',
    imageUrl:
      'https://images.unsplash.com/photo-1548115184-bc6544d06a58?auto=format&fit=crop&w=1600&q=80',
  },
  au: {
    place: 'Sydney Opera House',
    imageUrl:
      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1600&q=80',
  },
  nz: {
    place: 'Milford Sound',
    imageUrl:
      'https://images.unsplash.com/photo-1469521669194-babb45599def?auto=format&fit=crop&w=1600&q=80',
  },
  sg: {
    place: 'Marina Bay',
    imageUrl:
      'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&w=1600&q=80',
  },
  tr: {
    place: 'Bosphorus',
    imageUrl:
      'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1600&q=80',
  },
  eg: {
    place: 'Pyramids of Giza',
    imageUrl:
      'https://images.unsplash.com/photo-1552465011-b4e21bf619e9?auto=format&fit=crop&w=1600&q=80',
  },
  tn: {
    place: 'Sidi Bou Said',
    imageUrl:
      'https://images.unsplash.com/photo-1558486012-817176f88c9d?auto=format&fit=crop&w=1600&q=80',
  },
  mx: {
    place: 'Historic center',
    imageUrl:
      'https://images.unsplash.com/photo-1512813199609-61be992ede52?auto=format&fit=crop&w=1600&q=80',
  },
  br: {
    place: 'Copacabana',
    imageUrl:
      'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1600&q=80',
  },
  in: {
    place: 'Taj Mahal',
    imageUrl:
      'https://images.unsplash.com/photo-1524492412937-b280c872990d?auto=format&fit=crop&w=1600&q=80',
  },
  ie: {
    place: 'Samuel Beckett Bridge',
    imageUrl:
      'https://images.unsplash.com/photo-1590080876351-94142c398fc1?auto=format&fit=crop&w=1600&q=80',
  },
  gr: {
    place: 'Santorini',
    imageUrl:
      'https://images.unsplash.com/photo-1613395877344-13d4c79e4284?auto=format&fit=crop&w=1600&q=80',
  },
  cz: {
    place: 'Charles Bridge',
    imageUrl:
      'https://images.unsplash.com/photo-1541849546-216549ae216d?auto=format&fit=crop&w=1600&q=80',
  },
  hu: {
    place: 'Parliament & Danube',
    imageUrl:
      'https://images.unsplash.com/photo-1551867633-194f125bdd36?auto=format&fit=crop&w=1600&q=80',
  },
  dk: {
    place: 'Nyhavn',
    imageUrl:
      'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=1600&q=80',
  },
  no: {
    place: 'Bryggen',
    imageUrl:
      'https://images.unsplash.com/photo-1520769945061-0a448c463865?auto=format&fit=crop&w=1600&q=80',
  },
  fi: {
    place: 'Helsinki waterfront',
    imageUrl:
      'https://images.unsplash.com/photo-1517015838491-0e40bd9ba8fe?auto=format&fit=crop&w=1600&q=80',
  },
  sa: {
    place: 'Riyadh skyline',
    imageUrl:
      'https://images.unsplash.com/photo-1586724237569-f3d0c1b8f692?auto=format&fit=crop&w=1600&q=80',
  },
  qa: {
    place: 'Doha corniche',
    imageUrl:
      'https://images.unsplash.com/photo-1559564484-1ed923029a42?auto=format&fit=crop&w=1600&q=80',
  },
  my: {
    place: 'Petronas Towers',
    imageUrl:
      'https://images.unsplash.com/photo-1596422840783-008856a94f78?auto=format&fit=crop&w=1600&q=80',
  },
}

export function hasCuratedHighlightByIso(iso: string) {
  return Boolean(COUNTRY_HIGHLIGHTS[iso.toLowerCase().trim()])
}

export function hasCuratedHighlightByCountryName(countryName: string) {
  const iso = isoForCountryName(countryName)
  return hasCuratedHighlightByIso(iso)
}
