/**
 * Structured international driving-rights intelligence for Moroccan license holders.
 * Stored under full_data.driving_rights (v1). Legacy full_data.driving_license is merged at read time.
 */

export const DRIVING_RIGHTS_SCHEMA_VERSION = 1 as const

export type DrivingDataCertainty = 'verified' | 'official_summary' | 'estimated' | 'unknown'

export type ResidencyDrivingCategory =
  | 'tourist'
  | 'student'
  | 'worker'
  | 'temporary_resident'
  | 'permanent_resident'
  | 'refugee_asylum'

export type DrivingRightsVisual =
  | 'allowed'
  | 'allowed_idp'
  | 'partial'
  | 'conversion'
  | 'prohibited'
  | 'uncertain'

export type DrivingRightsSourceRef = {
  label: string
  url?: string
  retrievedAt?: string
}

export type DrivingRightsMeta = {
  schemaVersion: typeof DRIVING_RIGHTS_SCHEMA_VERSION
  /** ISO 3166-1 alpha-2; default Morocco for this product */
  holderNationalities: string[]
  lastReviewedAt?: string
  dataCertainty: DrivingDataCertainty
  regulatoryChangeRisk?: 'low' | 'medium' | 'high'
  sources: DrivingRightsSourceRef[]
}

export type DrivingEligibilityBlock = {
  moroccanLicenseRecognized: boolean | null
  idpRequired: boolean | null
  idpConventionNote?: string
  arabicFrenchTranslation?: {
    required: boolean | null
    details?: string
  }
  bilateralAgreementWithMorocco?: {
    exists: boolean | null
    summary?: string
  }
  digitalLicenseAccepted?: boolean | null
}

export type ResidencyDrivingRule = {
  category: ResidencyDrivingCategory
  labelFr: string
  /** Short rule: duration or "non autorisé" etc. */
  moroccanLicenseOnly: string
  withIdp?: string
  conversionOrExchange?: string
  certainty: DrivingDataCertainty
}

export type ConversionRequirement =
  | 'direct_exchange'
  | 'theory_exam'
  | 'practical_exam'
  | 'medical_test'
  | 'probation'
  | 'mandatory_school'
  | 'translation_legalization'
  | 'other'

export type DrivingConversionPathway = {
  possible: boolean | null
  summary?: string
  requirements: ConversionRequirement[]
  steps?: string[]
  deadlineNotes?: string
  feesSummary?: string
  documents?: string[]
  procedureNotes?: string
}

export type DrivingPracticalIntel = {
  insuranceNotes?: string
  rentalNotes?: string
  minimumAge?: number | null
  noviceRestrictions?: string
  enforcementLevel?: 'low' | 'medium' | 'high' | 'unknown'
  policeChecks?: string
  regionalVariations?: Array<{ region: string; note: string }>
  legacyRestrictions?: string
}

export type DrivingDurationsBlock = {
  tourist?: string
  student?: string
  worker?: string
  temporaryResident?: string
  permanentResident?: string
}

export type DrivingRightsIntelV1 = {
  meta: DrivingRightsMeta
  eligibility: DrivingEligibilityBlock
  durations: DrivingDurationsBlock
  residencyRules: ResidencyDrivingRule[]
  conversion: DrivingConversionPathway
  practical: DrivingPracticalIntel
  /** Plain-language summary for Moroccan users */
  simpleSummaryFr: string
}

const RESIDENCY_LABELS: Record<ResidencyDrivingCategory, string> = {
  tourist: 'Visiteur / tourisme',
  student: 'Étudiant',
  worker: 'Travail / salarié',
  temporary_resident: 'Résidence temporaire',
  permanent_resident: 'Résidence permanente',
  refugee_asylum: 'Protection internationale (réfugié / asile)',
}

function isPlainRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function str(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined
  const t = v.trim()
  return t ? t : undefined
}

function boolOrNull(v: unknown): boolean | null {
  if (typeof v === 'boolean') return v
  if (v === null || v === undefined) return null
  return null
}

