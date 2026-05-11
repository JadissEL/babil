'use client';

import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  APPLICATION_GUARANTEE_SUMMARY,
  APPLICATION_GUARANTEE_TITLE,
  findDelegatedPackage,
  formatPriceMad,
  type DelegatedCategory,
} from '@/lib/delegated-application-catalog';
import { appToast } from '@/lib/toast-store';

export default function DelegatedApplicationApplyClient() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryRaw = searchParams?.get('category') ?? '';
  const packageId = searchParams?.get('package') ?? '';

  const category: DelegatedCategory | null =
    categoryRaw === 'job' || categoryRaw === 'university' ? categoryRaw : null;
  const pkg = category ? findDelegatedPackage(category, packageId) : null;

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

  useEffect(() => {
    const id = searchParams?.get('countryId')?.trim();
    const name = searchParams?.get('countryName')?.trim();
    if (!id && !name) return;
    const label = name || (id ? `Pays #${id}` : '');
    if (!label) return;
    setJob((j) => (j.targetCountries.trim() ? j : { ...j, targetCountries: label }));
    setUniversity((u) => (u.targetCountries.trim() ? u : { ...u, targetCountries: label }));
  }, [searchParams]);

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
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-black text-text">Forfait introuvable.</p>
        <p className="mt-2 text-sm font-medium text-muted">
          Sélectionnez un forfait depuis le catalogue.
        </p>
        <Link
          href="/services/delegated-applications"
          className="mt-6 inline-block text-xs font-black uppercase tracking-widest text-primary"
        >
          Retour aux forfaits
        </Link>
      </div>
    );
  }

  if (doneId !== null) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-xl font-black text-success">Demande enregistrée</p>
        <p className="mt-3 text-sm font-medium text-muted">
          Référence #{doneId}. Notre équipe vous recontacte sous 24–48h à l’adresse indiquée.
        </p>
        <p className="mt-2 text-sm font-medium text-muted">
          Le récapitulatif que vous avez envoyé est accessible dans le tableau de bord via{' '}
          <strong className="font-bold text-text">Voir</strong> sur la ligne de la demande.
        </p>
        <div className="mt-6 rounded-2xl border border-primary/25 bg-primary-soft p-5 text-left">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            {APPLICATION_GUARANTEE_TITLE}
          </p>
          <p className="mt-2 text-sm font-medium text-text">{APPLICATION_GUARANTEE_SUMMARY}</p>
          <Link
            href="/services/delegated-applications#assist-garantie"
            className="mt-3 inline-block text-[11px] font-black uppercase tracking-wider text-primary hover:text-primary-hover"
          >
            Lire le texte complet sur le catalogue →
          </Link>
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Link
            href="/overview#assist-requests"
            className="rounded-xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-white"
          >
            Voir mes demandes
          </Link>
          <Link
            href="/overview"
            className="rounded-xl border border-line bg-[#f8f2e8] px-6 py-3 text-xs font-black uppercase tracking-widest text-text"
          >
            Tableau de bord
          </Link>
          <Link
            href="/services/delegated-applications"
            className="rounded-xl border border-line bg-[#f8f2e8] px-6 py-3 text-xs font-black uppercase tracking-widest text-text"
          >
            Autre forfait
          </Link>
          <Link
            href="/services/delegated-applications#assist-garantie"
            className="rounded-xl border border-emerald-500/40 bg-[#e9f9f1]/80 px-6 py-3 text-xs font-black uppercase tracking-widest text-text"
          >
            Garantie résultats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 pb-12 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-[2rem] border border-line bg-surface p-6 shadow-card">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted">
          Forfait sélectionné
        </p>
        <h1 className="mt-2 text-2xl font-black text-text">{pkg.name}</h1>
        <p className="mt-1 text-lg font-black text-primary">{formatPriceMad(pkg.priceMad)}</p>
        <p className="mt-2 text-sm font-medium text-muted">{pkg.tagline}</p>
      </div>

      <div className="mb-8 rounded-2xl border border-primary/25 bg-primary-soft p-5">
        <p className="text-xs font-black uppercase tracking-widest text-primary">
          {APPLICATION_GUARANTEE_TITLE}
        </p>
        <p className="mt-2 text-sm font-medium text-text">{APPLICATION_GUARANTEE_SUMMARY}</p>
        <Link
          href="/services/delegated-applications#assist-garantie"
          className="mt-3 inline-block text-[11px] font-black uppercase tracking-wider text-primary hover:text-primary-hover"
        >
          Texte détaillé sur la page catalogue →
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-[2rem] border border-line bg-surface p-6 shadow-soft md:p-8"
      >
        <h2 className="text-lg font-black text-text">Coordonnées</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">
              Nom complet
            </span>
            <input
              required
              className="mt-1 w-full rounded-2xl border border-line bg-[#f8f2e8] px-4 py-3 text-sm font-medium text-text outline-none focus:ring-2 focus:ring-primary/40"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">
              Email
            </span>
            <input
              required
              type="email"
              className="mt-1 w-full rounded-2xl border border-line bg-[#f8f2e8] px-4 py-3 text-sm font-medium text-text outline-none focus:ring-2 focus:ring-primary/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">
              Téléphone
            </span>
            <input
              required
              className="mt-1 w-full rounded-2xl border border-line bg-[#f8f2e8] px-4 py-3 text-sm font-medium text-text outline-none focus:ring-2 focus:ring-primary/40"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted">
              Langue de travail
            </span>
            <select
              className="mt-1 w-full rounded-2xl border border-line bg-[#f8f2e8] px-4 py-3 text-sm font-medium text-text outline-none focus:ring-2 focus:ring-primary/40"
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </label>
        </div>

        {category === 'job' ? (
          <>
            <h2 className="text-lg font-black text-text">Projet emploi</h2>
            <div className="grid gap-4">
              <Field
                label="Intitulés / familles de postes visés"
                required
                value={job.targetRoles}
                onChange={(v) => setJob((s) => ({ ...s, targetRoles: v }))}
              />
              <Field
                label="Pays ou zones géographiques"
                required
                value={job.targetCountries}
                onChange={(v) => setJob((s) => ({ ...s, targetCountries: v }))}
              />
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
                label="Profil LinkedIn (URL)"
                value={job.linkedInUrl}
                onChange={(v) => setJob((s) => ({ ...s, linkedInUrl: v }))}
              />
              <Field
                label="Urgence & contraintes calendaires"
                textarea
                value={job.urgency}
                onChange={(v) => setJob((s) => ({ ...s, urgency: v }))}
              />
              <Field
                label="Précisions complémentaires"
                textarea
                value={job.additionalNotes}
                onChange={(v) => setJob((s) => ({ ...s, additionalNotes: v }))}
              />
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-black text-text">Projet universitaire</h2>
            <div className="grid gap-4">
              <Field
                label="Niveau visé (Licence, Master, Doctorat, etc.)"
                required
                value={university.programLevel}
                onChange={(v) => setUniversity((s) => ({ ...s, programLevel: v }))}
              />
              <Field
                label="Domaine / filière"
                required
                value={university.fieldOfStudy}
                onChange={(v) => setUniversity((s) => ({ ...s, fieldOfStudy: v }))}
              />
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
              <Field
                label="Scores langue (IELTS, TOEFL, TCF, etc.)"
                textarea
                value={university.languageScores}
                onChange={(v) => setUniversity((s) => ({ ...s, languageScores: v }))}
              />
              <Field
                label="Thèmes à mettre en avant dans les lettres"
                textarea
                value={university.motivationThemes}
                onChange={(v) => setUniversity((s) => ({ ...s, motivationThemes: v }))}
              />
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
            </div>
          </>
        )}

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-[#f8f2e8] p-4">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-line text-primary focus:ring-primary"
            checked={guaranteeAck}
            onChange={(e) => setGuaranteeAck(e.target.checked)}
            required
          />
          <span className="text-sm font-bold text-text">
            Je confirme avoir lu la garantie résultats (remboursement de 50&nbsp;% en l’absence de
            résultats éligibles dans le cadre contractuel) et accepte qu’un opérateur me transmette
            les conditions détaillées avant toute facturation.{' '}
            <Link
              href="/services/delegated-applications#assist-garantie"
              className="text-primary underline underline-offset-2 hover:text-primary-hover"
            >
              Voir le texte complet
            </Link>
          </span>
        </label>

        {error ? <p className="text-sm font-bold text-danger">{error}</p> : null}

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={submitting || !guaranteeAck}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-black uppercase tracking-widest text-white disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Envoyer la demande
          </button>
          <button
            type="button"
            onClick={() => router.push('/services/delegated-applications')}
            className="text-xs font-black uppercase tracking-widest text-muted hover:text-primary"
          >
            Changer de forfait
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-black uppercase tracking-widest text-muted">
        {label}
        {required ? ' *' : ''}
      </span>
      {textarea ? (
        <textarea
          required={required}
          rows={4}
          className="mt-1 w-full rounded-2xl border border-line bg-[#f8f2e8] px-4 py-3 text-sm font-medium text-text outline-none focus:ring-2 focus:ring-primary/40"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          required={required}
          className="mt-1 w-full rounded-2xl border border-line bg-[#f8f2e8] px-4 py-3 text-sm font-medium text-text outline-none focus:ring-2 focus:ring-primary/40"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
