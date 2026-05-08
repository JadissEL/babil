import type { EnrichedCountryApi } from '@/lib/enrich-country-api'
import { frictionTierFromCountry, scoreToMobilityTier } from '@/lib/country-card-mappers'
import { hasCountryPhdStoredData } from '@/lib/country-phd-studies'

import type { CompareSignalId } from '@/lib/compare-signals'
import { extractCompareSignals } from '@/lib/compare-signals'

/** Leaf objective — add new IDs here + entry in COMPARE_OBJECTIVES. */
export type CompareObjectiveId =
  | 'tourism'
  | 'work'
  | 'studies_bachelor'
  | 'studies_master'
  | 'studies_phd'
  | 'training_short_technical'
  | 'training_long_technical'
  | 'language_training'
  | 'events'
  | 'business'
  | 'investment'
  | 'startup'
  | 'street_food_small_business'
  | 'creator_content'
  | 'sports_pro'

export type CompareCategoryId = 'leisure' | 'work' | 'education' | 'business' | 'media_sport'

export type CompareWeights = Partial<Record<CompareSignalId, number>>

export type CompareKpiColumnKey =
  | 'visa_tourism'
  | 'visa_study'
  | 'visa_work'
  | 'visa_business'
  | 'friction_tier'
  | 'study_tier'
  | 'business_tier'
  | 'education'
  | 'phd'
  | 'short_access'
  | 'tech_access'
  | 'lang_access'
  | 'street'

export type CompareObjectiveDefinition = {
  id: CompareObjectiveId
  categoryId: CompareCategoryId
  label: string
  shortLabel: string
  description: string
  /** User-facing: why order changes vs another objective */
  scoringRationale: string
  weights: CompareWeights
  kpiColumns: CompareKpiColumnKey[]
  /** When this country ranks first among selection */
  winBlurb: string
}

export const COMPARE_CATEGORIES: Array<{
  id: CompareCategoryId
  label: string
  description: string
}> = [
  {
    id: 'leisure',
    label: 'Tourisme & séjours',
    description: 'Vacances, événements et courts séjours.',
  },
  {
    id: 'work',
    label: 'Travail & carrière',
    description: 'Emploi, sport professionnel, projets durables.',
  },
  {
    id: 'education',
    label: 'Études & formations',
    description: 'Diplômes, formations techniques et langues.',
  },
  {
    id: 'business',
    label: 'Business & investissement',
    description: 'Affaires, investissement, startup et commerce local.',
  },
  {
    id: 'media_sport',
    label: 'Création & sport',
    description: 'Contenu, tournages, athlètes et visibilité internationale.',
  },
]

const W = {
  tourism: { tourism: 0.55, friction: 0.25, study: 0.1, business: 0.1 },
  work: { work: 0.45, friction: 0.25, business: 0.15, study: 0.15 },
  study: { study: 0.45, education: 0.25, friction: 0.2, tourism: 0.1 },
  studyPhd: { study: 0.35, phdPresence: 0.3, education: 0.2, friction: 0.15 },
  shortTech: { shortCourses: 0.4, study: 0.25, friction: 0.2, work: 0.15 },
  longTech: { technicalTraining: 0.4, study: 0.25, education: 0.2, friction: 0.15 },
  language: { languageStudy: 0.45, study: 0.25, friction: 0.15, tourism: 0.15 },
  events: { tourism: 0.4, business: 0.25, friction: 0.2, study: 0.15 },
  business: { business: 0.45, work: 0.2, friction: 0.2, tourism: 0.15 },
  invest: { business: 0.35, work: 0.2, friction: 0.2, streetFood: 0.15, study: 0.1 },
  startup: { business: 0.4, work: 0.25, friction: 0.2, streetFood: 0.15 },
  street: { streetFood: 0.45, business: 0.25, friction: 0.2, tourism: 0.1 },
  creator: { tourism: 0.35, business: 0.3, work: 0.2, friction: 0.15 },
  sports: { work: 0.4, friction: 0.25, business: 0.2, tourism: 0.15 },
} as const satisfies Record<string, CompareWeights>

