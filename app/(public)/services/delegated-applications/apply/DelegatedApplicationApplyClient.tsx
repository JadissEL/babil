'use client';

import { useUser } from '@clerk/nextjs';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  FolderOpen,
  Loader2,
  Plane,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  APPLICATION_GUARANTEE_SUMMARY,
  APPLICATION_GUARANTEE_TITLE,
  findDelegatedPackage,
  formatPriceMad,
  type DelegatedCategory,
} from '@/lib/delegated-application-catalog';
import {
  NEXUS_FOCUS_VISIBLE,
  NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
  NEXUS_TRANSITION,
} from '@/lib/nexus-chrome';
import { appToast } from '@/lib/toast-store';
import { cn } from '@/lib/utils';

const SHELL = '#FAF7EE';
const NAVY = '#0D1B3E';
const INK_60 = 'rgba(13,27,62,0.60)';
const INK_40 = 'rgba(13,27,62,0.40)';
const INK_10 = 'rgba(13,27,62,0.10)';
const INK_05 = 'rgba(13,27,62,0.05)';

const STEPS = ['Informations', 'Détails', 'Documents', 'Confirmation'] as const;

function makeFileReference(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const digits = String(h % 9000 + 1000);
  const suffix = String.fromCharCode(65 + (h % 26));
  return `TX-${digits}-${suffix}`;
}

