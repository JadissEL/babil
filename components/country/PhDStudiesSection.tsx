import { AlertTriangle, GraduationCap, XCircle } from 'lucide-react'
import Link from 'next/link'
import type { PhdStudiesModel } from '@/lib/country-phd-studies'
import type { ReactNode } from 'react'

/** Outer shell; inner scroll avoids long JSON/text blowing card width on small screens. */
const PHD_OUTER =
  'min-w-0 overflow-hidden rounded-2xl border border-line bg-inset'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 w-full flex-col gap-2 border-b border-line pb-4 last:border-0 last:pb-0 md:flex-row md:items-start md:gap-x-6">
      <div className="shrink-0 text-sm font-bold leading-snug text-muted md:w-52 lg:w-56">{label}</div>
      <p className="min-w-0 w-full break-words text-left text-sm font-black leading-relaxed text-text md:flex-1 md:basis-0">
        {value}
      </p>
    </div>
  )
}

function PhdPanelBody({ children }: { children: ReactNode }) {
  return (
    <div className={`${PHD_OUTER} w-full min-w-0`}>
      {/* Mobile: grow with content (no inner squeeze). Desktop: cap height + scroll for very long panels. */}
      <div className="w-full min-w-0 p-5 sm:p-6 lg:max-h-[min(40rem,72vh)] lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-y-contain">
        {children}
      </div>
    </div>
  )
}

