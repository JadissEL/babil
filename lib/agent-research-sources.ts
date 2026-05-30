/**
 * Canonical research source manifest for the agents runner — priority order and naming
 * for downstream LLM/deep-search steps that consume `full_data._agent`.
 *
 * Global bundle: tiers 1–11 (~150 rows). Moroccan corridor addon: tiers M1–M11 with
 * contextualized / duplicate-aware labels plus strategic discovery types M81–M150-style.
 */

export const AGENT_RESEARCH_SOURCES_VERSION = 'agent-research-sources-v2' as const

/** One-line cue appended to adaptive queries when building hints. */
export const AGENT_PRIMARY_RESEARCH_HINT =
  'Source hierarchy: official first → confirm with aggregated statistics/APIs → only then community/testimonials with URLs and dates'

/** Optional Morocco-corridor reinforcement (see runner env `AGENT_MOROCCO_HINT`). */
export const AGENT_MOROCCO_RESEARCH_HINT =
  'Maroc corridors: officiel MA + ambassades pays cible au Maroc → données (coûts, marché) → témoignages UGC avec date & URL ; visas toujours recoupés avec consulat/autorités'

export const AGENT_RESEARCH_RULES_DO_NOT = [
  'Do not pull from this list randomly or cycle sources without topical relevance.',
  'Do not treat forums or UGC as primary evidence without triangulation.',
  'Do not scrape aggressively or bypass robots/terms; prefer official APIs and exports where available.',
] as const

export const AGENT_RESEARCH_RULES_MUST = [
  'Prioritize official / intergovernmental primary documents and portals.',
  'Cross-check key facts with reputable statistics datasets (tier-2 categories).',
  'Use expat/community content only as qualitative enrichment with clear attribution.',
] as const

export const AGENT_RESEARCH_RULES_MOROCCO_MUST = [
  'PRIORITÉ: OFFICIEL (Maroc / pays destination) puis DATA puis EXPÉRIENCE RÉELLE.',
  'Règles et procédures visa: toujours confirmer auprès des autorités consulaires officielles (ambassades / consulats / portails États).',
  'Les règles de visa changent souvent: vérifier la date de publication et le pays d’application du dossier (dépôt depuis le Maroc).',
  'Groupes sociaux (Facebook, Telegram, TikTok): signal terrain uniquement après validation par source primaire ou statistiques.',
  'Courtiers/agences locales: traiter comme orientations commerciales, jamais comme source légale unique.',
] as const

export type AgentResearchTier =
  | 'official_critical'
  | 'statistics'
  | 'transport'
  | 'housing'
  | 'education'
  | 'employment'
  | 'visa'
  | 'expat_qualitative'
  | 'health_wellbeing'
  | 'finance_news'
  | 'supplemental_types'
  | 'morocco_official'
  | 'morocco_embassy_examples'
  | 'morocco_visa_corridor'
  | 'morocco_community'
  | 'morocco_forums_qualitative'
  | 'morocco_transport'
  | 'morocco_housing_platforms'
  | 'morocco_education_corridor'
  | 'morocco_employment_corridor'
  | 'morocco_cost_of_living'
  | 'morocco_migration_supplemental'

export type AgentResearchCategory = {
  id: string
  labelFr: string
  tier: AgentResearchTier
  /** Higher = consult first when the topic overlaps (official_critical = 100). */
  priority: number
  sources: readonly string[]
}

