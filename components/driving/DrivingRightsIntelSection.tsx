'use client'

import React, { useMemo, useState } from 'react'
import {
  AlertTriangle,
  BookOpen,
  Car,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Globe2,
  Info,
  Scale,
  Shield,
  Timer,
} from 'lucide-react'
import Link from 'next/link'

import type { DrivingRightsIntelV1 } from '@/lib/driving-rights-intel'
import {
  conversionRequirementLabelFr,
  deriveDrivingRightsVisual,
  visualLabelFr,
} from '@/lib/driving-rights-intel'

function certaintyBadgeFr(c: string) {
  switch (c) {
    case 'verified':
      return { label: 'Vérifié', className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800' }
    case 'official_summary':
      return { label: 'Source officielle (synthèse)', className: 'border-primary/40 bg-primary-soft text-primary' }
    case 'estimated':
      return { label: 'Estimation', className: 'border-amber-500/40 bg-amber-500/10 text-amber-900' }
    default:
      return { label: 'Incertain', className: 'border-line bg-inset text-muted' }
  }
}

function VisualBadge({ intel }: { intel: DrivingRightsIntelV1 }) {
  const v = deriveDrivingRightsVisual(intel)
  const label = visualLabelFr(v)
  const styles: Record<string, string> = {
    allowed: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-900',
    allowed_idp: 'border-sky-500/40 bg-sky-500/10 text-sky-900',
    partial: 'border-amber-500/40 bg-amber-500/10 text-amber-900',
    conversion: 'border-violet-500/40 bg-violet-500/10 text-violet-900',
    prohibited: 'border-red-500/40 bg-red-500/10 text-red-900',
    uncertain: 'border-line bg-inset text-muted',
  }
  return (
    <span
      className={`inline-flex items-center rounded-lg border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${styles[v] || styles.uncertain}`}
    >
      {label}
    </span>
  )
}

function TriStateLine({ label, value }: { label: string; value: boolean | null }) {
  const text =
    value === true ? 'Oui' : value === false ? 'Non' : 'À confirmer'
  const tone =
    value === true ? 'text-success' : value === false ? 'text-danger' : 'text-muted'
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="font-bold text-muted">{label}</span>
      <span className={`font-black ${tone}`}>{text}</span>
    </div>
  )
}