function parseInternationalRequired(legacy: Record<string, unknown>): boolean | null {
  const v = legacy.international_required
  if (typeof v === 'boolean') return v
  const s = str(v)?.toLowerCase()
  if (s === 'true' || s === 'yes' || s === 'oui') return true
  if (s === 'false' || s === 'no' || s === 'non') return false
  return null
}

function parseConversionPossible(legacy: Record<string, unknown>): boolean | null {
  const v = legacy.conversion_possible
  if (typeof v === 'boolean') return v
  return null
}

function statusToRecognition(statusRaw: string | undefined): {
  recognized: boolean | null
  visualHint: DrivingRightsVisual
} {
  const s = (statusRaw || '').toLowerCase()
  if (!s || s.includes('vérifier') || s.includes('verify') || s.includes('unknown'))
    return { recognized: null, visualHint: 'uncertain' }
  if (s.includes('non reconnu') || s.includes('not recognized') || s.includes('interdit'))
    return { recognized: false, visualHint: 'prohibited' }
  if (s.includes('conversion') || s.includes('exchange required'))
    return { recognized: null, visualHint: 'conversion' }
  if (s.includes('valide') || s.includes('valid') || s.includes('reconnu') || s.includes('recognized'))
    return { recognized: true, visualHint: 'allowed' }
  return { recognized: null, visualHint: 'partial' }
}

function defaultResidencyRows(
  durationText: string | undefined,
  idp: boolean | null,
  conv: boolean | null,
  certainty: DrivingDataCertainty,
): ResidencyDrivingRule[] {
  const baseNote =
    durationText ||
    'Durée et conditions exactes dépendent du statut d’immigration local — vérifier auprès du ministère des transports ou de la préfecture.'
  const idpLine =
    idp === true
      ? 'Permis international (IDP) généralement requis ou fortement recommandé pour une couverture assurantielle et les contrôles.'
      : idp === false
        ? 'Selon destination, l’IDP peut ne pas être obligatoire ; confirmer auprès des autorités.'
        : 'Statut IDP à confirmer (Convention de Genève / Vienne selon le pays).'
  const convLine =
    conv === true
      ? 'Après installation, une conversion ou un nouvel examen peut être exigé selon la durée du séjour.'
      : conv === false
        ? 'Conversion souvent impossible ou très limitée ; prévoir permis local si séjour long.'
        : 'Règles de conversion à confirmer sur place.'

  return (Object.keys(RESIDENCY_LABELS) as ResidencyDrivingCategory[]).map((category) => ({
    category,
    labelFr: RESIDENCY_LABELS[category],
    moroccanLicenseOnly:
      category === 'tourist'
        ? baseNote
        : category === 'student' || category === 'worker'
          ? `${baseNote} Les règles peuvent différer d’un visa étudiant / travailleur.`
          : `${baseNote} Souvent aligné sur la résidence et la durée légale de séjour.`,
    withIdp: idpLine,
    conversionOrExchange: convLine,
    certainty,
  }))
}