/** Structured blocks 1–11 (global). */
export const AGENT_RESEARCH_SOURCE_CATEGORIES: readonly AgentResearchCategory[] = [
  {
    id: 'official_global',
    labelFr: '1. Sources officielles (critiques) — portails globaux',
    tier: 'official_critical',
    priority: 100,
    sources: [
      'World Bank',
      'International Monetary Fund (IMF)',
      'OECD',
      'United Nations',
      'UNESCO',
      'UNICEF',
      'UNHCR',
      'World Health Organization (WHO)',
      'International Labour Organization (ILO)',
      'World Trade Organization (WTO)',
    ],
  },
  {
    id: 'statistics_data',
    labelFr: '2. Statistiques & data',
    tier: 'statistics',
    priority: 80,
    sources: [
      'Eurostat',
      'Numbeo',
      'Statista',
      'Trading Economics',
      'Global Economy',
      'NationMaster',
      'Data.world',
      'European Union Open Data Portal',
      'Our World in Data',
      'Gapminder',
    ],
  },
  {
    id: 'flights_transport',
    labelFr: '3. Vols & transport',
    tier: 'transport',
    priority: 55,
    sources: [
      'Skyscanner',
      'Google Flights',
      'Kayak',
      'Momondo',
      'Expedia',
      'Trip.com',
      'Kiwi.com',
      'CheapOair',
      'Opodo',
      'eDreams',
    ],
  },
  {
    id: 'housing_cost_of_living',
    labelFr: '4. Logement & coût de la vie',
    tier: 'housing',
    priority: 55,
    sources: [
      'Airbnb',
      'Booking.com',
      'Zillow',
      'Realtor.com',
      'Rightmove',
      'Idealista',
      'Immowelt',
      'SeLoger',
      'PropertyFinder',
      'Nestpick',
    ],
  },
  {
    id: 'study_universities',
    labelFr: '5. Études & universités',
    tier: 'education',
    priority: 70,
    sources: [
      'Campus France',
      'DAAD',
      'Study in Canada',
      'Education USA',
      'UCAS',
      'Erasmus+',
      'Scholarships.com',
      'Mastersportal',
      'PhDportal',
      'QS Top Universities (TopUniversities)',
    ],
  },
  {
    id: 'employment_labour_market',
    labelFr: '6. Emploi & marché du travail',
    tier: 'employment',
    priority: 60,
    sources: [
      'LinkedIn',
      'Indeed',
      'Glassdoor',
      'Monster',
      'ZipRecruiter',
      'AngelList',
      'Welcome to the Jungle',
      'StepStone',
      'JobStreet',
      'Bayt',
    ],
  },
  {
    id: 'visa_immigration',
    labelFr: '7. Visa et immigration',
    tier: 'visa',
    priority: 90,
    sources: [
      'IATA Travel Centre',
      'VisaHQ',
      'VFS Global',
      'Schengen Visa Info',
      'UK Home Office',
      'USCIS',
      'IRCC (Canada)',
      'Australian Government Immigration',
      'New Zealand Immigration',
      'France-Visas',
    ],
  },
  {
    id: 'expat_real_world',
    labelFr: '8. Expats & retours réels',
    tier: 'expat_qualitative',
    priority: 35,
    sources: [
      'Reddit',
      'YouTube',
      'Quora',
      'Expat.com',
      'InterNations',
      'Nomad List',
      'Couchsurfing',
      'TripAdvisor',
      'Lonely Planet',
      'Culture Trip',
    ],
  },
  {
    id: 'health_quality_of_life',
    labelFr: '9. Santé & qualité de vie',
    tier: 'health_wellbeing',
    priority: 75,
    sources: [
      'World Health Organization (WHO)',
      'US CDC',
      'World Population Review',
      'Global Peace Index',
      'Transparency International',
    ],
  },
  {
    id: 'finance_economics_news',
    labelFr: '10. Finance & économie',
    tier: 'finance_news',
    priority: 50,
    sources: ['XE', 'OANDA', 'Bloomberg', 'Reuters', 'Financial Times'],
  },
  {
    id: 'supplemental_types_91_150',
    labelFr: '11. Autres sources (91–150) — types à couvrir par pays',
    tier: 'supplemental_types',
    priority: 65,
    sources: [
      'Official embassy websites (origin ↔ destination corridors)',
      'Consulate announcements and visa section PDFs',
      'Local ministry of labour / workforce portals',
      'Ministry / department of education or higher-ed regulator',
      'Ministry of interior / immigration procedural guides',
      'Foreign affairs ministry travel advisories (host countries)',
      'Official university registrar and admissions PDFs',
      'National accreditation or quality assurance agencies for HE',
      'Recognised doctoral school directories (country-specific)',
      'Specialised expatriate blogs (single corridor or niche topic)',
      'Country subreddits / language-specific forums',
      'National open-government data catalogues',
      'Regional statistical offices (sub-national)',
      'Bilateral chambers of commerce publications',
      'Host-country investment promotion agencies',
      'Tourism ministry practical guides (beyond marketing copy)',
      'National rail / ferry / transit operator timetable APIs or PDFs',
      'Civil aviation authority passenger rights pages',
      'Consumer protection agencies (landlord–tenant summaries)',
      'National tax authority residency definitions',
      'Social security bilateral agreement texts',
      'Central bank FX / inflation bulletins',
      'National public health traveller notices',
      'Professional licensing boards (medicine, engineering, law)',
      'Bar association referral pages for foreigners',
      'National tenancy law plain-language summaries (NGOs or bar)',
      'Local telecom regulator coverage maps',
      'Utility provider price calculators (regulated tariffs)',
      'School fee transparency portals (government or watchdog)',
      'Scholarship aggregators mirrored by embassy confirmation',
      'National scholarship agency (Fulbright equivalents, etc.)',
      'PhD vacancy aggregators mirrored by supervisor lab sites',
      'Employer federation wage survey summaries',
      'Trade union federation sector briefings',
      'National minimum wage gazettes',
      'Safety & hygiene regulator workplace pages',
      'Road traffic authority licence exchange FAQs',
      'Automobile club international driving permit guidance',
      'Insurance regulator policy comparability notices',
      'Banking supervisor expat account rule summaries',
      'Charity commissioners or NGO registers (volunteering)',
      'Youth mobility scheme official pages (WHY equivalents)',
      'Seasonal agricultural work programme portals',
      'Artist / entertainer visa category FAQs',
      'Startup founder visa incubator partner lists',
      'Digital nomad visa official criteria pages',
      'Refugee / complementary protection procedural portals',
      'Stateless-person travel document guidance',
      'Family reunification policy circulars',
      'Same-sex partnership recognition summaries (official only)',
      'Custody-aware relocation legal primers (bar associations)',
      'Pet import veterinary service portals',
      'Customs traveller declaration value thresholds',
      'Import VAT / duties on personal effects guidance',
      'Firearms / controlled goods traveller prohibitions',
      'Maritime arriving passenger border steps',
      'Port health or yellow-fever vaccination points',
      'Language test provider official band descriptors',
      'Recognised translators for certified document lists',
      'Apostille / legalisation authority index pages',
    ],
  },
]

