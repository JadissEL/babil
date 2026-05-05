export type DelegatedCategory = 'job' | 'university'

export type DelegatedPackage = {
  id: string
  category: DelegatedCategory
  name: string
  tierLabel: string
  priceMad: number
  tagline: string
  /** Comparaison transparence */
  delivers: string[]
  applicationsScope: string
  turnaroundNote: string
  /** Tier 2 souvent mis en avant */
  recommended?: boolean
}

export const DELEGATED_APPLICATION_PAYLOAD_SCHEMA_VERSION = 1

export const APPLICATION_GUARANTEE_TITLE = 'Garantie résultats — remboursement partiel'

export const APPLICATION_GUARANTEE_SUMMARY =
  'Si aucun résultat tangible n’est obtenu dans le périmètre défini dans votre bon de commande (aucune mise en relation exploitable ou aucune candidature réellement déposée selon les engagements du forfait), nous remboursons **50 %** du montant acquitté, sous conditions générales transmises à validation.'

export const APPLICATION_GUARANTEE_MICRO =
  '50 % remboursés en l’absence de résultats éligibles dans le cadre contractuel — voir conditions sur la page de commande.'

export const JOB_PACKAGES: DelegatedPackage[] = [
  {
    id: 'job-start',
    category: 'job',
    name: 'Forfait Déclic',
    tierLabel: 'Essentiel',
    priceMad: 2490,
    tagline: 'CV ciblé, lettres de motivation et candidatures guidées pour lancer votre recherche.',
    delivers: [
      'Optimisation ATS du CV (version FR/EN au choix)',
      'Jusqu’à 5 lettres personnalisées',
      'Accompagnement pour ~15 candidatures (guides + relecture)',
      'Checklist entretien express',
    ],
    applicationsScope: '≈15 cibles',
    turnaroundNote: 'Livraison matériels en 5–7 jours ouvrés',
  },
  {
    id: 'job-pro',
    category: 'job',
    name: 'Forfait Momentum',
    tierLabel: 'Acceleration',
    priceMad: 4990,
    recommended: true,
    tagline: 'Volume élargi, messages recruteurs et préparation dossier consolidé.',
    delivers: [
      'Tout le périmètre Déclic + variantes LinkedIn/email recruteur',
      'Jusqu’à 10 lettres + messages courts multi-secteurs',
      'Accompagnement pour ~30 candidatures suivies',
      'Feuilles de préparation questions entretien (FR/EN)',
    ],
    applicationsScope: '≈30 candidatures suivies',
    turnaroundNote: 'Calendrier serré négociable selon objectifs',
  },
  {
    id: 'job-elite',
    category: 'job',
    name: 'Forfait Exécution',
    tierLabel: 'Clé en main',
    priceMad: 8990,
    tagline: 'Nous préparons, déposons et relançons en votre nom (dans les limites contractuelles).',
    delivers: [
      'Stratégie cible pays / secteurs + priorisation RH',
      'Lettres illimitées sur la fenêtre définie',
      'Soumissions terrain et relances hebdomadaires',
      'Reporting hebdomadaire + ajustements de script',
    ],
    applicationsScope: 'Volume élargi + relances incluses',
    turnaroundNote: 'Équipe dédiée jusqu’à 8 semaines (renouvelable)',
  },
]

export const UNIVERSITY_PACKAGES: DelegatedPackage[] = [
  {
    id: 'uni-portal',
    category: 'university',
    name: 'Forfait Ciblage',
    tierLabel: 'Focal',
    priceMad: 2990,
    tagline: 'Dossier académique homogène pour jusqu’à 3 programmes équivalents.',
    delivers: [
      'Synthèse parcours + projet d’études cohérent',
      '3 lettres de motivation différenciées par établissement',
      'Tableau deadlines + liste documents',
      'Relecture collégiale niveau admissions',
    ],
    applicationsScope: '3 programmes',
    turnaroundNote: '10–12 jours ouvrés après collecte dossier',
  },
  {
    id: 'uni-campaign',
    category: 'university',
    name: 'Forfait Campagne',
    tierLabel: 'Multi-campus',
    priceMad: 5490,
    recommended: true,
    tagline: 'Couverture géographique large avec harmonisation et priorisation stratégiques.',
    delivers: [
      'Tout le périmètre Ciblage élargi à 8 programmes',
      'Scénarios bac + master avec variantes géographiques',
      'Accompagnement tests langue et CV académique',
      'Modèles mails référents / recommandations (guidage)',
    ],
    applicationsScope: '8 programmes',
    turnaroundNote: 'Prévoir 15–18 jours pour la première salve complète',
  },
  {
    id: 'uni-concierge',
    category: 'university',
    name: 'Forfait White-glove',
    tierLabel: 'Orchestration complète',
    priceMad: 9900,
    tagline: 'Stratégie, dépôt, suivis décisionnels et coordination avec vos référents.',
    delivers: [
      'Stratégie multi-pistes + arbres de décision par pays',
      'Portails en ligne ou pièges administratifs gérés pour vous',
      'Relances et dialogue avec services admissions (cadre légal)',
      'Rapports bi-hebdomadaires jusqu’acceptation définitive (fenêtre contractualisée)',
    ],
    applicationsScope: 'Multi-pistes illimitées (périmètre contractualisé)',
    turnaroundNote: 'Accompagnement jusqu’à 12 semaines (extensions possibles)',
  },
]

export function packagesForCategory(category: DelegatedCategory): DelegatedPackage[] {
  return category === 'job' ? JOB_PACKAGES : UNIVERSITY_PACKAGES
}

export function findDelegatedPackage(category: DelegatedCategory, packageId: string): DelegatedPackage | null {
  return packagesForCategory(category).find((p) => p.id === packageId) ?? null
}

export function formatPriceMad(price: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(price) + ' MAD'
}
