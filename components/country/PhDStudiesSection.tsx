import type { ReactNode } from 'react'
import Link from 'next/link'
import { GraduationCap } from 'lucide-react'
import type { PhdStudiesModel } from '@/lib/country-phd-studies'

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line/80 pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <span className="shrink-0 text-xs font-black uppercase tracking-widest text-muted">{label}</span>
      <p className="text-sm font-bold leading-relaxed text-text sm:max-w-[75%] sm:text-right">{value}</p>
    </div>
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
    <div className="space-y-3">
      <h3 className="text-[11px] font-black uppercase tracking-widest text-primary">{eyebrow}</h3>
      <div className="rounded-3xl border border-line bg-[#f8f2e8] p-5 shadow-soft">{children}</div>
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

export function PhDStudiesSection({ countryName, model }: { countryName: string; model: PhdStudiesModel }) {
  const { enrichment, confidenceFr } = statusPills(model.meta)
  const hasLinks = model.meta.officialLinks.length > 0

  return (
    <section className="rounded-[2.5rem] border border-line bg-surface p-8 shadow-card" aria-labelledby="phd-studies-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-primary/15 p-3 text-primary ring-1 ring-primary/25">
            <GraduationCap className="h-7 w-7" aria-hidden />
          </div>
          <div>
            <h2 id="phd-studies-heading" className="text-xl font-black tracking-tight text-text">
              {model.overview.headline}
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-muted">{model.overview.executiveSummary}</p>
            <p className="mt-3 rounded-2xl border border-primary/20 bg-primary-soft px-4 py-3 text-sm font-bold text-text">
              {model.overview.profileFitMorocco}
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-2">
          <span className="rounded-xl border border-line bg-[#f8f2e8] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-text">
            {enrichment}
          </span>
          <span className="rounded-xl border border-line bg-[#f8f2e8] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted">
            {confidenceFr}
          </span>
          {model.meta.lastUpdated ? (
            <span className="rounded-xl border border-line bg-[#f8f2e8] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted">
              Mis à jour {model.meta.lastUpdated}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Block eyebrow={`Admissions & dossier (${countryName})`}>
          <div className="space-y-3">
            <Row label="Prérequis & équivalences" value={model.admissions.entryRequirementsAndPriorDegrees} />
            <Row label="Langue" value={model.admissions.languageRequirements} />
            <Row label="Diplômes marocains" value={model.admissions.recognitionMoroccanCredentials} />
            <Row label="Sélection" value={model.admissions.selectionProcess} />
            <Row label="Compétitivité" value={model.admissions.competitiveness} />
          </div>
        </Block>

        <Block eyebrow="Programme doctoral">
          <div className="space-y-3">
            <Row label="Durée / format" value={model.programStructure.durationAndFormat} />
            <Row label="Cours vs recherche" value={model.programStructure.courseworkVersusResearch} />
            <Row label="Encadrement & jalons" value={model.programStructure.supervisionReviewsProgress} />
            <Row label="Soutenance & évaluation" value={model.programStructure.thesisDefensePublication} />
          </div>
        </Block>

        <Block eyebrow="Séjour légal & titre doctoral">
          <div className="space-y-3">
            <Row label="Voie principale études" value={model.visaImmigration.principalStudyRoute} />
            <Row label="Renouvellements / changements de statut" value={model.visaImmigration.renewalsStatusChanges} />
            <Row label="Travail autorisé (doctorant)" value={model.visaImmigration.workRightsDuringPhd} />
            <Row label="Famille" value={model.visaImmigration.familyDependents} />
            <Row label="Après le diplôme" value={model.visaImmigration.postStudyLegalPathways} />
          </div>
        </Block>

        <Block eyebrow="Financement">
          <Row label="Synthèse" value={model.funding.overview} />
          <ul className="mb-4 list-inside list-disc space-y-1 text-sm font-bold text-text marker:text-primary">
            {model.funding.fundingSources.map((src, i) => (
              <li key={i}>{src}</li>
            ))}
          </ul>
          <div className="space-y-3">
            <Row label="Frais & scolarité" value={model.funding.tuitionFeesRange} />
            <Row label="Coût de la vie (ordre)" value={model.funding.livingCosts} />
            <Row label="Bourses internationales" value={model.funding.scholarshipsInternational} />
            <Row label="Emploi doctoral" value={model.funding.employmentAsDoctoralCandidate} />
          </div>
        </Block>

        <Block eyebrow="Débouchés">
          <div className="space-y-3">
            <Row label="Piste universitaire / post-docs" value={model.careerOutcomes.academia} />
            <Row label="Hors-académie" value={model.careerOutcomes.industryPublicSector} />
            <Row label="Reconnaissance au Maroc" value={model.careerOutcomes.degreeRecognitionMorocco} />
          </div>
        </Block>

        <Block eyebrow="Pratique & installation">
          <div className="space-y-3">
            <Row label="Logement" value={model.practicalRelocation.housing} />
            <Row label="Assurance santé" value={model.practicalRelocation.healthInsurance} />
            <Row label="Banque / admin / fiscalité" value={model.practicalRelocation.bankingAdminTaxOrientation} />
          </div>
        </Block>

        <Block eyebrow="Écosystème recherche">
          <div className="space-y-3">
            <Row label="Forces discipline" value={model.researchEcosystem.strengthsClusters} />
            <Row label="Langues réelles dans les labos" value={model.researchEcosystem.languageOfInstructionReality} />
          </div>
        </Block>

        <Block eyebrow="Risques & cohérence consulaire">
          <Row label="Lien embassy / friction" value={model.risksFriction.appointmentEmbassyConsistency} />
          <div className="mt-4 rounded-2xl border border-[#f3afaf]/50 bg-[#fff0f0]/80 p-4">
            <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-danger">Points tension</p>
            <ul className="space-y-2">
              {model.risksFriction.frictionPoints.map((pt, i) => (
                <li key={i} className="text-sm font-bold text-danger">
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        </Block>
      </div>

      {hasLinks ? (
        <div className="mt-8 rounded-3xl border border-line bg-[#f8f2e8] p-5">
          <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-muted">Sources officielles</p>
          <ul className="flex flex-col gap-2">
            {model.meta.officialLinks.map((lnk, idx) => (
              <li key={`${lnk.url}-${idx}`}>
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
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <p className="text-xs font-medium text-muted">Données normalisées (comparabilité pays) — champ JSON&nbsp;</p>
        <code className="rounded-lg bg-[#f8f2e8] px-2 py-1 text-[11px] font-bold text-text">full_data.phd_studies</code>
        <Link
          href="/education"
          className="ml-auto rounded-xl border border-line bg-[#f8f2e8] px-4 py-2 text-xs font-black uppercase tracking-widest text-text transition-colors hover:border-primary/35 hover:bg-primary-soft"
        >
          Mobilité étudiante
        </Link>
      </div>
    </section>
  )
}