export const COMPARE_OBJECTIVES: Record<CompareObjectiveId, CompareObjectiveDefinition> = {
  tourism: {
    id: 'tourism',
    categoryId: 'leisure',
    label: 'Tourisme',
    shortLabel: 'Tourisme',
    description: 'Comparer les destinations pour séjours courts et loisirs.',
    scoringRationale:
      'Le classement privilégie le visa tourisme, la fluidité des démarches (friction) et un filet études/business secondaire.',
    weights: { ...W.tourism },
    kpiColumns: ['visa_tourism', 'friction_tier', 'visa_study', 'visa_business', 'education'],
    winBlurb: 'meilleure combinaison pour un séjour touristique selon nos scores agrégés.',
  },
  events: {
    id: 'events',
    categoryId: 'leisure',
    label: 'Événements',
    shortLabel: 'Événements',
    description: 'Salons, festivals, conférences — mobilité courte et logistique.',
    scoringRationale:
      'Les événements combinent accès visiteur (tourisme), aspects pro (business) et friction RDV / visa.',
    weights: { ...W.events },
    kpiColumns: ['visa_tourism', 'visa_business', 'friction_tier', 'visa_work', 'education'],
    winBlurb: 'ressort comme la option la plus équilibrée pour allers-retours et démarches liées aux événements.',
  },
  work: {
    id: 'work',
    categoryId: 'work',
    label: 'Travail (salarié / CDI / mission)',
    shortLabel: 'Travail',
    description: 'Emploi régulier à l’étranger : visa travail et friction administrative.',
    scoringRationale:
      'Le score travail domine, complété par business (contrats), friction et un peu d’études (reconversion).',
    weights: { ...W.work },
    kpiColumns: ['visa_work', 'friction_tier', 'visa_business', 'visa_study', 'education'],
    winBlurb: 'affiche le meilleur profil visa travail / employabilité dans votre sélection.',
  },
  sports_pro: {
    id: 'sports_pro',
    categoryId: 'work',
    label: 'Sportif·ve professionnel·le',
    shortLabel: 'Sport pro',
    description: 'Contrats, visas de performance, sponsors et déplacements.',
    scoringRationale:
      'Orienté visa travail et faible friction (délais), avec visibilité business et tourisme pour déplacements.',
    weights: { ...W.sports },
    kpiColumns: ['visa_work', 'friction_tier', 'visa_business', 'visa_tourism', 'education'],
    winBlurb: 'ressort comme la destination la plus favorable pour une mobilité sportive professionnelle.',
  },
  studies_bachelor: {
    id: 'studies_bachelor',
    categoryId: 'education',
    label: 'Licence / Bachelor',
    shortLabel: 'Licence',
    description: 'Premier cycle universitaire et accès visa étudiant.',
    scoringRationale:
      'Licence : poids fort sur visa études, panier mobilité éducative et friction (RDV, dossiers).',
    weights: { ...W.study, study: 0.5, education: 0.22 },
    kpiColumns: ['visa_study', 'education', 'friction_tier', 'visa_tourism', 'lang_access'],
    winBlurb: 'est la meilleure option licence dans votre sélection (études + parcours).',
  },
  studies_master: {
    id: 'studies_master',
    categoryId: 'education',
    label: 'Master',
    shortLabel: 'Master',
    description: 'Second cycle, spécialisation et alternance possible.',
    scoringRationale:
      'Master : visa études et écosystème formation, avec friction et ouverture pro (work/business).',
    weights: { study: 0.42, education: 0.28, friction: 0.18, work: 0.12 },
    kpiColumns: ['visa_study', 'education', 'visa_work', 'friction_tier', 'phd'],
    winBlurb: 'domine pour un parcours master (scores études + environnement).',
  },
  studies_phd: {
    id: 'studies_phd',
    categoryId: 'education',
    label: 'Doctorat (PhD)',
    shortLabel: 'PhD',
    description: 'Recherche doctorale — données structurées PhD sur la fiche quand disponibles.',
    scoringRationale:
      'Le PhD valorise la présence de données doctorales sur la fiche, le visa études et la mobilité éducative.',
    weights: { ...W.studyPhd },
    kpiColumns: ['phd', 'visa_study', 'education', 'friction_tier', 'visa_work'],
    winBlurb: 'est le plus aligné avec un projet doctoral (données + visa études).',
  },
  training_short_technical: {
    id: 'training_short_technical',
    categoryId: 'education',
    label: 'Formation technique courte',
    shortLabel: 'Tech court',
    description: 'Bootcamps, certificats courts, upskilling technique.',
    scoringRationale:
      'Les formations courtes pèsent sur le module « short courses » dans les données et le visa études.',
    weights: { ...W.shortTech },
    kpiColumns: ['short_access', 'visa_study', 'friction_tier', 'visa_work', 'education'],
    winBlurb: 'ressort mieux pour une formation courte technique.',
  },
  training_long_technical: {
    id: 'training_long_technical',
    categoryId: 'education',
    label: 'Formation technique longue',
    shortLabel: 'Tech long',
    description: 'BTS équivalent, écoles techniques, parcours longs hors université.',
    scoringRationale:
      'Priorité au module formation technique longue dans les données, visa études et friction.',
    weights: { ...W.longTech },
    kpiColumns: ['tech_access', 'visa_study', 'education', 'friction_tier', 'visa_work'],
    winBlurb: 'convient le mieux à une formation technique longue.',
  },
  language_training: {
    id: 'language_training',
    categoryId: 'education',
    label: 'Cours de langue',
    shortLabel: 'Langue',
    description: 'Séjours linguistiques et écoles de langue.',
    scoringRationale:
      'Le module langue des données et le visa études pilotent le classement.',
    weights: { ...W.language },
    kpiColumns: ['lang_access', 'visa_study', 'friction_tier', 'visa_tourism', 'education'],
    winBlurb: 'est la meilleure option pour un séjour linguistique structuré.',
  },
  business: {
    id: 'business',
    categoryId: 'business',
    label: 'Business & déplacements pro',
    shortLabel: 'Business',
    description: 'Réunions, négociations, prospection commerciale.',
    scoringRationale:
      'Visa affaires et friction dominent, avec travail et tourisme en soutien.',
    weights: { ...W.business },
    kpiColumns: ['visa_business', 'friction_tier', 'visa_work', 'visa_tourism', 'education'],
    winBlurb: 'offre le meilleur compromis affaires / démarches dans votre liste.',
  },
  investment: {
    id: 'investment',
    categoryId: 'business',
    label: 'Investissement',
    shortLabel: 'Investissement',
    description: 'Capital, immobilier, résidence par investissement (indicateurs agrégés).',
    scoringRationale:
      'Combine visa business, environnement pro et signaux « opportunité » dans les données.',
    weights: { ...W.invest },
    kpiColumns: ['visa_business', 'visa_work', 'friction_tier', 'street', 'education'],
    winBlurb: 'ressort comme la piste la plus cohérente pour un angle investissement.',
  },
  startup: {
    id: 'startup',
    categoryId: 'business',
    label: 'Startup & innovation',
    shortLabel: 'Startup',
    description: 'Lancement de projet, incubateurs, visas entrepreneurs (proxy scores).',
    scoringRationale:
      'Business + travail + friction : proxy pour écosystème et faisabilité administrative.',
    weights: { ...W.startup },
    kpiColumns: ['visa_business', 'visa_work', 'friction_tier', 'street', 'education'],
    winBlurb: 'domine pour un profil startup dans cette sélection.',
  },
  street_food_small_business: {
    id: 'street_food_small_business',
    categoryId: 'business',
    label: 'Petite entreprise / street food',
    shortLabel: 'Street food',
    description: 'Micro-activité, restauration légère, commerce de proximité.',
    scoringRationale:
      'Utilise le bloc street_food des données, visa business et friction.',
    weights: { ...W.street },
    kpiColumns: ['street', 'visa_business', 'friction_tier', 'visa_work', 'visa_tourism'],
    winBlurb: 'affiche le meilleur potentiel « petite structure / terrain » selon nos indicateurs.',
  },
  creator_content: {
    id: 'creator_content',
    categoryId: 'media_sport',
    label: 'Créateur·rice (YouTube, influence, blog)',
    shortLabel: 'Création contenu',
    description: 'Tournages, sponsoring, visas courts et activité indépendante.',
    scoringRationale:
      'Mélange tourisme (déplacements), business (partenariats) et travail (statuts hybrides) — proxy sectoriel.',
    weights: { ...W.creator },
    kpiColumns: ['visa_tourism', 'visa_business', 'visa_work', 'friction_tier', 'education'],
    winBlurb: 'est la destination la plus praticable pour création de contenu / tournées.',
  },
}

