/**
 * Canonical, comparable PhD/decision-oriented payload stored under Country.full_data.phd_studies.
 * Missing fields resolve to placeholders so every country exposes the same structure (scraping/agent-ready).
 */

export type PhdConfidence = 'low' | 'medium' | 'high'
export type PhdEnrichmentStatus = 'placeholder' | 'partial' | 'verified'

export type PhdOfficialLink = {
  label: string
  url: string
}

/** Nested shape mirrors JSON stored / produced by ingestion pipelines */
export type PhdStudiesStored = {
  overview?: Partial<PhdStudiesModel['overview']>
  admissions?: Partial<PhdStudiesModel['admissions']>
  programStructure?: Partial<PhdStudiesModel['programStructure']>
  visaImmigration?: Partial<PhdStudiesModel['visaImmigration']>
  funding?: Partial<PhdStudiesModel['funding']> & { fundingSources?: string[] }
  careerOutcomes?: Partial<PhdStudiesModel['careerOutcomes']>
  practicalRelocation?: Partial<PhdStudiesModel['practicalRelocation']>
  researchEcosystem?: Partial<PhdStudiesModel['researchEcosystem']>
  risksFriction?: Partial<PhdStudiesModel['risksFriction']> & { frictionPoints?: string[] }
  meta?: Partial<PhdStudiesModel['meta']> & { officialLinks?: PhdOfficialLink[] }
}

export type PhdStudiesModel = {
  overview: {
    headline: string
    executiveSummary: string
    profileFitMorocco: string
  }
  admissions: {
    entryRequirementsAndPriorDegrees: string
    languageRequirements: string
    recognitionMoroccanCredentials: string
    selectionProcess: string
    competitiveness: string
  }
  programStructure: {
    durationAndFormat: string
    courseworkVersusResearch: string
    supervisionReviewsProgress: string
    thesisDefensePublication: string
  }
  visaImmigration: {
    principalStudyRoute: string
    renewalsStatusChanges: string
    workRightsDuringPhd: string
    familyDependents: string
    postStudyLegalPathways: string
  }
  funding: {
    overview: string
    fundingSources: string[]
    tuitionFeesRange: string
    livingCosts: string
    scholarshipsInternational: string
    employmentAsDoctoralCandidate: string
  }
  careerOutcomes: {
    academia: string
    industryPublicSector: string
    degreeRecognitionMorocco: string
  }
  practicalRelocation: {
    housing: string
    healthInsurance: string
    bankingAdminTaxOrientation: string
  }
  researchEcosystem: {
    strengthsClusters: string
    languageOfInstructionReality: string
  }
  risksFriction: {
    frictionPoints: string[]
    appointmentEmbassyConsistency: string
  }
  meta: {
    officialLinks: PhdOfficialLink[]
    confidence: PhdConfidence
    enrichmentStatus: PhdEnrichmentStatus
    lastUpdated: string | null
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v)
}

function pickStr(v: unknown, fallback: string): string {
  if (typeof v === 'string' && v.trim()) return v.trim()
  return fallback
}

function pickStrArray(v: unknown, fallback: string[]): string[] {
  if (!Array.isArray(v)) return fallback
  const out = v.map((x) => String(x).trim()).filter(Boolean)
  return out.length ? out : fallback
}

function pickLinks(v: unknown, fallback: PhdOfficialLink[]): PhdOfficialLink[] {
  if (!Array.isArray(v)) return fallback
  const out: PhdOfficialLink[] = []
  v.forEach((item) => {
    if (!isRecord(item)) return
    const label = pickStr(item.label, '')
    const url = pickStr(item.url, '')
    if (label && url) out.push({ label, url })
  })
  return out.length ? out : fallback
}

function defaultMeta(): PhdStudiesModel['meta'] {
  return {
    officialLinks: [],
    confidence: 'low',
    enrichmentStatus: 'placeholder',
    lastUpdated: null,
  }
}