function DurationTimeline({ intel }: { intel: DrivingRightsIntelV1 }) {
  const d = intel.durations
  const rows = [
    { k: 'Tourisme / visiteur', v: d.tourist },
    { k: 'Étudiant', v: d.student },
    { k: 'Travail', v: d.worker },
    { k: 'Résidence temporaire', v: d.temporaryResident },
    { k: 'Résidence permanente', v: d.permanentResident },
  ].filter((r) => r.v && String(r.v).trim())
  if (rows.length === 0) return null
  return (
    <div className="space-y-3">
      <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted">
        <Timer className="h-3.5 w-3.5" /> Durées d&apos;usage (indicatif)
      </h4>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.k} className="flex gap-3 rounded-xl border border-line bg-inset px-3 py-2">
            <div className="w-1 shrink-0 rounded-full bg-primary/50" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted">{r.k}</div>
              <p className="mt-0.5 text-sm font-bold text-text">{r.v}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DrivingRightsIntelSection({
  countryName,
  countryId,
  intel,
  variant = 'full',
}: {
  countryName: string
  countryId?: string | number
  intel: DrivingRightsIntelV1
  variant?: 'full' | 'compact'
}) {
  const [openResidency, setOpenResidency] = useState(false)
  const [openConversion, setOpenConversion] = useState(false)
  const [openPractical, setOpenPractical] = useState(false)

  const certainty = useMemo(() => certaintyBadgeFr(intel.meta.dataCertainty), [intel.meta.dataCertainty])

  const residencyHighlight = intel.residencyRules[0]

  if (variant === 'compact') {
    const v = deriveDrivingRightsVisual(intel)
    return (
      <div className="flex min-h-0 flex-1 flex-col space-y-4 px-8 pb-6 pt-2">
        <p className="text-sm font-medium leading-relaxed text-muted">{intel.simpleSummaryFr}</p>
        <div className="flex flex-wrap gap-2">
          <VisualBadge intel={intel} />
          <span
            className={`rounded-lg border px-2 py-1 text-[9px] font-black uppercase tracking-widest ${certainty.className}`}
          >
            {certainty.label}
          </span>
        </div>
        <TriStateLine label="Permis MA reconnu" value={intel.eligibility.moroccanLicenseRecognized} />
        <TriStateLine label="IDP requis" value={intel.eligibility.idpRequired} />
        <TriStateLine label="Conversion possible" value={intel.conversion.possible} />
        {intel.practical.legacyRestrictions && v !== 'allowed' ? (
          <div className="flex gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-xs font-bold text-danger">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {intel.practical.legacyRestrictions}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <section className="space-y-6 rounded-[2rem] border border-line bg-surface p-8 shadow-card">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary ring-1 ring-primary/35">
            <Car className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-text">Permis de conduire — titulaires marocains</h2>
            <p className="mt-1 text-sm font-medium text-muted">
              Règles structurées pour le permis délivré au Maroc dans <span className="font-black text-text">{countryName}</span>.
              Les administrations peuvent modifier la réglementation : vérifiez toujours les sources officielles listées ci-dessous.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <VisualBadge intel={intel} />
          <span className={`rounded-lg border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${certainty.className}`}>
            {certainty.label}
          </span>
          {intel.meta.regulatoryChangeRisk === 'high' ? (
            <span className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-900">
              Réglementation volatile
            </span>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-primary/25 bg-primary-soft/60 p-5">
        <div className="flex gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm font-bold leading-relaxed text-text">{intel.simpleSummaryFr}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-2xl border border-line bg-inset p-5">
          <h3 className="flex items-center gap-2 text-sm font-black text-text">
            <Scale className="h-4 w-4 text-primary" /> Éligibilité & IDP
          </h3>
          <TriStateLine label="Reconnaissance permis marocain" value={intel.eligibility.moroccanLicenseRecognized} />
          <TriStateLine label="IDP requis / attendu" value={intel.eligibility.idpRequired} />
          <TriStateLine label="Accord bilatéral (MA)" value={intel.eligibility.bilateralAgreementWithMorocco?.exists ?? null} />
          <TriStateLine label="Permis numérique accepté" value={intel.eligibility.digitalLicenseAccepted ?? null} />
          {intel.eligibility.idpConventionNote ? (
            <p className="text-xs font-medium text-muted">{intel.eligibility.idpConventionNote}</p>
          ) : null}
          {intel.eligibility.arabicFrenchTranslation?.details ? (
            <p className="text-xs font-medium text-muted">
              <span className="font-black text-text">Traduction : </span>
              {intel.eligibility.arabicFrenchTranslation.details}
            </p>
          ) : null}
        </div>

        <div className="space-y-4 rounded-2xl border border-line bg-inset p-5">
          <h3 className="flex items-center gap-2 text-sm font-black text-text">
            <Globe2 className="h-4 w-4 text-primary" /> Statut & résidence
          </h3>
          <p className="text-xs font-bold text-muted">
            Les droits varient selon visa, titre de séjour et durée. Aperçu pour votre profil :{' '}
            <span className="font-black text-text">{residencyHighlight?.labelFr ?? '—'}</span>
          </p>
          <button
            type="button"
            onClick={() => setOpenResidency(!openResidency)}
            className="flex w-full items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-left text-sm font-black text-text transition-colors hover:border-primary/40"
          >
            Voir toutes les situations (tourisme, études, travail, résidence…)
            {openResidency ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {openResidency ? (
            <ul className="space-y-3">
              {intel.residencyRules.map((r) => (
                <li key={r.category} className="rounded-xl border border-line bg-surface p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-primary">{r.labelFr}</div>
                  <p className="mt-2 text-sm font-bold text-text">{r.moroccanLicenseOnly}</p>
                  {r.withIdp ? <p className="mt-1 text-xs font-medium text-muted">+ IDP : {r.withIdp}</p> : null}
                  {r.conversionOrExchange ? (
                    <p className="mt-1 text-xs font-medium text-muted">Conversion : {r.conversionOrExchange}</p>
                  ) : null}
                  <div className="mt-2 text-[10px] font-black uppercase text-muted">Fiabilité : {r.certainty}</div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <DurationTimeline intel={intel} />

      <div className="rounded-2xl border border-line bg-inset p-5">
        <button
          type="button"
          onClick={() => setOpenConversion(!openConversion)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <h3 className="flex items-center gap-2 text-sm font-black text-text">
            <BookOpen className="h-4 w-4 text-primary" /> Conversion / échange de permis
          </h3>
          {openConversion ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
        </button>
        {openConversion ? (
          <div className="mt-4 space-y-3 border-t border-line pt-4">
            <TriStateLine label="Conversion possible" value={intel.conversion.possible} />
            {intel.conversion.summary ? (
              <p className="text-sm font-medium leading-relaxed text-muted">{intel.conversion.summary}</p>
            ) : null}
            {intel.conversion.requirements.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {intel.conversion.requirements.map((req) => (
                  <span
                    key={req}
                    className="rounded-lg border border-line bg-surface px-2 py-1 text-[10px] font-black uppercase tracking-widest text-text"
                  >
                    {conversionRequirementLabelFr(req)}
                  </span>
                ))}
              </div>
            ) : null}
            {intel.conversion.deadlineNotes ? (
              <p className="text-xs font-bold text-amber-900">
                <span className="font-black">Délais : </span>
                {intel.conversion.deadlineNotes}
              </p>
            ) : null}
            {intel.conversion.feesSummary ? (
              <p className="text-xs font-medium text-muted">
                <span className="font-black text-text">Frais (indicatif) : </span>
                {intel.conversion.feesSummary}
              </p>
            ) : null}
            {intel.conversion.documents && intel.conversion.documents.length > 0 ? (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted">Documents</p>
                <ul className="mt-1 list-inside list-disc text-sm font-medium text-muted">
                  {intel.conversion.documents.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {intel.conversion.steps && intel.conversion.steps.length > 0 ? (
              <ol className="list-decimal space-y-1 pl-5 text-sm font-medium text-muted">
                {intel.conversion.steps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            ) : null}
            {intel.conversion.procedureNotes ? (
              <p className="text-xs font-medium text-muted">{intel.conversion.procedureNotes}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-line bg-inset p-5">
        <button
          type="button"
          onClick={() => setOpenPractical(!openPractical)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <h3 className="flex items-center gap-2 text-sm font-black text-text">
            <Shield className="h-4 w-4 text-primary" /> Pratique : assurance, location, contrôles
          </h3>
          {openPractical ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
        </button>
        {openPractical ? (
          <div className="mt-4 space-y-3 border-t border-line pt-4 text-sm font-medium text-muted">
            {intel.practical.insuranceNotes ? <p>{intel.practical.insuranceNotes}</p> : null}
            {intel.practical.rentalNotes ? <p>{intel.practical.rentalNotes}</p> : null}
            {intel.practical.minimumAge != null ? (
              <p>
                <span className="font-black text-text">Âge minimum : </span>
                {intel.practical.minimumAge} ans
              </p>
            ) : null}
            {intel.practical.noviceRestrictions ? (
              <p>
                <span className="font-black text-text">Jeunes conducteurs : </span>
                {intel.practical.noviceRestrictions}
              </p>
            ) : null}
            {intel.practical.enforcementLevel ? (
              <p>
                <span className="font-black text-text">Strictesse des contrôles : </span>
                {intel.practical.enforcementLevel}
              </p>
            ) : null}
            {intel.practical.policeChecks ? <p>{intel.practical.policeChecks}</p> : null}
            {intel.practical.regionalVariations && intel.practical.regionalVariations.length > 0 ? (
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted">Variantes régionales</p>
                <ul className="mt-2 space-y-2">
                  {intel.practical.regionalVariations.map((rv) => (
                    <li key={rv.region} className="rounded-lg border border-line bg-surface px-3 py-2 text-xs">
                      <span className="font-black text-text">{rv.region}</span> — {rv.note}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-dashed border-line bg-inset/80 p-5">
        <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted">
          <ClipboardList className="h-3.5 w-3.5" /> Sources & version
        </h4>
        {intel.meta.lastReviewedAt ? (
          <p className="mt-2 text-xs font-bold text-text">Dernière revue données : {intel.meta.lastReviewedAt}</p>
        ) : (
          <p className="mt-2 text-xs font-medium text-muted">Date de revue non renseignée — priorité aux sources officielles locales.</p>
        )}
        <p className="mt-1 text-xs font-medium text-muted">
          Nationalité cible : {intel.meta.holderNationalities.join(', ')} · Schéma v{intel.meta.schemaVersion}
        </p>
        {intel.meta.sources.length > 0 ? (
          <ul className="mt-3 space-y-1">
            {intel.meta.sources.map((s, i) => (
              <li key={i} className="text-xs font-medium text-primary">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noreferrer" className="underline">
                    {s.label}
                  </a>
                ) : (
                  s.label
                )}
                {s.retrievedAt ? <span className="text-muted"> — {s.retrievedAt}</span> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs italic text-muted">
            Aucune source URL enregistrée pour ce pays — les équipes peuvent enrichir via le contrat données / agent.
          </p>
        )}
      </div>

      {countryId != null ? (
        <div className="flex justify-end">
          <Link
            href={`/permis?compare=${countryId}`}
            className="text-xs font-black uppercase tracking-widest text-primary underline"
          >
            Comparer avec un autre pays
          </Link>
        </div>
      ) : null}
    </section>
  )
}

export { VisualBadge }