function MicroHeading({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return (
    <p
      className={
        accent
          ? 'text-xs font-black uppercase tracking-widest text-primary'
          : 'text-xs font-black uppercase tracking-widest text-muted'
      }
    >
      {children}
    </p>
  )
}

function Block({
  eyebrow,
  children,
}: {
  eyebrow: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-0 min-w-0 w-full flex-col gap-4">
      <MicroHeading accent>{eyebrow}</MicroHeading>
      <PhdPanelBody>{children}</PhdPanelBody>
    </div>
  )
}

function statusPills(meta: PhdStudiesModel['meta']) {
  const enrichment =
    meta.enrichmentStatus === 'verified'
      ? 'Vérifié'
      : meta.enrichmentStatus === 'partial'
        ? 'Partiel'
        : 'Squelette'
  const confidenceFr =
    meta.confidence === 'high' ? 'Confiance forte' : meta.confidence === 'medium' ? 'Confiance moyenne' : 'Confiance faible'
  return { enrichment, confidenceFr }
}

export function PhDStudiesSection({
  countryName,
  model,
  variant = 'embedded',
  countryDetailHref,
}: {
  countryName: string
  model: PhdStudiesModel
  /** Page dédiée : pied de section avec lien retour fiche + libellé adapté. */
  variant?: 'embedded' | 'standalone'
  /** Ex. `/countries/12` — affiché en mode standalone. */
  countryDetailHref?: string
}) {
  const { enrichment, confidenceFr } = statusPills(model.meta)
  const hasLinks = model.meta.officialLinks.length > 0

  const metaPill =
    'rounded-xl border border-line bg-inset px-3 py-1.5 text-[10px] font-black uppercase tracking-widest'

  return (
    <section
      className="min-w-0 rounded-[2.5rem] border border-line bg-surface p-8 shadow-card"
      aria-labelledby="phd-studies-heading"
    >
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <h2
            id="phd-studies-heading"
            className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xl font-black tracking-tight text-text"
          >
            <GraduationCap className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            {model.overview.headline}
          </h2>
          <p className="mt-4 max-w-3xl break-words text-sm font-medium leading-relaxed text-muted">
            {model.overview.executiveSummary}
          </p>
          <p className="mt-4 break-words rounded-2xl border border-primary/20 bg-primary-soft px-4 py-3 text-sm font-bold leading-relaxed text-text">
            {model.overview.profileFitMorocco}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
          <span className={`${metaPill} text-text`}>{enrichment}</span>
          <span className={`${metaPill} text-muted`}>{confidenceFr}</span>
          {model.meta.lastUpdated ? (
            <span className={`${metaPill} text-muted`}>Mis à jour {model.meta.lastUpdated}</span>
          ) : null}
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
        <Block eyebrow={`Admissions & dossier (${countryName})`}>
          <div className="min-w-0 space-y-0">
            <Row label="Prérequis & équivalences" value={model.admissions.entryRequirementsAndPriorDegrees} />
            <Row label="Langue" value={model.admissions.languageRequirements} />
            <Row label="Diplômes marocains" value={model.admissions.recognitionMoroccanCredentials} />
            <Row label="Sélection" value={model.admissions.selectionProcess} />
            <Row label="Compétitivité" value={model.admissions.competitiveness} />
          </div>
        </Block>

        <Block eyebrow="Programme doctoral">
          <div className="min-w-0 space-y-0">
            <Row label="Durée / format" value={model.programStructure.durationAndFormat} />
            <Row label="Cours vs recherche" value={model.programStructure.courseworkVersusResearch} />
            <Row label="Encadrement & jalons" value={model.programStructure.supervisionReviewsProgress} />
            <Row label="Soutenance & évaluation" value={model.programStructure.thesisDefensePublication} />
          </div>
        </Block>

        <Block eyebrow="Séjour légal & titre doctoral">
          <div className="min-w-0 space-y-0">
            <Row label="Voie principale études" value={model.visaImmigration.principalStudyRoute} />
            <Row label="Renouvellements / changements de statut" value={model.visaImmigration.renewalsStatusChanges} />
            <Row label="Travail autorisé (doctorant)" value={model.visaImmigration.workRightsDuringPhd} />
            <Row label="Famille" value={model.visaImmigration.familyDependents} />
            <Row label="Après le diplôme" value={model.visaImmigration.postStudyLegalPathways} />
          </div>
        </Block>

        <Block eyebrow="Financement">
          <div className="min-w-0 space-y-0">
            <Row label="Synthèse" value={model.funding.overview} />
            {model.funding.fundingSources.length > 0 ? (
              <div className="min-w-0 border-t border-line pt-4">
                <MicroHeading>Sources principales</MicroHeading>
                <ul className="mt-3 list-inside list-disc space-y-2 pl-0.5 text-sm font-bold leading-relaxed text-text marker:text-primary">
                  {model.funding.fundingSources.map((src, i) => (
                    <li key={i} className="break-words">
                      {src}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="min-w-0 space-y-0 border-t border-line pt-4">
              <Row label="Frais & scolarité" value={model.funding.tuitionFeesRange} />
              <Row label="Coût de la vie (ordre)" value={model.funding.livingCosts} />
              <Row label="Bourses internationales" value={model.funding.scholarshipsInternational} />
              <Row label="Emploi doctoral" value={model.funding.employmentAsDoctoralCandidate} />
            </div>
          </div>
        </Block>

        <Block eyebrow="Débouchés">
          <div className="min-w-0 space-y-0">
            <Row label="Piste universitaire / post-docs" value={model.careerOutcomes.academia} />
            <Row label="Hors-académie" value={model.careerOutcomes.industryPublicSector} />
            <Row label="Reconnaissance au Maroc" value={model.careerOutcomes.degreeRecognitionMorocco} />
          </div>
        </Block>

        <Block eyebrow="Pratique & installation">
          <div className="min-w-0 space-y-0">
            <Row label="Logement" value={model.practicalRelocation.housing} />
            <Row label="Assurance santé" value={model.practicalRelocation.healthInsurance} />
            <Row label="Banque / admin / fiscalité" value={model.practicalRelocation.bankingAdminTaxOrientation} />
          </div>
        </Block>

        <Block eyebrow="Écosystème recherche">
          <div className="min-w-0 space-y-0">
            <Row label="Forces discipline" value={model.researchEcosystem.strengthsClusters} />
            <Row label="Langues réelles dans les labos" value={model.researchEcosystem.languageOfInstructionReality} />
          </div>
        </Block>

        <Block eyebrow="Risques & cohérence consulaire">
          <div className="min-w-0 space-y-0">
            <Row label="Lien ambassade / friction" value={model.risksFriction.appointmentEmbassyConsistency} />
            {model.risksFriction.frictionPoints.length > 0 ? (
              <div className="mt-4 min-w-0 rounded-3xl border border-[#f3afaf] bg-[#fff0f0] p-6">
                <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-danger">
                  <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden /> Points tension
                </h4>
                <ul className="space-y-3">
                  {model.risksFriction.frictionPoints.map((pt, i) => (
                    <li key={i} className="flex min-w-0 gap-2 text-sm font-bold leading-relaxed text-danger">
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      <span className="min-w-0 break-words">{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </Block>
      </div>

      {hasLinks ? (
        <div className="mt-10 min-w-0">
          <div className={`${PHD_OUTER} w-full min-w-0`}>
            <div className="min-w-0 w-full p-5 sm:p-6 lg:max-h-[min(26rem,50vh)] lg:overflow-y-auto lg:overflow-x-hidden lg:overscroll-y-contain">
              <MicroHeading>Sources officielles</MicroHeading>
              <ul className="mt-4 flex flex-col gap-2">
                {model.meta.officialLinks.map((lnk, idx) => (
                  <li key={`${lnk.url}-${idx}`} className="min-w-0 break-words">
                    <a
                      href={lnk.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-black text-primary underline decoration-primary/35 underline-offset-4 hover:text-primary-hover"
                    >
                      {lnk.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
        <p className="text-xs font-medium text-muted">
          {variant === 'standalone'
            ? 'Structuré pour comparaison entre pays — source JSON normalisée'
            : 'Données normalisées (comparabilité pays) — champ JSON'}
          &nbsp;
        </p>
        <code className="rounded-lg border border-line bg-inset px-2 py-1 font-mono text-[11px] font-bold text-text">
          full_data.phd_studies
        </code>
        <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
          {variant === 'standalone' && countryDetailHref ? (
            <Link
              href={countryDetailHref}
              className="inline-flex w-fit items-center justify-center rounded-xl border border-line bg-inset px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text transition-colors hover:border-primary/35 hover:bg-primary-soft"
            >
              Fiche pays
            </Link>
          ) : null}
          <Link
            href="/education"
            className="inline-flex w-fit items-center justify-center rounded-xl border border-line bg-inset px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text transition-colors hover:border-primary/35 hover:bg-primary-soft"
          >
            Mobilité étudiante
          </Link>
        </div>
      </div>
    </section>
  )
}