function Field({
  label,
  value,
  onChange,
  textarea,
  required,
  placeholder,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  const base =
    'mt-1.5 w-full rounded-md border bg-[#FAF7EE] px-4 text-sm font-medium text-[#0D1B3E] outline-none transition-colors placeholder:text-[#0D1B3E]/35 focus:border-[#0D1B3E] focus:ring-2 focus:ring-[#0D1B3E]/15';
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
        {label}
        {required ? ' *' : ''}
      </span>
      {textarea ? (
        <textarea
          required={required}
          rows={3}
          placeholder={placeholder}
          className={`${base} py-3`}
          style={{ borderColor: INK_10 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          required={required}
          placeholder={placeholder}
          type={type}
          className={`${base} h-12`}
          style={{ borderColor: INK_10 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

function FormSection({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      className="rounded-xl border bg-white p-6 sm:p-7"
      style={{ borderColor: INK_10 }}
    >
      <header className="mb-5 flex items-center gap-2.5">
        <span className="text-[#0D1B3E]/75" aria-hidden>
          {icon}
        </span>
        <h2 className="font-serif text-lg font-black tracking-tight text-[#0D1B3E]">{title}</h2>
      </header>
      <div className="grid gap-5">{children}</div>
    </section>
  );
}

function Stepper({ current }: { current: number }) {
  return (
    <ol
      className="inline-flex flex-wrap items-center gap-1.5 rounded-full px-2 py-1.5"
      style={{ backgroundColor: INK_05 }}
      aria-label="Progression du dossier"
    >
      {STEPS.map((s, i) => {
        const isActive = i === current;
        const isPast = i < current;
        return (
          <li key={s} className="flex items-center gap-1.5">
            <span
              aria-current={isActive ? 'step' : undefined}
              className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] transition-colors ${
                isActive
                  ? 'bg-white text-[#0D1B3E] shadow-sm'
                  : isPast
                    ? 'text-[#0D1B3E]/70'
                    : 'text-[#0D1B3E]/35'
              }`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 ? (
              <span
                aria-hidden
                className={`text-[10px] ${isPast ? 'text-[#0D1B3E]/70' : 'text-[#0D1B3E]/30'}`}
              >
                →
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export default function DelegatedApplicationApplyClient() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryRaw = searchParams?.get('category') ?? '';
  const packageId = searchParams?.get('package') ?? '';
  const countryIdParam = searchParams?.get('countryId')?.trim() ?? '';
  const countryNameParam = searchParams?.get('countryName')?.trim() ?? '';

  const category: DelegatedCategory | null =
    categoryRaw === 'job' || categoryRaw === 'university' ? categoryRaw : null;
  const pkg = category ? findDelegatedPackage(category, packageId) : null;

  const catalogQueryReturn = useMemo(() => {
    const parts: string[] = [];
    if (countryIdParam) parts.push(`countryId=${encodeURIComponent(countryIdParam)}`);
    if (countryNameParam) parts.push(`countryName=${encodeURIComponent(countryNameParam)}`);
    return parts.length ? `?${parts.join('&')}` : '';
  }, [countryIdParam, countryNameParam]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('fr');
  const [guaranteeAck, setGuaranteeAck] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneId, setDoneId] = useState<number | null>(null);

  const defaultName = useMemo(() => {
    const n = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    return n || '';
  }, [user?.firstName, user?.lastName]);
  const defaultEmail = user?.primaryEmailAddress?.emailAddress ?? '';

  useEffect(() => {
    if (!user) return;
    setFullName((prev) => (prev ? prev : defaultName));
    setEmail((prev) => (prev ? prev : defaultEmail));
  }, [user, defaultName, defaultEmail]);

  const [job, setJob] = useState({
    targetRoles: '',
    targetCountries: '',
    experienceSummary: '',
    cvNotes: '',
    motivationAngles: '',
    linkedInUrl: '',
    urgency: '',
    additionalNotes: '',
  });

  const [university, setUniversity] = useState({
    programLevel: '',
    fieldOfStudy: '',
    targetCountries: '',
    institutionsWishlist: '',
    academicsSummary: '',
    languageScores: '',
    motivationThemes: '',
    documentsReady: '',
    additionalNotes: '',
  });

  useEffect(() => {
    if (!countryIdParam && !countryNameParam) return;
    const label = countryNameParam || (countryIdParam ? `Pays #${countryIdParam}` : '');
    if (!label) return;
    setJob((j) => (j.targetCountries.trim() ? j : { ...j, targetCountries: label }));
    setUniversity((u) => (u.targetCountries.trim() ? u : { ...u, targetCountries: label }));
  }, [countryIdParam, countryNameParam]);

  const fileReference = useMemo(() => {
    if (!pkg) return 'TX-0000-A';
    const userKey = user?.id || email || 'guest';
    return makeFileReference(`${pkg.id}::${userKey}`);
  }, [pkg, user?.id, email]);

  const contactReady =
    fullName.trim().length > 1 && email.trim().includes('@') && phone.trim().length > 4;
  const projectReady = useMemo(() => {
    if (category === 'job') {
      return (
        job.targetRoles.trim().length > 1 &&
        job.targetCountries.trim().length > 1 &&
        job.experienceSummary.trim().length > 5
      );
    }
    if (category === 'university') {
      return (
        university.programLevel.trim().length > 1 &&
        university.fieldOfStudy.trim().length > 1 &&
        university.targetCountries.trim().length > 1
      );
    }
    return false;
  }, [category, job, university]);

  const currentStep = doneId !== null ? 3 : guaranteeAck ? 3 : projectReady ? 2 : contactReady ? 1 : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pkg || !category) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/delegated-application-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          packageId: pkg.id,
          guaranteeAcknowledged: guaranteeAck,
          contact: { fullName, email, phone, preferredLanguage },
          job: category === 'job' ? job : undefined,
          university: category === 'university' ? university : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Échec envoi');
      setDoneId(typeof data.id === 'number' ? data.id : null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur';
      setError(message);
      appToast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!pkg || !category) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: SHELL }}>
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <p className="font-serif text-2xl font-black text-[#0D1B3E]">Forfait introuvable.</p>
          <p className="mt-3 font-serif text-base font-medium text-[#0D1B3E]/65">
            Sélectionnez un forfait depuis le catalogue.
          </p>
          <Link
            href="/services/delegated-applications"
            className={cn(
              'mt-8 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] underline decoration-[#0D1B3E]/30 underline-offset-4 hover:decoration-[#0D1B3E]',
              NEXUS_TRANSITION,
              NEXUS_FOCUS_VISIBLE,
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Retour aux forfaits
          </Link>
        </div>
      </div>
    );
  }

  if (doneId !== null) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: SHELL }}>
        <div className="mx-auto max-w-2xl px-6 py-16 sm:px-8">
          <Link
            href={`/services/delegated-applications${catalogQueryReturn}`}
            className={cn(
              'mb-8 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65 hover:text-[#0D1B3E]',
              NEXUS_TRANSITION,
              NEXUS_FOCUS_VISIBLE,
            )}
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Retour au catalogue
          </Link>

          <div
            className="rounded-2xl border bg-white p-8 text-center shadow-sm sm:p-10"
            style={{ borderColor: INK_10 }}
          >
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(13,27,62,0.06)' }}
            >
              <CheckCircle2 className="h-7 w-7 text-[#0D1B3E]" aria-hidden />
            </div>
            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/55">
              Demande enregistrée
            </p>
            <h1 className="mt-3 font-serif text-3xl font-black leading-tight tracking-tight text-[#0D1B3E]">
              Référence #{doneId}
            </h1>
            <p className="mt-3 mx-auto max-w-md font-serif text-sm font-medium leading-relaxed text-[#0D1B3E]/65">
              Notre équipe vous recontacte sous 24–48 h à l&apos;adresse indiquée. Le récapitulatif
              est accessible dans le tableau de bord via <strong>Voir</strong> sur la ligne de la
              demande.
            </p>

            <div
              className="mx-auto mt-6 max-w-md rounded-xl border p-5 text-left"
              style={{ borderColor: INK_10, backgroundColor: SHELL }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65">
                {APPLICATION_GUARANTEE_TITLE}
              </p>
              <p
                className="mt-2 text-[13px] font-medium leading-relaxed text-[#0D1B3E]/75"
                dangerouslySetInnerHTML={{
                  __html: APPLICATION_GUARANTEE_SUMMARY.replace(
                    /\*\*(.*?)\*\*/g,
                    '<strong class="text-[#0D1B3E] font-black">$1</strong>',
                  ),
                }}
              />
              <Link
                href="/services/delegated-applications#assist-garantie"
                className={cn(
                  'mt-3 inline-block text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] underline decoration-[#0D1B3E]/30 underline-offset-4 hover:decoration-[#0D1B3E]',
                  NEXUS_TRANSITION,
                  NEXUS_FOCUS_VISIBLE,
                )}
              >
                Lire le texte complet →
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/overview#assist-requests"
                className={cn(
                  'rounded-md bg-[#0D1B3E] px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-white hover:bg-[#1A2A52]',
                  NEXUS_TRANSITION,
                  NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
                )}
              >
                Voir mes demandes
              </Link>
              <Link
                href={`/services/delegated-applications${catalogQueryReturn}`}
                className={cn(
                  'rounded-md border border-[#0D1B3E]/15 bg-white px-5 py-3 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E] hover:border-[#0D1B3E]',
                  NEXUS_TRANSITION,
                  NEXUS_FOCUS_VISIBLE,
                )}
              >
                Autre forfait
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: SHELL }}>
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-6 lg:px-8">
        <Link
          href={`/services/delegated-applications${catalogQueryReturn}`}
          className={cn(
            'mb-6 inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65 hover:text-[#0D1B3E]',
            NEXUS_TRANSITION,
            NEXUS_FOCUS_VISIBLE,
          )}
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Retour au catalogue
        </Link>

        <header className="mb-10 grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <h1 className="font-serif text-3xl font-black leading-[1.05] tracking-tight text-[#0D1B3E] sm:text-4xl md:text-[42px]">
              {pkg.name}
              {countryNameParam ? (
                <>
                  <br />
                  <span className="text-[#0D1B3E]/70">— {countryNameParam}</span>
                </>
              ) : null}
            </h1>
            <p className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium text-[#0D1B3E]/65">
              <Clock className="h-4 w-4" aria-hidden /> {pkg.turnaroundNote}
            </p>
          </div>
          <Stepper current={currentStep} />
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection icon={<UserRound className="h-5 w-5" />} title="Identité & Contact">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Nom complet"
                  required
                  value={fullName}
                  onChange={setFullName}
                  placeholder="Conforme au passeport"
                />
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                    Langue de travail
                  </span>
                  <select
                    className="mt-1.5 h-12 w-full rounded-md border bg-[#FAF7EE] px-4 text-sm font-medium text-[#0D1B3E] outline-none focus:border-[#0D1B3E] focus:ring-2 focus:ring-[#0D1B3E]/15"
                    style={{ borderColor: INK_10 }}
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </label>
                <Field
                  label="Adresse email"
                  required
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="contact@domaine.com"
                />
                <Field
                  label="Téléphone"
                  required
                  value={phone}
                  onChange={setPhone}
                  placeholder="+33 6 00 00 00 00"
                />
              </div>
            </FormSection>

            {category === 'job' ? (
              <FormSection icon={<Plane className="h-5 w-5" />} title="Projet emploi">
                <Field
                  label="Intitulés / familles de postes visés"
                  required
                  value={job.targetRoles}
                  onChange={(v) => setJob((s) => ({ ...s, targetRoles: v }))}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Pays ou zones géographiques"
                    required
                    value={job.targetCountries}
                    onChange={(v) => setJob((s) => ({ ...s, targetCountries: v }))}
                  />
                  <Field
                    label="Profil LinkedIn (URL)"
                    value={job.linkedInUrl}
                    onChange={(v) => setJob((s) => ({ ...s, linkedInUrl: v }))}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <Field
                  label="Synthèse expérience (années, secteurs, réalisations)"
                  required
                  textarea
                  value={job.experienceSummary}
                  onChange={(v) => setJob((s) => ({ ...s, experienceSummary: v }))}
                />
                <Field
                  label="Notes CV (lien drive, version actuelle, écarts à combler)"
                  textarea
                  value={job.cvNotes}
                  onChange={(v) => setJob((s) => ({ ...s, cvNotes: v }))}
                />
                <Field
                  label="Angles de motivation / messages clés"
                  textarea
                  value={job.motivationAngles}
                  onChange={(v) => setJob((s) => ({ ...s, motivationAngles: v }))}
                />
                <Field
                  label="Urgence & contraintes calendaires"
                  textarea
                  value={job.urgency}
                  onChange={(v) => setJob((s) => ({ ...s, urgency: v }))}
                />
              </FormSection>
            ) : (
              <FormSection icon={<Plane className="h-5 w-5" />} title="Projet universitaire">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Niveau visé"
                    required
                    value={university.programLevel}
                    onChange={(v) => setUniversity((s) => ({ ...s, programLevel: v }))}
                    placeholder="Licence, Master, Doctorat…"
                  />
                  <Field
                    label="Domaine / filière"
                    required
                    value={university.fieldOfStudy}
                    onChange={(v) => setUniversity((s) => ({ ...s, fieldOfStudy: v }))}
                  />
                </div>
                <Field
                  label="Pays ou régions cibles"
                  required
                  value={university.targetCountries}
                  onChange={(v) => setUniversity((s) => ({ ...s, targetCountries: v }))}
                />
                <Field
                  label="Écoles ou programmes prioritaires (liste)"
                  textarea
                  value={university.institutionsWishlist}
                  onChange={(v) => setUniversity((s) => ({ ...s, institutionsWishlist: v }))}
                />
                <Field
                  label="Parcours académique & notes clés"
                  textarea
                  value={university.academicsSummary}
                  onChange={(v) => setUniversity((s) => ({ ...s, academicsSummary: v }))}
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Scores langue"
                    textarea
                    value={university.languageScores}
                    onChange={(v) => setUniversity((s) => ({ ...s, languageScores: v }))}
                    placeholder="IELTS, TOEFL, TCF…"
                  />
                  <Field
                    label="Thèmes à mettre en avant"
                    textarea
                    value={university.motivationThemes}
                    onChange={(v) => setUniversity((s) => ({ ...s, motivationThemes: v }))}
                  />
                </div>
              </FormSection>
            )}

            <FormSection icon={<FolderOpen className="h-5 w-5" />} title="Documents requis">
              <div
                className="rounded-xl border-2 border-dashed px-6 py-8 text-center"
                style={{ borderColor: 'rgba(13,27,62,0.18)', backgroundColor: SHELL }}
              >
                <div
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(13,27,62,0.06)' }}
                >
                  <FileText className="h-5 w-5 text-[#0D1B3E]/65" aria-hidden />
                </div>
                <p className="mt-4 font-serif text-base font-black text-[#0D1B3E]">
                  Décrivez vos documents
                </p>
                <p className="mt-1.5 text-[13px] font-medium text-[#0D1B3E]/55">
                  Passeport, lettre d&apos;acceptation, justificatifs financiers — l&apos;upload
                  fichiers arrive bientôt.
                </p>
                <p
                  className="mt-3 text-[10px] font-black uppercase tracking-[0.22em]"
                  style={{ color: INK_40 }}
                >
                  Formats acceptés : PDF, JPG, PNG (max 10 MB)
                </p>
              </div>

              {category === 'job' ? (
                <Field
                  label="Pièces disponibles / précisions"
                  textarea
                  value={job.additionalNotes}
                  onChange={(v) => setJob((s) => ({ ...s, additionalNotes: v }))}
                  placeholder="Liste / liens / format des pièces que vous avez déjà"
                />
              ) : (
                <>
                  <Field
                    label="Documents déjà disponibles / manquants"
                    textarea
                    value={university.documentsReady}
                    onChange={(v) => setUniversity((s) => ({ ...s, documentsReady: v }))}
                  />
                  <Field
                    label="Précisions complémentaires"
                    textarea
                    value={university.additionalNotes}
                    onChange={(v) => setUniversity((s) => ({ ...s, additionalNotes: v }))}
                  />
                </>
              )}
            </FormSection>

            <label
              className="flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-5"
              style={{ borderColor: INK_10 }}
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-[#0D1B3E]/30 text-[#0D1B3E] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3E]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                checked={guaranteeAck}
                onChange={(e) => setGuaranteeAck(e.target.checked)}
                required
              />
              <span className="text-[13px] font-medium leading-relaxed text-[#0D1B3E]/75">
                Je certifie l&apos;exactitude des informations fournies et accepte les conditions
                générales de service ainsi que la politique de confidentialité de VisaFlow. Je
                reconnais la garantie résultats (remboursement de <strong>50&nbsp;%</strong> en
                l&apos;absence de résultats éligibles dans le cadre contractuel).{' '}
                <Link
                  href="/services/delegated-applications#assist-garantie"
                  className={cn(
                    'font-black text-[#0D1B3E] underline decoration-[#0D1B3E]/30 underline-offset-2 hover:decoration-[#0D1B3E]',
                    NEXUS_TRANSITION,
                    NEXUS_FOCUS_VISIBLE,
                  )}
                >
                  Voir le texte complet
                </Link>
              </span>
            </label>

            {error ? (
              <p
                className="rounded-md border px-4 py-3 text-sm font-bold"
                style={{ borderColor: 'rgba(220,38,38,0.25)', color: '#B91C1C', backgroundColor: 'rgba(254,242,242,0.7)' }}
                role="alert"
              >
                {error}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push(`/services/delegated-applications${catalogQueryReturn}`)}
                className={cn(
                  'text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55 hover:text-[#0D1B3E]',
                  NEXUS_TRANSITION,
                  NEXUS_FOCUS_VISIBLE,
                )}
              >
                Changer de forfait
              </button>
              <button
                type="submit"
                disabled={submitting || !guaranteeAck}
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-md bg-[#0D1B3E] px-6 py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-white hover:bg-[#1A2A52] disabled:cursor-not-allowed disabled:opacity-50',
                  NEXUS_TRANSITION,
                  NEXUS_FOCUS_VISIBLE_ON_INK_SOLID,
                )}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                Soumettre le dossier
              </button>
            </div>
          </form>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <section
              className="rounded-xl border p-6"
              style={{ borderColor: INK_10, backgroundColor: 'rgba(244,239,226,0.55)' }}
              aria-label="Résumé de la demande"
            >
              <p className="text-center text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/55">
                Résumé de la demande
              </p>
              <p className="mt-3 text-center font-serif text-2xl font-black tracking-tight text-[#0D1B3E]">
                {fileReference}
              </p>

              <hr className="my-5 border-[#0D1B3E]/10" />

              <dl className="space-y-3 text-[13px] font-medium">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#0D1B3E]/55">Service</dt>
                  <dd className="text-right text-[#0D1B3E]">{pkg.name}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#0D1B3E]/55">Traitement</dt>
                  <dd className="text-right text-[#0D1B3E]">{pkg.tierLabel}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#0D1B3E]/55">Portée</dt>
                  <dd className="text-right text-[#0D1B3E]">{pkg.applicationsScope}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#0D1B3E]/55">Calendrier</dt>
                  <dd className="text-right text-[#0D1B3E]/85">{pkg.turnaroundNote}</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-[#0D1B3E]/10 pt-3">
                  <dt className="text-[#0D1B3E]/55">Honoraires HT</dt>
                  <dd className="text-right text-[#0D1B3E]">{formatPriceMad(pkg.priceMad)}</dd>
                </div>
              </dl>

              <hr className="my-5 border-[#0D1B3E]/10" />

              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
                  Total estimé
                </p>
                <p className="font-serif text-2xl font-black tracking-tight text-[#0D1B3E]">
                  {formatPriceMad(pkg.priceMad)}
                </p>
              </div>

              <p className="mt-4 text-[10px] font-medium italic leading-relaxed text-[#0D1B3E]/45">
                Garantie 50 % remboursés en l&apos;absence de résultats éligibles dans le cadre
                contractuel.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