function parseStoredDrivingRightsPatch(raw: Record<string, unknown>, base: DrivingRightsIntelV1): DrivingRightsIntelV1 {
  const metaIn = raw.meta
  if (!isPlainRecord(metaIn) || metaIn.schemaVersion !== 1) return base

  const eligIn = isPlainRecord(raw.eligibility) ? raw.eligibility : {}
  const durIn = isPlainRecord(raw.durations) ? raw.durations : {}
  const convIn = isPlainRecord(raw.conversion) ? raw.conversion : {}
  const pracIn = isPlainRecord(raw.practical) ? raw.practical : {}
  const rulesIn = Array.isArray(raw.residencyRules) ? raw.residencyRules : null

  const sourcesIn = Array.isArray(metaIn.sources) ? (metaIn.sources as DrivingRightsSourceRef[]) : base.meta.sources

  return {
    ...base,
    meta: {
      schemaVersion: DRIVING_RIGHTS_SCHEMA_VERSION,
      holderNationalities:
        Array.isArray(metaIn.holderNationalities) && metaIn.holderNationalities.length > 0
          ? (metaIn.holderNationalities as string[])
          : base.meta.holderNationalities,
      lastReviewedAt: str(metaIn.lastReviewedAt) ?? base.meta.lastReviewedAt,
      dataCertainty: (metaIn.dataCertainty as DrivingDataCertainty) || base.meta.dataCertainty,
      regulatoryChangeRisk: (metaIn.regulatoryChangeRisk as DrivingRightsMeta['regulatoryChangeRisk']) ??
        base.meta.regulatoryChangeRisk,
      sources: sourcesIn,
    },
    eligibility: {
      ...base.eligibility,
      moroccanLicenseRecognized: boolOrNull(eligIn.moroccanLicenseRecognized) ?? base.eligibility.moroccanLicenseRecognized,
      idpRequired: boolOrNull(eligIn.idpRequired) ?? base.eligibility.idpRequired,
      idpConventionNote: str(eligIn.idpConventionNote) ?? base.eligibility.idpConventionNote,
      arabicFrenchTranslation: isPlainRecord(eligIn.arabicFrenchTranslation)
        ? {
            required: boolOrNull(eligIn.arabicFrenchTranslation.required) ?? base.eligibility.arabicFrenchTranslation?.required ?? null,
            details: str(eligIn.arabicFrenchTranslation.details) ?? base.eligibility.arabicFrenchTranslation?.details,
          }
        : base.eligibility.arabicFrenchTranslation,
      bilateralAgreementWithMorocco: isPlainRecord(eligIn.bilateralAgreementWithMorocco)
        ? {
            exists: boolOrNull(eligIn.bilateralAgreementWithMorocco.exists) ?? base.eligibility.bilateralAgreementWithMorocco?.exists ?? null,
            summary: str(eligIn.bilateralAgreementWithMorocco.summary) ?? base.eligibility.bilateralAgreementWithMorocco?.summary,
          }
        : base.eligibility.bilateralAgreementWithMorocco,
      digitalLicenseAccepted: boolOrNull(eligIn.digitalLicenseAccepted) ?? base.eligibility.digitalLicenseAccepted,
    },
    durations: {
      ...base.durations,
      tourist: str(durIn.tourist) ?? base.durations.tourist,
      student: str(durIn.student) ?? base.durations.student,
      worker: str(durIn.worker) ?? base.durations.worker,
      temporaryResident: str(durIn.temporaryResident) ?? base.durations.temporaryResident,
      permanentResident: str(durIn.permanentResident) ?? base.durations.permanentResident,
    },
    residencyRules:
      rulesIn && rulesIn.length > 0
        ? (rulesIn as ResidencyDrivingRule[]).filter((r) => r && typeof r.category === 'string')
        : base.residencyRules,
    conversion: {
      ...base.conversion,
      possible: boolOrNull(convIn.possible) ?? base.conversion.possible,
      summary: str(convIn.summary) ?? base.conversion.summary,
      requirements: Array.isArray(convIn.requirements)
        ? (convIn.requirements as ConversionRequirement[])
        : base.conversion.requirements,
      steps: Array.isArray(convIn.steps) ? (convIn.steps as string[]).map(String) : base.conversion.steps,
      deadlineNotes: str(convIn.deadlineNotes) ?? base.conversion.deadlineNotes,
      feesSummary: str(convIn.feesSummary) ?? base.conversion.feesSummary,
      documents: Array.isArray(convIn.documents) ? (convIn.documents as string[]).map(String) : base.conversion.documents,
      procedureNotes: str(convIn.procedureNotes) ?? base.conversion.procedureNotes,
    },
    practical: {
      ...base.practical,
      insuranceNotes: str(pracIn.insuranceNotes) ?? base.practical.insuranceNotes,
      rentalNotes: str(pracIn.rentalNotes) ?? base.practical.rentalNotes,
      minimumAge: typeof pracIn.minimumAge === 'number' && Number.isFinite(pracIn.minimumAge) ? pracIn.minimumAge : base.practical.minimumAge,
      noviceRestrictions: str(pracIn.noviceRestrictions) ?? base.practical.noviceRestrictions,
      enforcementLevel: (pracIn.enforcementLevel as DrivingPracticalIntel['enforcementLevel']) ?? base.practical.enforcementLevel,
      policeChecks: str(pracIn.policeChecks) ?? base.practical.policeChecks,
      regionalVariations: Array.isArray(pracIn.regionalVariations)
        ? (pracIn.regionalVariations as Array<{ region: string; note: string }>)
        : base.practical.regionalVariations,
      legacyRestrictions: str(pracIn.legacyRestrictions) ?? base.practical.legacyRestrictions,
    },
    simpleSummaryFr: str(raw.simpleSummaryFr) ?? base.simpleSummaryFr,
  }
}

