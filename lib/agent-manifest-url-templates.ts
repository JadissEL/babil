/**
 * Known https homepages/API roots for official / statistics sources (manifest labels).
 * Qualitative tiers are marked skipped by build script, not listed here.
 */

export const OFFICIAL_SOURCE_URL_TEMPLATES: Readonly<Record<string, string>> = {
  'World Bank': 'https://data.worldbank.org/country/{slug}',
  'International Monetary Fund (IMF)': 'https://www.imf.org/en/Countries/{slug}',
  OECD: 'https://www.oecd.org',
  'United Nations': 'https://data.un.org',
  UNESCO: 'https://www.unesco.org',
  UNICEF: 'https://data.unicef.org',
  'International Labour Organization (ILO)': 'https://ilostat.ilo.org',
  'World Health Organization (WHO)': 'https://www.who.int',
  'International Organization for Migration (IOM)': 'https://www.iom.int',
  'UNHCR — Refugee Data Finder': 'https://www.unhcr.org/refugee-statistics',
  Eurostat: 'https://ec.europa.eu/eurostat',
  'CIA World Factbook': 'https://www.cia.gov/the-world-factbook/countries/{slug}/',
  'U.S. State Department — Travel Advisories':
    'https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html',
  'UK Foreign, Commonwealth & Development Office (FCDO)':
    'https://www.gov.uk/foreign-travel-advice',
  'Government of Canada — Travel advice': 'https://travel.gc.ca/travelling/advisories',
  'France Diplomatie — Conseils aux voyageurs':
    'https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/conseils-par-pays-destination/',
  'European Union — Your Europe (mobility)': 'https://europa.eu/youreurope/citizens/index_en.htm',
  'Schengen Visa Info': 'https://www.schengenvisainfo.com',
  'Campus France': 'https://www.campusfrance.org',
  'Erasmus+': 'https://erasmus-plus.ec.europa.eu',
  Numbeo: 'https://www.numbeo.com/cost-of-living/country_result.jsp?country={encodedCountry}',
  'Trading Economics': 'https://tradingeconomics.com/country-list',
  'Our World in Data': 'https://ourworldindata.org',
  'Google Public Data Explorer': 'https://www.google.com/publicdata/directory',
  OpenStreetMap: 'https://www.openstreetmap.org',
  'REST Countries API': 'https://restcountries.com/v3.1/name/{encodedCountry}',
  Wikipedia: 'https://en.wikipedia.org/wiki/{encodedCountry}',
  Statista: 'https://www.statista.com',
  'Global Economy': 'https://www.global-economy.com',
  NationMaster: 'https://www.nationmaster.com/country-info/stats/{encodedCountry}',
  'Data.world': 'https://data.world',
  'European Union Open Data Portal': 'https://data.europa.eu',
  Gapminder: 'https://www.gapminder.org',
  'World Trade Organization (WTO)': 'https://www.wto.org',
  DAAD: 'https://www.daad.de',
  'Study in Canada': 'https://www.educanada.ca',
  'Education USA': 'https://educationusa.state.gov',
  UCAS: 'https://www.ucas.com',
  'QS Top Universities (TopUniversities)': 'https://www.topuniversities.com',
  UNHCR: 'https://www.unhcr.org',
  'World Bank — indicateurs macro & parité pouvoir':
    'https://api.worldbank.org/v2/country/{encodedCountry}?format=json',
  'OECD — données revenus & fiscalité quand pays membre': 'https://www.oecd.org',
  'Numbeo — indices comparatifs (qualité donnée variable: recouper OCDE / banques centrales)':
    'https://www.numbeo.com/cost-of-living/country_result.jsp?country={encodedCountry}',
  'Trading Economics — séries publiques synchronisées (vérifier source primaire citée)':
    'https://tradingeconomics.com/country-list',
  'France-Visas': 'https://france-visas.gouv.fr',
  'France-Visas — formulaires & dossier théorique pour dépôt Maroc/Rabat/Casablanca':
    'https://france-visas.gouv.fr',
  'VFS Global': 'https://www.vfsglobal.com',
  'VFS Global — agendas & check-lists locales (toujours recouper avec ambassade)':
    'https://www.vfsglobal.com',
  'TLScontact — centres visas (rendez-vous dépôt depuis Maroc, selon corridor)':
    'https://www.tlscontact.com',
  'BLS International — prestations visa hors Schengen depuis Maroc':
    'https://www.blsinternational.com',
  'IATA Travel Centre': 'https://www.iatatravelcentre.com',
  'IATA Travel Centre — conseils santé/documentation voyage à confirmer avec compagnie & immigration':
    'https://www.iatatravelcentre.com',
  VisaHQ: 'https://www.visahq.com',
  'UK Home Office': 'https://www.gov.uk/browse/visas-immigration',
  'IRCC (Canada)': 'https://www.canada.ca/en/immigration-refugees-citizenship.html',
  USCIS: 'https://www.uscis.gov',
  'Australian Government Immigration': 'https://immi.homeaffairs.gov.au',
  'New Zealand Immigration': 'https://www.immigration.govt.nz',
  'Schengen Visa Info — vulgarisation uniquement tant que corroborée par pays émetteur':
    'https://www.schengenvisainfo.com',
  Skyscanner: 'https://www.skyscanner.net',
  'Skyscanner — comparaison vols (vérif prix final sur site compagnie)':
    'https://www.skyscanner.net',
  'Google Flights': 'https://www.google.com/travel/flights',
  Kayak: 'https://www.kayak.com',
  Momondo: 'https://www.momondo.com',
  Expedia: 'https://www.expedia.com',
  'Trip.com': 'https://www.trip.com',
  'Kiwi.com': 'https://www.kiwi.com',
  CheapOair: 'https://www.cheapoair.com',
  Opodo: 'https://www.opodo.com',
  eDreams: 'https://www.edreams.com',
  LinkedIn: 'https://www.linkedin.com',
  Indeed: 'https://www.indeed.com',
  Glassdoor: 'https://www.glassdoor.com',
  Monster: 'https://www.monster.com',
  ZipRecruiter: 'https://www.ziprecruiter.com',
  AngelList: 'https://wellfound.com',
  'Welcome to the Jungle': 'https://www.welcometothejungle.com',
  StepStone: 'https://www.stepstone.com',
  JobStreet: 'https://www.jobstreet.com',
  Bayt: 'https://www.bayt.com',
  Airbnb: 'https://www.airbnb.com',
  'Booking.com': 'https://www.booking.com',
  Zillow: 'https://www.zillow.com',
  'Realtor.com': 'https://www.realtor.com',
  Rightmove: 'https://www.rightmove.co.uk',
  Idealista: 'https://www.idealista.com',
  Immowelt: 'https://www.immowelt.de',
  SeLoger: 'https://www.seloger.com',
  PropertyFinder: 'https://www.propertyfinder.com',
  Nestpick: 'https://www.nestpick.com',
  'Campus France — parcours candidats depuis Maroc': 'https://www.campusfrance.org',
  'DAAD — licences Allemagne & critères APS post-diplôme': 'https://www.daad.de',
  'Study in Canada — guides fédération & programmes provinciaux': 'https://www.educanada.ca',
  'Education USA — Admissions & financements USA pour candidats Maroc':
    'https://educationusa.state.gov',
  'Erasmus+ mobilités documentées depuis établissements marocains partenaires':
    'https://erasmus-plus.ec.europa.eu',
  'Scholarships.com': 'https://www.scholarships.com',
  Mastersportal: 'https://www.mastersportal.com',
  PhDportal: 'https://www.phdportal.com',
  Bloomberg: 'https://www.bloomberg.com',
  'Financial Times': 'https://www.ft.com',
  Reuters: 'https://www.reuters.com',
  'Global Peace Index': 'https://www.visionofhumanity.org',
  'Transparency International': 'https://www.transparency.org',
  'World Population Review': 'https://worldpopulationreview.com',
  XE: 'https://www.xe.com',
  OANDA: 'https://www.oanda.com',
  Expatistan: 'https://www.expatistan.com',
  "Ministère des Affaires Étrangères, de la Coopération Africaine et des Marocains Résidant à l'Étranger (MAECME)":
    'https://www.diplomatie.ma',
  'Portail national du Maroc (services publics numériques agrégés)':
    'https://www.service-public.ma',
  'Portail Consulat.ma / services consulaires Royaume du Maroc': 'https://www.consulat.ma',
  "Plateforme e-visa Maroc / procédures d'entrée (voyageurs)": 'https://www.acces-maroc.ma',
  'ANAPEC — emploi & formation au Maroc': 'https://www.anapec.org',
  'Air Arabia Maroc — destinations low-cost depuis Maroc': 'https://www.airarabia.com',
  'Ambassade de France au Maroc — section visas & services': 'https://ma.ambafrance.org',
  'Ambassade des États-Unis au Maroc — visas non-immigrant / immigrant': 'https://ma.usembassy.gov',
  'Ambassade du Canada au Maroc — visas & immigration':
    'https://www.canada.ca/en/immigration-refugees-citizenship.html',
  'Ambassade du Royaume-Uni au Maroc — visas':
    'https://www.gov.uk/world/organisations/british-embassy-rabat',
  "Ambassade d'Allemagne au Maroc — visas Schengen national": 'https://rabat.diplo.de',
  "Ambassade d'Espagne au Maroc — section visas":
    'https://www.exteriores.gob.es/Embajadas/marruecos/es/Paginas/inicio.aspx',
  "Direction Générale de la Sûreté Nationale (DGSN) — pièces d'identité & formalités":
    'https://www.dgsn.gov.ma',
  "Ministère de l'Éducation Nationale, du Préscolaire et des Sports (Maroc)":
    'https://www.education.gov.ma',
  "Ministère du Travail et de l'Insertion Professionnelle (Maroc)": 'https://www.emploi.gov.ma',
  'Office des Changes — transferts et réglementation devise': 'https://www.oc.gov.ma',
  'Royal Air Maroc — hubs & corridors internationaux': 'https://www.royalairmaroc.com',
  'Ryanair — liaisons EU ↔ Maroc (saisonnalité, bagages)': 'https://www.ryanair.com',
  'easyJet — liaisons ponctuelles EU ↔ Maroc': 'https://www.easyjet.com',
  'US CDC': 'https://www.cdc.gov',
  'Mubawab Maroc': 'https://www.mubawab.ma',
  'Avito Maroc': 'https://www.avito.ma',
  'Expatistan — budgets expatriés indicatifs': 'https://www.expatistan.com',
  'Ambassade de Türkiye au Maroc — visas & formalités': 'https://rabat.emb.mfa.gov.tr',
  'Ambassade des Émirats arabes unis au Maroc': 'https://www.uae-embassy.ma',
  'Ambassade de Chine au Maroc — visas & formalités': 'https://ma.china-embassy.gov.cn/eng/',
  'Ambassade de Russie au Maroc — visas & formalités': 'https://morocco.mid.ru',
  "Réseau des ambassades et consulats du Maroc à l'étranger — sites officiels par pays":
    'https://www.diplomatie.ma',
  'Le bon coin (France) — scouting avant relocation': 'https://www.leboncoin.fr',
  'Idealista — Espagne logement hors résidence étudiante': 'https://www.idealista.com',
  'Rightmove — UK scouting hypothétique puis validation légal résidence':
    'https://www.rightmove.co.uk',
  'LinkedIn — offres compatibles télétravail depuis Maroc / relocation sponsorisée':
    'https://www.linkedin.com/jobs',
  'Indeed pays destination': 'https://www.indeed.com',
  'Glassdoor insights salaires (à calibrer officiel)': 'https://www.glassdoor.com',
  'Bayt pour bassin MENA puis pays EU/NA': 'https://www.bayt.com',
  'Welcome to the Jungle — startups EU recrutant internationaux':
    'https://www.welcometothejungle.com',
};