/** Focus corridor Marocains / MRE — complète le bundle global sans remplacer les entrées officielles. */
export const AGENT_MOROCCO_SOURCE_CATEGORIES: readonly AgentResearchCategory[] = [
  {
    id: 'ma_official',
    labelFr: 'M1. Sources officielles marocaines (priorité critique)',
    tier: 'morocco_official',
    priority: 105,
    sources: [
      'Ministère des Affaires Étrangères, de la Coopération Africaine et des Marocains Résidant à l’Étranger (MAECME)',
      'Portail Consulat.ma / services consulaires Royaume du Maroc',
      'Direction Générale de la Sûreté Nationale (DGSN) — pièces d’identité & formalités',
      'Office des Changes — transferts et réglementation devise',
      'ANAPEC — emploi & formation au Maroc',
      'Ministère du Travail et de l’Insertion Professionnelle (Maroc)',
      'Ministère de l’Éducation Nationale, du Préscolaire et des Sports (Maroc)',
      'Portail national du Maroc (services publics numériques agrégés)',
      'Plateforme e-visa Maroc / procédures d’entrée (voyageurs)',
      'Réseau des ambassades et consulats du Maroc à l’étranger — sites officiels par pays',
      'Important: faire valider visas et quotas par autorités officielles (MAE destination + représentations au Maroc)',
    ],
  },
  {
    id: 'ma_embassies_in_morocco',
    labelFr: 'M2. Ambassades & consulats (au Maroc) — exemples + pattern bilateral',
    tier: 'morocco_embassy_examples',
    priority: 102,
    sources: [
      'Ambassade de France au Maroc — section visas & services',
      'Ambassade d’Espagne au Maroc — section visas',
      'Ambassade du Canada au Maroc — visas & immigration',
      'Ambassade d’Allemagne au Maroc — visas Schengen national',
      'Ambassade des États-Unis au Maroc — visas non-immigrant / immigrant',
      'Ambassade de Türkiye au Maroc — visas & formalités',
      'Ambassade des Émirats arabes unis au Maroc',
      'Ambassade de Chine au Maroc — visas & formalités',
      'Ambassade de Russie au Maroc — visas & formalités',
      'Ambassade du Royaume-Uni au Maroc — visas',
      'Pattern: cartographier toutes les ambassades / consulats du pays destination accrédités au Maroc pour le dossier utilisateur',
      'Important: réglementations bilatérales — uniquement via communiqués consulaires officiels ou portails États',
    ],
  },
  {
    id: 'ma_visa_corridor_services',
    labelFr: 'M3. Visa et immigration — prestataires depuis le Maroc (lecture complémentaire)',
    tier: 'morocco_visa_corridor',
    priority: 95,
    sources: [
      'TLScontact — centres visas (rendez-vous dépôt depuis Maroc, selon corridor)',
      'BLS International — prestations visa hors Schengen depuis Maroc',
      'VFS Global — agendas & check-lists locales (toujours recouper avec ambassade)',
      'France-Visas — formulaires & dossier théorique pour dépôt Maroc/Rabat/Casablanca',
      'Schengen Visa Info — vulgarisation uniquement tant que corroborée par pays émetteur',
      'IATA Travel Centre — conseils santé/documentation voyage à confirmer avec compagnie & immigration',
      'Important: changements fréquents — vérifier systématiquement avec consulat compétent la veille du dépôt',
    ],
  },
  {
    id: 'ma_communities',
    labelFr: 'M4. Communautés marocaines (terrain — dernier niveau)',
    tier: 'morocco_community',
    priority: 38,
    sources: [
      'Facebook groups thématiques (ex.: Marocains au Canada — refus visas, emploi, logement)',
      'Facebook groups thématiques (ex.: Marocains en France / Espagne / USA / Türkiye)',
      'Facebook groups MRE orientation & expatriation',
      'Reddit — fils Morocco ↔ destination pour retours vécu moderés',
      'YouTube — chaînes Maroc/expatriation (attribuer titre, chaîne, date)',
      'TikTok — micro-témoignages (toujours tertiaires; trianguler avant conclusion)',
      'Important: signal vécu discrimination / refus visas — corroboration obligatoire (stats officielles / jurisprudence / ONG reconnues)',
    ],
  },
  {
    id: 'ma_forums',
    labelFr: 'M5. Forums & retours réels (orientation Maroc corridors)',
    tier: 'morocco_forums_qualitative',
    priority: 37,
    sources: [
      'Expat.com — discussions Maroc pays cible',
      'InterNations — clubs Maroc & pays destination',
      'Quora — Q/R migration Maroc ↔ pays cible (dates & profils utilisateurs)',
      'TripAdvisor — retours voyages résidents Maroc vers destination temporaire',
      'Lonely Planet / guides — contexte général puis validation officielle',
    ],
  },
  {
    id: 'ma_air_transport',
    labelFr: 'M6. Transport & vols (couloirs depuis/vers Maroc)',
    tier: 'morocco_transport',
    priority: 58,
    sources: [
      'Royal Air Maroc — hubs & corridors internationaux',
      'Air Arabia Maroc — destinations low-cost depuis Maroc',
      'Ryanair — liaisons EU ↔ Maroc (saisonnalité, bagages)',
      'easyJet — liaisons ponctuelles EU ↔ Maroc',
      'Skyscanner — comparaison vols (vérif prix final sur site compagnie)',
    ],
  },
  {
    id: 'ma_housing_listings',
    labelFr: 'M7. Logement — plateformes fréquentées par dossiers depuis Maroc',
    tier: 'morocco_housing_platforms',
    priority: 56,
    sources: [
      'Avito Maroc',
      'Mubawab Maroc',
      'Le bon coin (France) — scouting avant relocation',
      'Idealista — Espagne logement hors résidence étudiante',
      'Rightmove — UK scouting hypothétique puis validation légal résidence',
    ],
  },
  {
    id: 'ma_education_corridor',
    labelFr: 'M8. Études — marocains à l’étranger (double vérification portails officiels pays)',
    tier: 'morocco_education_corridor',
    priority: 72,
    sources: [
      'Campus France — parcours candidats depuis Maroc',
      'DAAD — licences Allemagne & critères APS post-diplôme',
      'Erasmus+ mobilités documentées depuis établissements marocains partenaires',
      'Education USA — Admissions & financements USA pour candidats Maroc',
      'Study in Canada — guides fédération & programmes provinciaux',
      'Universités officielles du pays destination — brochures admission internationale',
    ],
  },
  {
    id: 'ma_employment_corridor',
    labelFr: 'M9. Emploi — migration professionnelle (signaux puis contrats officiels)',
    tier: 'morocco_employment_corridor',
    priority: 61,
    sources: [
      'LinkedIn — offres compatibles télétravail depuis Maroc / relocation sponsorisée',
      'Indeed pays destination',
      'Glassdoor insights salaires (à calibrer officiel)',
      'Bayt pour bassin MENA puis pays EU/NA',
      'Welcome to the Jungle — startups EU recrutant internationaux',
      'Contrats/CDI: toujours valider conditions légales travail & visa associé (ministère destination)',
    ],
  },
  {
    id: 'ma_cost_of_living',
    labelFr: 'M10. Coût de la vie — comparaison Maroc ↔ destination',
    tier: 'morocco_cost_of_living',
    priority: 78,
    sources: [
      'Numbeo — indices comparatifs (qualité donnée variable: recouper OCDE / banques centrales)',
      'Expatistan — budgets expatriés indicatifs',
      'World Bank — indicateurs macro & parité pouvoir',
      'OECD — données revenus & fiscalité quand pays membre',
      'Trading Economics — séries publiques synchronisées (vérifier source primaire citée)',
    ],
  },
  {
    id: 'ma_migration_supplemental_81_150',
    labelFr: 'M11. Sources stratégiques additionnelles (focus Marocains — à découvrir intelligemment)',
    tier: 'morocco_migration_supplemental',
    priority: 66,
    sources: [
      'Blogs personnels « immigrer au Canada depuis le Maroc »',
      'Blogs « visa France Maroc — refus / acceptations » avec pièces jointes anonymisées',
      'Sites « expat Maroc Europe » regroupant check-lists (valider chaque point)',
      'Plateformes freelancing & portage salarial mentionnant relocation Maroc → EU/NA',
      'Chaînes YouTube marocaines immigration (sponsorings, publicités = biais déclaré)',
      'Influenceurs marocains expatriés — stories « comment j’ai obtenu mon visa » (preuve documentaire requise)',
      'Forums étudiants marocains (bac+ mobilité, logement, bourses)',
      'Groupes Telegram immigration (modération faible — triangulation renforcée)',
      'Sites d’avocats spécialisés mobilité internationale (interprétation juridique, pas substitut texte loi)',
      'Agences visa locales au Maroc — procédures commerciales vs obligations officielles',
      'Sites d’orientation scolaire et universitaire Maroc (office public, académies — vérifier reconnaissance)',
      'Portails diaspora & MRE (programmes de retour, financement PME)',
      'Journaux marocains économie & immigration (Le Desk, TelQuel, etc. — date & auteur)',
      'Plateformes témoignages vidéo migration (transcription + métadonnées)',
      'Comparateurs assurance voyage & assurance santé expatriation',
      'Sites d’aide visa étudiants (check-lists — recouper université + consulat)',
      'Portails ONG migration & droits humains (rapports datés)',
      'Bases open data nationales du pays destination liées à l’emploi des étrangers',
      'Plateformes volontariat international (conditions visa « volontaire » légales)',
      'Sites bourses niche (STEM, islamic finance, coopération Sud-Sud)',
      'Webinaires CCI France-Maroc / GIZ / banques partenaires (supports PDF officiels)',
      'Programmes Talent passport / equivalents EU — pages ministères destinataires',
      'Associations étudiants MAR à l’étranger — guides d’accueil',
      'Carnets diplomatiques locales (consultations mobiles consulaires)',
      'APIs cours de change officielles Bank Al-Maghrib vs banques commerciales',
      'Rapports HCP (Haut Commissariat au Plan Maroc) sur démobilité potentielle',
      'Enquêtes ONDH / instances droits locales sur discriminations signalées',
      'Guides CCI export & mobilité professionnelle (version PDF certifiée)',
      'Coworking labels remote-work friendly au Maroc (signal marché freelances)',
      'Marketplaces cours en ligne MAR → clients EU (compliance fiscal transfrontière)',
      'Podcasts diaspora MAR (citations avec timestamp)',
      'Newsletters avocats spécialisés corridor Schengen/US/CA',
      'Google Scholar — articles migrations Maghreb↔EU pour contexte socio-économique',
      'Statistiques consulaires françaises sur délivrance visas (datasets annuels)',
      'Eurostat mig démographie — stocks migrants origine MAGHREB',
      'OCDE migration outlook chapitres Maroc lorsque disponibles',
      'Plateformes logement courte durée scout avant CDI sponsorisé',
      'simulateurs fiscalité inversion résidence MAR ↔ EU',
      'Cartes zones tension logement ville destination (plans urbanisme officiels)',
      'Watchlists médias indépendants sur refus quotas visa étudiants',
      'Synthèses syndicats étudiants internationaux (UNEF, ESU — versions officielles)',
      'Répertoire traducteurs assermentés Maroc pays destination',
      'Guides santé vaccination voyage IAMAT / santé voyage MAE UE',
      'Check-lists apostille/Legalisation Hague pour diplômes marocains',
      'FAQ transport animaux domestiques depuis Maroc (ministères agriculture bilateral)',
      'Données climat saisonnières impact coûts billets (sources météo nationales)',
      'Cartographie escales Visa Transit aéroports EU pour résidents MAR',
      'Ressources FEMISE / ECDPM corridor EU-Méditerranée',
      'Papers Carnegie / Brookings région MENA mobility (contexte géopolitique)',
      'Rapports Transparency Maroc corrélés perception corruption mobilité',
      'Briefings ambassades UE publiques sur mobilité circulaire',
      'Synthèses UN DESA migrations internationales (extraits tableau par corridor)',
      'Guides handicap & accessibilité transport Maroc pays destination',
      'Portails aides familiales transfert fonds officiel vs informal channels risks',
      'Simulateurs aides CAF equivalents pays EU pour anciens résidents MAR',
      'Guides création SCI / holding relocation patrimoine (conseiller fiscal agréé)',
      'FAQ double imposition MAR–France/Espagne/US (conventions officielles PDF)',
      'Archives médias télévision publique MAR reportages migration légale',
      'Stories LinkedIn recruiter insights mobilité Maghreb (biais marché)',
      'Données start-up nation programmes remote visa (Emirats, Estonie…) vs résidence MAR',
      'Catalogues aides micro-finance Diaspora cofinancées institutions MAR',
      'Synthèses GRECO / GRETA anti-corruption documents voyage',
      'Ressources santé mentale migrants — ONG reconnues (pas conseil médical)',
      'Référentiels éthiques collecte témoignages migration (protection données RGPD où applicable)',
      'Crowdfunding études & passeports talents — conditions légales pays hôte uniquement via source primaire',
      'Répertoires officiels médiateurs consommation voyage & transport aérien MAR/UE',
      'Guides primes relocation employeur versus impôt sur traitement frontalier',
      'Tableaux quotas étudiants par établissement (brochures officielles vs rumeurs réseaux)',
      'Synthèses think tanks européens sur mobilité circulaire Maroc UE (notes de politiques publiques)',
      'Plateformes comparateurs contrats mobiles EU pour résidents longue durée issus MAR',
    ],
  },
]