export function defaultPhdStudies(countryName: string): PhdStudiesModel {
  const baseInsight =
    "Structure indicative : à confirmer auprès des universités et des autorités migratoires. Les profils marocains doivent croiser visa d'études, reconnaissance des diplômes et financement avant engagement."
  return {
    overview: {
      headline: `Doctorat (PhD) — ${countryName}`,
      executiveSummary: baseInsight,
      profileFitMorocco:
        "Évalue le doctorat sous l'angle visa étudiant/chercheur, coûts, délais administratifs et débouchés; croise avec votre discipline et vos preuves d'acceptation potentielle dans une équipe.",
    },
    admissions: {
      entryRequirementsAndPriorDegrees:
        "À préciser selon discipline : diplôme de master ou équivalence, dossier recherche/proposition de thèse, références. Vérifier l'équivalence du diplôme marocain dans le système destination.",
      languageRequirements:
        "Examen de langue académique et/ou maîtrise de la langue du terrain ; programmes internationaux en anglais possibles dans certains établissements.",
      recognitionMoroccanCredentials:
        'Reconnaissance / équivalence Décret ou procédures propres au pays ou à l’université (souvent par service des admissions ou NARIC).',
      selectionProcess:
        'Sélection au niveau école doctorale ou laboratoire : entretiens, présélection dossier, co-financement requis.',
      competitiveness: 'Variable selon champ et financing — à préciser avec les programmes ciblés.',
    },
    programStructure: {
      durationAndFormat:
        'Durée médiane souvent entre 3 et 6 ans selon système ; dépend contrat doctoral / bourses / emploi du temps recherche.',
      courseworkVersusResearch:
        'Mélange modules de recherche méthodologique versus recherche pure centré thèse — dépend École Doctorale.',
      supervisionReviewsProgress:
        'Comités de suivi annuels, rapports et validation des jalons avant soutenance selon réglement interne.',
      thesisDefensePublication:
        'Critères de rédaction, jury, défense publique et parfois exigences de publications — suivre Graduate School.',
    },
    visaImmigration: {
      principalStudyRoute:
        'Visa/permit pour études longues ou titre étudiant-chercheur ; dépend motif et durée prévue.',
      renewalsStatusChanges:
        'Extensions liées prolongation financée ; changements de titre possibles après validation académique.',
      workRightsDuringPhd:
        "Heures d'assistantat / hors campus selon titre et pays — impact sur équilibre financier.",
      familyDependents:
        "Accompagnement conjoint-enfants : règles de visa familial ou non, droits séjour séparés — à sécuriser avant départ.",
      postStudyLegalPathways:
        "Visa recherche-post-doc, titre salarié, ou retour selon passeport ; liens avec quotas et employeurs locales.",
    },
    funding: {
      overview:
        'Le financement prime la faisabilité : contrats doctoral, bourses États/third-party, autofinancement familial.',
      fundingSources: [
        'Bourses instit / ambassades',
        'Contrat doctoral Université-employeur',
        'Projets européens / labos (selon discipline)',
      ],
      tuitionFeesRange: 'À confirmer (public versus privé, EU/international fee bands).',
      livingCosts:
        'Loyer indexé au bassin ville / campus ; santé assurance obligatoire souvent cotisation étudiants.',
      scholarshipsInternational:
        'Vérifier appels nationaux réservés hors UE et délais très tôt avant rentrée académique.',
      employmentAsDoctoralCandidate:
        "Mission d'enseignement / projet ANR équivalent lorsque titre le permet.",
    },
    careerOutcomes: {
      academia: 'Post-docs, HDR / tenure track selon pays — mobilité académique internationale forte.',
      industryPublicSector: 'Innovation sectorielle ; accès parfois via réseaux labo/industriel.',
      degreeRecognitionMorocco:
        'Démarches équivalence ministère/compétences nationales pertinentes pour poursuite recherche locale ou fonction publique.',
    },
    practicalRelocation: {
      housing: 'Liste attente résidence uni vs marché locatif privatif — anticiper 2–6 mois.',
      healthInsurance:
        'Réglementation santé étudiante / privée obligatoire pour visa — facteur coûts récurrents.',
      bankingAdminTaxOrientation:
        'Numéros fiscaux, NIE/NIF équivalents, banque prépayée jusqu’ouverture compte local.',
    },
    researchEcosystem: {
      strengthsClusters:
        "Forces disciplinaires du pays ou de la région ciblée (ex. STEM, santé publique…) — construire projet cohérent avec laboratoires d'excellence affichés.",
      languageOfInstructionReality:
        'Décider tôt français/anglais/local — impact cours, intégration et encadrement.',
    },
    risksFriction: {
      frictionPoints: [
        "Délai de visa par rapport aux dates rentrée",
        'Exigences de fonds ou caution bancaire',
        'Blocage admissions si superviseur absent',
      ],
      appointmentEmbassyConsistency:
        'Croiser cette section avec l’audit rendez-vous et la friction consulaire de la même fiche pays.',
    },
    meta: defaultMeta(),
  }
}