export const DEFAULT_COMPARE_OBJECTIVE_ID: CompareObjectiveId = 'tourism'

export function listObjectivesForCategory(categoryId: CompareCategoryId): CompareObjectiveDefinition[] {
  return (Object.values(COMPARE_OBJECTIVES) as CompareObjectiveDefinition[]).filter(
    (o) => o.categoryId === categoryId,
  )
}

export function getObjectiveDefinition(id: string | null | undefined): CompareObjectiveDefinition {
  if (id && id in COMPARE_OBJECTIVES) {
    return COMPARE_OBJECTIVES[id as CompareObjectiveId]
  }
  return COMPARE_OBJECTIVES[DEFAULT_COMPARE_OBJECTIVE_ID]
}

export function objectiveWeightedScore(c: EnrichedCountryApi, def: CompareObjectiveDefinition): number {
  const signals = extractCompareSignals(c)
  let num = 0
  let den = 0
  for (const [k, w] of Object.entries(def.weights) as [CompareSignalId, number][]) {
    if (w > 0) {
      num += (signals[k] ?? 0) * w
      den += w
    }
  }
  if (den <= 0) return c._finalScore
  return Math.max(0, Math.min(100, Math.round(num / den)))
}

const KPI_META: Record<CompareKpiColumnKey, { header: string; tooltip: string }> = {
  visa_tourism: {
    header: 'Visa tourisme',
    tooltip: 'Score 0–100 dérivé du profil tourisme (comme l’Explorer).',
  },
  visa_study: { header: 'Visa études', tooltip: 'Indicatif études / formations longues.' },
  visa_work: { header: 'Visa travail', tooltip: 'Indicatif emploi salarié / missions.' },
  visa_business: { header: 'Visa affaires', tooltip: 'Indicatif déplacements professionnels.' },
  friction_tier: {
    header: 'Friction RDV',
    tooltip: 'Facilité perçue des rendez-vous et délais (tiers Low / Medium / High).',
  },
  study_tier: { header: 'Niveau études', tooltip: 'Tranche mobilité études (carte pays).' },
  business_tier: { header: 'Niveau business', tooltip: 'Tranche mobilité affaires.' },
  education: {
    header: 'Mobilité éducative',
    tooltip: 'Synthèse des modules langue / technique / cours courts dans les données.',
  },
  phd: {
    header: 'Données PhD',
    tooltip: 'Présence de contenu structuré doctorat sur la fiche pays.',
  },
  short_access: {
    header: 'Form. courte',
    tooltip: 'Qualité d’accès indiquée pour les formations courtes (données pays).',
  },
  tech_access: {
    header: 'Form. technique',
    tooltip: 'Accès aux parcours techniques longs (données pays).',
  },
  lang_access: {
    header: 'Cours de langue',
    tooltip: 'Accès séjours linguistiques (données pays).',
  },
  street: {
    header: 'Street food / micro',
    tooltip: 'Indicateur « opportunity » street food dans les données.',
  },
}