function sumCategoryRows(cats: readonly AgentResearchCategory[]): number {
  let n = 0
  for (const cat of cats) {
    n += cat.sources.length
  }
  return n
}

export const AGENT_STRUCTURED_SOURCE_ROW_TOTAL = sumCategoryRows(AGENT_RESEARCH_SOURCE_CATEGORIES)
export const AGENT_MOROCCO_STRUCTURED_SOURCE_ROW_TOTAL = sumCategoryRows(AGENT_MOROCCO_SOURCE_CATEGORIES)
export const AGENT_COMBINED_STRUCTURED_SOURCE_ROW_TOTAL =
  AGENT_STRUCTURED_SOURCE_ROW_TOTAL + AGENT_MOROCCO_STRUCTURED_SOURCE_ROW_TOTAL

export type AgentResearchSourcesPayload = {
  version: typeof AGENT_RESEARCH_SOURCES_VERSION
  primaryHint: typeof AGENT_PRIMARY_RESEARCH_HINT
  moroccoCorridorHint: typeof AGENT_MOROCCO_RESEARCH_HINT
  rulesDoNot: readonly string[]
  rulesMust: readonly string[]
  rulesMoroccoMust: readonly string[]
  hierarchy: readonly string[]
  categories: readonly {
    id: string
    labelFr: string
    tier: AgentResearchTier
    priority: number
    sources: readonly string[]
  }[]
  moroccoCorridorCategories: readonly {
    id: string
    labelFr: string
    tier: AgentResearchTier
    priority: number
    sources: readonly string[]
  }[]
  /** Global manifest only (unchanged count vs v1 bundle). */
  globalStructuredSourceRowTotal: number
  /** Global + Morocco corridor categories (concatenated in `categories`). */
  structuredSourceRowTotal: number
  moroccoStructuredSourceRowTotal: number
}

