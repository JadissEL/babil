import { isoForCountryName } from '@/lib/country-card-mappers'
import { isSchengenMember } from '@/lib/schengen-members'

export type OfficialSourceLink = {
  id: string
  label: string
  url: string
  publisher?: string
}

const EU_MOBILITY: OfficialSourceLink[] = [
  {
    id: 'eu-youreurope-travel',
    label: 'Your Europe — voyager dans l’UE',
    url: 'https://europa.eu/youreurope/citizens/travel/index_fr.htm',
    publisher: 'Union européenne',
  },
  {
    id: 'eu-schengen-basics',
    label: 'Espace Schengen (vue d’ensemble)',
    url: 'https://home-affairs.ec.europa.eu/policies/schengen-borders-and-visa/schengen-area_fr',
    publisher: 'Commission européenne',
  },
]

/** Immigration / visa portals curated by ISO 3166-1 alpha-2 (lowercase). */
const BY_ISO_LOWER: Record<string, OfficialSourceLink[]> = {
  fr: [
    {
      id: 'france-visas',
      label: 'France-Visas',
      url: 'https://france-visas.gouv.fr/',
      publisher: 'Gouvernement français',
    },
  ],
  de: [
    {
      id: 'de-auswaertiges-amt',
      label: 'Auswärtiges Amt — visa & entrée',
      url: 'https://www.auswaertiges-amt.de/fr/einreiseundaufenthalt',
      publisher: 'Allemagne',
    },
  ],
  it: [
    {
      id: 'it-visto',
      label: 'Portail visa Italie',
      url: 'https://vistoperitalia.esteri.it/home/en',
      publisher: 'Italie',
    },
  ],
  es: [
    {
      id: 'es-maec-visados',
      label: 'Min. Affaires étrangères — visas',
      url: 'https://www.exteriores.gob.es/es/ServiciosAlCiudadano/Paginas/Consular/Visados.aspx',
      publisher: 'Espagne',
    },
  ],
  pt: [
    {
      id: 'pt-mne-vistos',
      label: 'Portugal — visas & séjour',
      url: 'https://www.portugal.gov.pt/pt/gc24/area-de-governo/justica/assuntos-para-o-cidadao/estrangeiros-em-portugal',
      publisher: 'Portugal',
    },
  ],
  nl: [
    {
      id: 'nl-worldwide',
      label: 'Pays-Bas dans le monde — visa',
      url: 'https://www.netherlandsworldwide.nl/visa-the-netherlands',
      publisher: 'Pays-Bas',
    },
  ],
  be: [
    {
      id: 'be-diplomatie',
      label: 'Belgique — voyager en Belgique',
      url: 'https://diplomatie.belgium.be/fr/travel-belgium',
      publisher: 'Belgique',
    },
  ],
  at: [
    {
      id: 'at-bmeia',
      label: 'Autriche — entrée & séjour',
      url: 'https://www.bmeia.gv.at/fr/ambassade-rabat/visa/',
      publisher: 'Autriche',
    },
  ],
  ch: [
    {
      id: 'ch-ch-ch',
      label: 'Suisse — entrée & séjour',
      url: 'https://www.ch.ch/fr/entree-sejour/',
      publisher: 'Suisse',
    },
  ],
  gb: [
    {
      id: 'uk-gov-visa',
      label: 'UK — vérifier un visa',
      url: 'https://www.gov.uk/check-uk-visa',
      publisher: 'Royaume-Uni',
    },
  ],
  us: [
    {
      id: 'us-state-visas',
      label: 'États-Unis — visas non-immigrants',
      url: 'https://travel.state.gov/content/travel/en/us-visas.html',
      publisher: 'États-Unis',
    },
  ],
  ca: [
    {
      id: 'ca-immigration',
      label: 'Canada — immigration & visas',
      url: 'https://www.canada.ca/fr/services/immigration-citoyennete.html',
      publisher: 'Canada',
    },
  ],
}

function dedupeById(links: OfficialSourceLink[]): OfficialSourceLink[] {
  const seen = new Set<string>()
  const out: OfficialSourceLink[] = []
  for (const L of links) {
    if (seen.has(L.id)) continue
    seen.add(L.id)
    out.push(L)
  }
  return out
}

function worldBankCountryProfileUrl(isoLower: string): OfficialSourceLink | null {
  if (!isoLower || isoLower.length !== 2) return null
  const upper = isoLower.toUpperCase()
  return {
    id: `wb-${isoLower}`,
    label: 'Banque mondiale — profil pays',
    url: `https://data.worldbank.org/country/${upper}`,
    publisher: 'World Bank',
  }
}

/**
 * Liens institutionnels à afficher en tête de fiche (complément OSINT, pas un conseil juridique).
 */
export function officialSourcesForCountry(countryName: string, datasetRegion: string): OfficialSourceLink[] {
  const isoLower = isoForCountryName(countryName).toLowerCase()
  const regionNorm = String(datasetRegion ?? '').toLowerCase()
  const links: OfficialSourceLink[] = []

  const national = BY_ISO_LOWER[isoLower]
  if (national) links.push(...national)

  const inEurope =
    regionNorm.includes('europe') || regionNorm.includes('schengen') || isSchengenMember(countryName)
  if (inEurope) links.push(...EU_MOBILITY)

  const wb = worldBankCountryProfileUrl(isoLower)
  if (wb) links.push(wb)

  return dedupeById(links)
}