function formatStreetOpportunity(c: EnrichedCountryApi): string {
  const sf = c._full?.street_food as Record<string, unknown> | undefined
  if (!sf) return '—'
  const op = sf.opportunity
  return typeof op === 'string' && op.trim() ? op : '—'
}

function formatModuleAccess(
  c: EnrichedCountryApi,
  key: 'short_courses' | 'technical_training' | 'language_study',
): string {
  const edu = c._full?.education_mobility as Record<string, unknown> | undefined
  const mod = edu?.[key] as Record<string, unknown> | undefined
  if (!mod) return '—'
  const a = mod.access
  return typeof a === 'string' && a.trim() ? a : '—'
}

export function formatKpiValue(key: CompareKpiColumnKey, c: EnrichedCountryApi): string {
  switch (key) {
    case 'visa_tourism':
      return String(c._visa.tourism)
    case 'visa_study':
      return String(c._visa.study)
    case 'visa_work':
      return String(c._visa.work)
    case 'visa_business':
      return String(c._visa.business)
    case 'friction_tier':
      return frictionTierFromCountry(c._difficultyLabel, c._full?.friction_score)
    case 'study_tier':
      return scoreToMobilityTier(c._visa.study)
    case 'business_tier':
      return scoreToMobilityTier(c._visa.business)
    case 'education':
      return String(c._education)
    case 'phd':
      return hasCountryPhdStoredData(c._full) ? 'Oui' : '—'
    case 'short_access':
      return formatModuleAccess(c, 'short_courses')
    case 'tech_access':
      return formatModuleAccess(c, 'technical_training')
    case 'lang_access':
      return formatModuleAccess(c, 'language_study')
    case 'street':
      return formatStreetOpportunity(c)
    default:
      return '—'
  }
}

export function buildKpiCells(
  c: EnrichedCountryApi,
  columns: CompareKpiColumnKey[],
): Array<{ key: CompareKpiColumnKey; header: string; tooltip: string; value: string }> {
  return columns.map((key) => ({
    key,
    header: KPI_META[key].header,
    tooltip: KPI_META[key].tooltip,
    value: formatKpiValue(key, c),
  }))
}

export function pickSuggestedCountryIds(
  enriched: EnrichedCountryApi[],
  def: CompareObjectiveDefinition,
  max = 4,
): number[] {
  const sorted = [...enriched].sort((a, b) => objectiveWeightedScore(b, def) - objectiveWeightedScore(a, def))
  return sorted.slice(0, max).map((c) => c.id)
}

export function recommendationForWinner(winnerName: string, def: CompareObjectiveDefinition): string {
  return `${winnerName} ${def.winBlurb}`
}