function mapCats(cats: readonly AgentResearchCategory[]) {
  return cats.map((c) => ({
    id: c.id,
    labelFr: c.labelFr,
    tier: c.tier,
    priority: c.priority,
    sources: c.sources,
  }))
}

/** Snapshot stored under `full_data._agent.researchSourceManifest`. */
export function buildAgentResearchSourcesPayload(): AgentResearchSourcesPayload {
  const moroccoMapped = mapCats(AGENT_MOROCCO_SOURCE_CATEGORIES)
  const globalMapped = mapCats(AGENT_RESEARCH_SOURCE_CATEGORIES)

  return {
    version: AGENT_RESEARCH_SOURCES_VERSION,
    primaryHint: AGENT_PRIMARY_RESEARCH_HINT,
    moroccoCorridorHint: AGENT_MOROCCO_RESEARCH_HINT,
    rulesDoNot: AGENT_RESEARCH_RULES_DO_NOT,
    rulesMust: AGENT_RESEARCH_RULES_MUST,
    rulesMoroccoMust: AGENT_RESEARCH_RULES_MOROCCO_MUST,
    /** Tier consult order: officiel MA / global → visa & données → transport/logement → terrain / types à découvrir. */
    hierarchy: [
      'morocco_official',
      'official_critical',
      'morocco_embassy_examples',
      'visa',
      'morocco_visa_corridor',
      'statistics',
      'morocco_cost_of_living',
      'education',
      'morocco_education_corridor',
      'employment',
      'morocco_employment_corridor',
      'transport',
      'morocco_transport',
      'housing',
      'morocco_housing_platforms',
      'morocco_community',
      'morocco_forums_qualitative',
      'expat_qualitative',
      'health_wellbeing',
      'finance_news',
      'morocco_migration_supplemental',
      'supplemental_types',
    ],
    categories: [...globalMapped, ...moroccoMapped],
    moroccoCorridorCategories: moroccoMapped,
    globalStructuredSourceRowTotal: AGENT_STRUCTURED_SOURCE_ROW_TOTAL,
    structuredSourceRowTotal: AGENT_COMBINED_STRUCTURED_SOURCE_ROW_TOTAL,
    moroccoStructuredSourceRowTotal: AGENT_MOROCCO_STRUCTURED_SOURCE_ROW_TOTAL,
  }
}