export function drivingRightsFromLegacy(legacy: Record<string, unknown>): DrivingRightsIntelV1 {
  const status = str(legacy.status)
  const { recognized } = statusToRecognition(status)
  const idp = parseInternationalRequired(legacy)
  const convPossible = parseConversionPossible(legacy)
  const duration = str(legacy.duration)
  const conditions = str(legacy.conditions)
  const conversionDetails = str(legacy.conversion_details) || str(legacy.conversion_process)
  const restrictions = str(legacy.restrictions)
  const cost = str(legacy.cost)

  const certainty: DrivingDataCertainty =
    status?.toLowerCase().includes('vérifier') || !status ? 'unknown' : 'estimated'

  const simpleSummaryFr = [
    `Permis marocain : ${recognized === true ? 'souvent reconnu pour des séjours courts' : recognized === false ? 'non reconnu ou très limité selon les sources disponibles' : 'reconnaissance à confirmer auprès des autorités locales'}.`,
    idp === true ? 'Un permis de conduire international (IDP) est indiqué comme requis ou recommandé.' : idp === false ? 'Aucune exigence IDP explicite dans les données actuelles.' : 'Exigence d’IDP non renseignée de façon fiable.',
    convPossible === true
      ? 'Une conversion ou un échange de permis peut être possible.'
      : convPossible === false
        ? 'Conversion non indiquée comme possible dans les données actuelles.'
        : 'Conversion : statut inconnu.',
    conditions ? `Conditions générales : ${conditions}` : '',
    restrictions ? `Restrictions / mises en garde : ${restrictions}` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const requirements: ConversionRequirement[] = []
  const detailLower = (conversionDetails || '').toLowerCase()
  if (detailLower.includes('direct') || detailLower.includes('échange') || detailLower.includes('exchange'))
    requirements.push('direct_exchange')
  if (detailLower.includes('théorie') || detailLower.includes('theory')) requirements.push('theory_exam')
  if (detailLower.includes('pratique') || detailLower.includes('practical')) requirements.push('practical_exam')
  if (detailLower.includes('médical') || detailLower.includes('medical')) requirements.push('medical_test')
  if (detailLower.includes('probation') || detailLower.includes('jeune conducteur')) requirements.push('probation')
  if (detailLower.includes('auto-école') || detailLower.includes('driving school')) requirements.push('mandatory_school')
  if (detailLower.includes('traduction') || detailLower.includes('légalis')) requirements.push('translation_legalization')
  if (requirements.length === 0 && conversionDetails) requirements.push('other')

  return {
    meta: {
      schemaVersion: DRIVING_RIGHTS_SCHEMA_VERSION,
      holderNationalities: ['MA'],
      dataCertainty: certainty,
      regulatoryChangeRisk: certainty === 'unknown' ? 'high' : 'medium',
      sources: [],
    },
    eligibility: {
      moroccanLicenseRecognized: recognized,
      idpRequired: idp,
      idpConventionNote:
        idp === true
          ? 'Vérifier si le pays applique la Convention de Genève (1949) et/ou de Vienne (1968) pour l’IDP.'
          : undefined,
      arabicFrenchTranslation: {
        required: null,
        details:
          'Les permis en arabe ou français peuvent exiger une traduction assermentée ou une légalisation selon le pays.',
      },
      bilateralAgreementWithMorocco: { exists: null, summary: undefined },
      digitalLicenseAccepted: null,
    },
    durations: {
      tourist: duration,
      student: undefined,
      worker: undefined,
      temporaryResident: undefined,
      permanentResident: undefined,
    },
    residencyRules: defaultResidencyRows(duration, idp, convPossible, certainty),
    conversion: {
      possible: convPossible,
      summary: conversionDetails,
      requirements,
      steps: conversionDetails ? [conversionDetails] : [],
      feesSummary: cost,
      documents: [],
      procedureNotes: 'Consulter le site du ministère des transports / préfecture du pays et, pour le Maroc, les circulaires en vigueur.',
    },
    practical: {
      legacyRestrictions: restrictions,
      enforcementLevel: 'unknown',
      insuranceNotes:
        'Les assureurs et loueurs exigent souvent un permis valide + IDP selon destination ; lire le contrat de location.',
      rentalNotes:
        'Les agences de location appliquent souvent des règles plus strictes que le droit national (âge minimum, ancienneté du permis).',
      minimumAge: null,
      noviceRestrictions: undefined,
      policeChecks: undefined,
      regionalVariations: [],
    },
    simpleSummaryFr,
  }
}

/**
 * Resolved driving rights for UI: merges full_data.driving_rights v1 patch over legacy driving_license.
 */
export function materializeDrivingRightsIntel(fullData: unknown): DrivingRightsIntelV1 {
  const full = isPlainRecord(fullData) ? fullData : {}
  const legacy = isPlainRecord(full.driving_license) ? (full.driving_license as Record<string, unknown>) : {}
  const base = drivingRightsFromLegacy(legacy)
  const dr = full.driving_rights
  if (!isPlainRecord(dr)) return base
  return parseStoredDrivingRightsPatch(dr, base)
}

/** Persist recomputed v1 intel on `full_data` (merges legacy `driving_license` + optional `driving_rights` patch). */
export function syncDrivingRightsIntelIntoFullData(fullData: Record<string, unknown>): Record<string, unknown> {
  return {
    ...fullData,
    driving_rights: materializeDrivingRightsIntel(fullData),
  }
}

export function deriveDrivingRightsVisual(intel: DrivingRightsIntelV1): DrivingRightsVisual {
  const e = intel.eligibility
  if (e.moroccanLicenseRecognized === false) return 'prohibited'
  if (intel.conversion.possible === true && e.moroccanLicenseRecognized !== true) return 'conversion'
  if (e.moroccanLicenseRecognized === true && e.idpRequired === true) return 'allowed_idp'
  if (e.moroccanLicenseRecognized === true && e.idpRequired === false) return 'allowed'
  if (e.idpRequired === true) return 'allowed_idp'
  if (intel.meta.dataCertainty === 'unknown') return 'uncertain'
  return 'partial'
}

export function visualLabelFr(v: DrivingRightsVisual): string {
  switch (v) {
    case 'allowed':
      return 'Conduite possible'
    case 'allowed_idp':
      return 'IDP requis / recommandé'
    case 'partial':
      return 'Partiel / à confirmer'
    case 'conversion':
      return 'Conversion / échange'
    case 'prohibited':
      return 'Non reconnu'
    case 'uncertain':
    default:
      return 'Données insuffisantes'
  }
}

export function residencyCategoryMatchesFilter(
  rule: ResidencyDrivingRule,
  filter: ResidencyDrivingCategory | 'all',
): boolean {
  if (filter === 'all') return true
  return rule.category === filter
}

export function conversionRequirementLabelFr(r: ConversionRequirement): string {
  const m: Record<ConversionRequirement, string> = {
    direct_exchange: 'Échange direct',
    theory_exam: 'Examen théorique',
    practical_exam: 'Examen pratique',
    medical_test: 'Visite médicale',
    probation: 'Période probatoire',
    mandatory_school: 'Formation / auto-école obligatoire',
    translation_legalization: 'Traduction / légalisation',
    other: 'Autre exigence',
  }
  return m[r] || r
}

/** Inject structured driving_rights into a country JSON object before DB seed (idempotent). */
export function enrichCountryRecordWithDrivingRights(country: Record<string, unknown>): Record<string, unknown> {
  const full = { ...country }
  const dr = full.driving_rights
  if (isPlainRecord(dr) && isPlainRecord(dr.meta) && dr.meta.schemaVersion === 1) {
    return full
  }
  const legacy = isPlainRecord(full.driving_license) ? (full.driving_license as Record<string, unknown>) : {}
  return { ...full, driving_rights: drivingRightsFromLegacy(legacy) }
}