function mergeStored(base: PhdStudiesModel, raw: unknown): PhdStudiesModel {
  if (!isRecord(raw)) return base

  const o = raw.overview && isRecord(raw.overview) ? raw.overview : {}
  const p = raw.programStructure && isRecord(raw.programStructure) ? raw.programStructure : {}
  const v = raw.visaImmigration && isRecord(raw.visaImmigration) ? raw.visaImmigration : {}
  const f = raw.funding && isRecord(raw.funding) ? raw.funding : {}
  const c = raw.careerOutcomes && isRecord(raw.careerOutcomes) ? raw.careerOutcomes : {}
  const pr = raw.practicalRelocation && isRecord(raw.practicalRelocation) ? raw.practicalRelocation : {}
  const re = raw.researchEcosystem && isRecord(raw.researchEcosystem) ? raw.researchEcosystem : {}
  const r = raw.risksFriction && isRecord(raw.risksFriction) ? raw.risksFriction : {}
  const m = raw.meta && isRecord(raw.meta) ? raw.meta : {}

  const metaLinks = pickLinks(m.officialLinks, base.meta.officialLinks)
  let enrichmentStatus = base.meta.enrichmentStatus
  if (m.enrichmentStatus === 'partial' || m.enrichmentStatus === 'verified' || m.enrichmentStatus === 'placeholder') {
    enrichmentStatus = m.enrichmentStatus
  }
  let confidence = base.meta.confidence
  if (m.confidence === 'low' || m.confidence === 'medium' || m.confidence === 'high') {
    confidence = m.confidence
  }
  const lastUpdated = typeof m.lastUpdated === 'string' && m.lastUpdated.trim() ? m.lastUpdated.trim() : base.meta.lastUpdated

  const admissionsRec = raw.admissions && isRecord(raw.admissions) ? raw.admissions : {}

  return {
    overview: {
      headline: pickStr(o.headline, base.overview.headline),
      executiveSummary: pickStr(
        o.executiveSummary ?? o.decisionFitScoreNote,
        base.overview.executiveSummary,
      ),
      profileFitMorocco: pickStr(
        o.profileFitMorocco ?? o.moroccanApplicantSummary,
        base.overview.profileFitMorocco,
      ),
    },
    admissions: {
      entryRequirementsAndPriorDegrees: pickStr(
        admissionsRec.entryRequirementsAndPriorDegrees ?? admissionsRec.typicalEntryRequirements,
        base.admissions.entryRequirementsAndPriorDegrees,
      ),
      languageRequirements: pickStr(admissionsRec.languageRequirements, base.admissions.languageRequirements),
      recognitionMoroccanCredentials: pickStr(admissionsRec.recognitionMoroccanCredentials, base.admissions.recognitionMoroccanCredentials),
      selectionProcess: pickStr(admissionsRec.selectionProcess, base.admissions.selectionProcess),
      competitiveness: pickStr(admissionsRec.competitiveness ?? admissionsRec.acceptanceCompetitiveness, base.admissions.competitiveness),
    },
    programStructure: {
      durationAndFormat: pickStr(
        p.durationAndFormat ?? p.typicalDurationYears,
        base.programStructure.durationAndFormat,
      ),
      courseworkVersusResearch: pickStr(p.courseworkVersusResearch, base.programStructure.courseworkVersusResearch),
      supervisionReviewsProgress: pickStr(
        p.supervisionReviewsProgress ?? p.supervisionModel,
        base.programStructure.supervisionReviewsProgress,
      ),
      thesisDefensePublication: pickStr(p.thesisDefensePublication, base.programStructure.thesisDefensePublication),
    },
    visaImmigration: {
      principalStudyRoute: pickStr(v.principalStudyRoute ?? v.primaryStudyRoute, base.visaImmigration.principalStudyRoute),
      renewalsStatusChanges: pickStr(
        v.renewalsStatusChanges ?? v.renewalAndExtensions,
        base.visaImmigration.renewalsStatusChanges,
      ),
      workRightsDuringPhd: pickStr(v.workRightsDuringPhd, base.visaImmigration.workRightsDuringPhd),
      familyDependents: pickStr(v.familyDependents ?? v.dependentFamily, base.visaImmigration.familyDependents),
      postStudyLegalPathways: pickStr(v.postStudyLegalPathways ?? v.pathToPostStudyStay, base.visaImmigration.postStudyLegalPathways),
    },
    funding: {
      overview: pickStr(f.overview ?? f.summary, base.funding.overview),
      fundingSources: pickStrArray(f.fundingSources, base.funding.fundingSources),
      tuitionFeesRange: pickStr(f.tuitionFeesRange ?? f.estimatedCostRange, base.funding.tuitionFeesRange),
      livingCosts: pickStr(f.livingCosts ?? f.livingCostsOrientation, base.funding.livingCosts),
      scholarshipsInternational: pickStr(
        f.scholarshipsInternational ?? f.scholarshipsForInternationals,
        base.funding.scholarshipsInternational,
      ),
      employmentAsDoctoralCandidate: pickStr(
        f.employmentAsDoctoralCandidate ?? f.paidPositions,
        base.funding.employmentAsDoctoralCandidate,
      ),
    },
    careerOutcomes: {
      academia: pickStr(c.academia ?? c.academicTrack, base.careerOutcomes.academia),
      industryPublicSector: pickStr(c.industryPublicSector ?? c.industryTrack, base.careerOutcomes.industryPublicSector),
      degreeRecognitionMorocco: pickStr(
        c.degreeRecognitionMorocco ?? c.recognitionOfDegreeHome,
        base.careerOutcomes.degreeRecognitionMorocco,
      ),
    },
    practicalRelocation: {
      housing: pickStr(pr.housing, base.practicalRelocation.housing),
      healthInsurance: pickStr(pr.healthInsurance, base.practicalRelocation.healthInsurance),
      bankingAdminTaxOrientation: pickStr(pr.bankingAdminTaxOrientation ?? pr.banksAndAdmin, base.practicalRelocation.bankingAdminTaxOrientation),
    },
    researchEcosystem: {
      strengthsClusters: pickStr(re.strengthsClusters ?? re.notableStrengths, base.researchEcosystem.strengthsClusters),
      languageOfInstructionReality: pickStr(
        re.languageOfInstructionReality ?? re.englishProgramsAvailability,
        base.researchEcosystem.languageOfInstructionReality,
      ),
    },
    risksFriction: {
      frictionPoints: pickStrArray(r.frictionPoints ?? r.knownPainPoints, base.risksFriction.frictionPoints),
      appointmentEmbassyConsistency: pickStr(
        r.appointmentEmbassyConsistency ?? r.appointmentOrEmbassyNotes,
        base.risksFriction.appointmentEmbassyConsistency,
      ),
    },
    meta: {
      officialLinks: metaLinks,
      confidence,
      enrichmentStatus,
      lastUpdated,
    },
  }
}

/** Build unified PhD intelligence view for UI and APIs — always same shape across countries */
export function buildPhdStudies(countryName: string, fullData: Record<string, unknown>): PhdStudiesModel {
  const base = defaultPhdStudies(countryName)
  return mergeStored(base, fullData.phd_studies)
}

/**
 * Indicateur canonique pour « contenu doctoral exploitable hors squelette générique ».
 * Vrai lorsque `full_data.phd_studies` est un objet avec au moins une clé (données persistées enrichies).
 *
 * Utilisations alignées : teaser pays, page `/countries/[id]/doctorat`, hub éducation,
 * enrich-country-api (bonus score), APIs recommendation / probability, compare-rows, admin health.
 */
export function hasCountryPhdStoredData(fullData: Record<string, unknown>): boolean {
  const phd = fullData.phd_studies
  if (phd === null || phd === undefined || typeof phd !== 'object' || Array.isArray(phd)) return false
  return Object.keys(phd as Record<string, unknown>).length > 0
}

/** Alias sémantique UI / routage — identique à {@link hasCountryPhdStoredData}. */
export const shouldShowCountryPhdContent = hasCountryPhdStoredData