/** Normalize manifest labels (curly quotes, NBSP) for template lookup. */
export function normalizeManifestLabel(label: string): string {
  return label
    .normalize('NFKC')
    .replace(/[\u2018\u2019\u201B]/g, "'")
    .replace(/\u00A0/g, ' ')
    .trim();
}

const NORMALIZED_URL_LOOKUP: Map<string, string> = new Map(
  Object.entries(OFFICIAL_SOURCE_URL_TEMPLATES).map(([k, v]) => [normalizeManifestLabel(k), v]),
);

/** Procedural / pattern guidance rows — no automated fetch URL. */
export function isProceduralGuidanceLabel(sourceLabel: string): boolean {
  const t = normalizeManifestLabel(sourceLabel);
  return (
    t.startsWith('Important:') ||
    t.startsWith('Pattern:') ||
    t.startsWith('Contrats/CDI:') ||
    t.startsWith('Universités officielles du pays destination')
  );
}

/** Resolve URL template for a manifest source label (exact or normalized key). */
export function resolveManifestUrlTemplate(sourceLabel: string): string | undefined {
  const direct = OFFICIAL_SOURCE_URL_TEMPLATES[sourceLabel];
  if (direct?.trim()) return direct;
  return NORMALIZED_URL_LOOKUP.get(normalizeManifestLabel(sourceLabel));
}

/** Tiers that are qualitative-only — no stable single URL for automated fetch. */
export const SKIPPED_FETCH_TIERS = new Set([
  'expat_qualitative',
  'morocco_community',
  'morocco_forums_qualitative',
  'supplemental_types',
  'morocco_migration_supplemental',
]);
