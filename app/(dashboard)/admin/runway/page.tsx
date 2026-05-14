import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Database,
  EyeOff,
  ListChecks,
  X,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const INK_10 = 'rgba(13,27,62,0.10)';
const INK_60 = 'rgba(13,27,62,0.60)';
const CREAM_PANEL = '#FAF7EE';
const CREAM_HEADER = '#FDF8EF';
const ROSE_BORDER = 'rgba(190,24,93,0.30)';
const ROSE_TONE = '#BE185D';
const ROSE_SOFT = 'rgba(244,114,182,0.10)';
const RED_CODE_TONE = '#B91C1C';
const RED_CODE_SOFT = 'rgba(220,38,38,0.10)';

function MockChromeBar() {
  return (
    <div
      className="flex items-center justify-between gap-6 border-b px-6 py-3"
      style={{ borderColor: INK_10, backgroundColor: CREAM_HEADER }}
      aria-hidden
    >
      <span className="font-serif text-[15px] font-black tracking-tight text-[#0D1B3E]">
        VisaFlow
      </span>
      <nav className="hidden flex-1 items-center justify-center gap-6 text-[12px] text-[#0D1B3E]/70 sm:flex">
        <span className="border-b border-[#0D1B3E] pb-0.5 text-[#0D1B3E]">Specs</span>
        <span>Components</span>
        <span>Guidelines</span>
      </nav>
      <span
        className="inline-flex items-center rounded-full border bg-white px-3 py-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]"
        style={{ borderColor: INK_10 }}
      >
        Page 46
      </span>
    </div>
  );
}

function CodeChip({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="inline-flex items-center rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold"
      style={{ backgroundColor: RED_CODE_SOFT, color: RED_CODE_TONE }}
    >
      {children}
    </code>
  );
}

function TechnicalImplementationCard() {
  return (
    <div
      className="rounded-2xl border bg-white p-6"
      style={{ borderColor: INK_10 }}
    >
      <h2 className="flex items-center gap-2 font-serif text-[18px] font-black tracking-tight text-[#0D1B3E]">
        <Database className="h-4 w-4" style={{ color: INK_60 }} aria-hidden />
        Technical Implementation
      </h2>
      <dl className="mt-6 space-y-6 text-[13px] leading-relaxed text-[#0D1B3E]/75">
        <div className="flex gap-3">
          <Database
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: INK_60 }}
            aria-hidden
          />
          <div>
            <dt className="font-semibold text-[#0D1B3E]">localStorage Persistence:</dt>
            <dd className="mt-1.5">
              State is tracked locally via{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono text-[12px]">
                vf_onboarding_v1
              </code>{' '}
              (fields <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono text-[12px]">dismissed</code>,{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono text-[12px]">recoSeen</code>,{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono text-[12px]">explorerDone</code>).
              Server sync happens on completion of individual steps via{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono text-[12px]">
                ONBOARDING_STORAGE_UPDATED_EVENT
              </code>{' '}
              plus <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono text-[12px]">focus</code> /{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono text-[12px]">storage</code> /{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono text-[12px]">visibilitychange</code>.
            </dd>
          </div>
        </div>
        <div className="flex gap-3">
          <EyeOff
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: INK_60 }}
            aria-hidden
          />
          <div>
            <dt className="font-semibold text-[#0D1B3E]">Return Null Conditions:</dt>
            <dd className="mt-1.5">
              Component will not render if:{' '}
              <CodeChip>!isLoaded</CodeChip>{' '}
              <span aria-hidden>||</span>{' '}
              <CodeChip>dismissed === true</CodeChip>{' '}
              <span aria-hidden>||</span>{' '}
              <CodeChip>accountAgeDays &gt; 21</CodeChip>{' '}
              <span aria-hidden>||</span>{' '}
              <CodeChip>allDone === true</CodeChip>.
              <p className="mt-2 text-[12px] italic text-[#0D1B3E]/55">
                Profil considéré complet quand <code className="font-mono">income &gt; 0</code> &amp;{' '}
                <code className="font-mono">savings</code> fini &amp; <code className="font-mono">goal_type</code>{' '}
                non vide après trim.
              </p>
            </dd>
          </div>
        </div>
      </dl>
    </div>
  );
}

type Step = {
  title: string;
  desc: string;
  done: boolean;
  active?: boolean;
  href: string;
};

function StepRow({ step }: { step: Step }) {
  return (
    <li
      className="flex items-start gap-3 rounded-xl border bg-white px-4 py-3"
      style={{
        borderColor: step.active ? '#0D1B3E' : INK_10,
        boxShadow: step.active ? 'inset 0 0 0 1px #0D1B3E' : undefined,
        backgroundColor: step.active ? '#FFFFFF' : step.done ? CREAM_HEADER : '#FFFFFF',
      }}
    >
      {step.done ? (
        <CheckCircle2
          className="mt-0.5 h-5 w-5 shrink-0"
          style={{ color: '#10B981' }}
          aria-hidden
        />
      ) : (
        <Circle
          className="mt-0.5 h-5 w-5 shrink-0"
          style={{ color: INK_60 }}
          aria-hidden
        />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p
            className={`text-[14px] font-bold ${step.done ? 'text-[#0D1B3E]/55 line-through' : 'text-[#0D1B3E]'}`}
          >
            {step.title}
          </p>
          {!step.done ? (
            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#0D1B3E]">
              Ouvrir
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
          ) : null}
        </div>
        <p
          className={`mt-0.5 text-[12px] leading-snug ${
            step.done ? 'text-[#0D1B3E]/45 line-through' : 'text-[#0D1B3E]/60'
          }`}
        >
          {step.desc}
        </p>
      </div>
    </li>
  );
}

function ChecklistCard({
  subtitle,
  steps,
}: {
  subtitle: string;
  steps: Step[];
}) {
  return (
    <div
      className="rounded-2xl border bg-white"
      style={{ borderColor: INK_10 }}
    >
      <div
        className="flex items-start justify-between gap-3 border-b px-5 py-4"
        style={{ borderColor: INK_10 }}
      >
        <div className="flex items-start gap-3">
          <ListChecks
            className="mt-0.5 h-5 w-5 shrink-0"
            style={{ color: INK_60 }}
            aria-hidden
          />
          <div>
            <h3 className="font-serif text-[17px] font-black tracking-tight text-[#0D1B3E]">
              Premiers pas sur VisaFlow
            </h3>
            <p className="mt-1 text-[12.5px] leading-snug text-[#0D1B3E]/60">{subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          disabled
          className="rounded-md p-1.5 text-[#0D1B3E]/55 transition-colors hover:bg-[#0D1B3E]/[0.05]"
          aria-label="Specimen — masquer la checklist (lecture seule)"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <ol className="space-y-2.5 px-5 py-4">
        {steps.map((s) => (
          <StepRow key={s.title} step={s} />
        ))}
      </ol>
    </div>
  );
}

const INITIAL_STEPS: Step[] = [
  {
    title: 'Compléter votre profil',
    desc: 'Ajoutez vos informations professionnelles pour des recommandations ciblées.',
    done: false,
    href: '/profile',
  },
  {
    title: 'Voir vos recommandations',
    desc: 'Consultez l’intelligence adaptée à vos besoins immédiats.',
    done: false,
    href: '/recommendations',
  },
  {
    title: 'Parcourir l’explorateur',
    desc: 'Découvrez la profondeur de nos archives mondiales.',
    done: false,
    href: '/explorer',
  },
];

const PROGRESS_STEPS: Step[] = [
  { ...INITIAL_STEPS[0]!, done: true },
  { ...INITIAL_STEPS[1]!, done: true },
  { ...INITIAL_STEPS[2]!, active: true },
];

function DismissedSpecimen() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {['Standard Card', 'Standard Card'].map((label, idx) => (
          <div
            key={`${label}-${idx}`}
            className="flex h-28 items-center justify-center rounded-2xl bg-[#E5E7EB] text-[13px] font-semibold text-[#0D1B3E]/65"
            aria-hidden
          >
            {label}
          </div>
        ))}
      </div>
      <div
        className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-12 text-center"
        style={{ borderColor: ROSE_BORDER, backgroundColor: ROSE_SOFT }}
      >
        <EyeOff className="h-5 w-5" style={{ color: ROSE_TONE }} aria-hidden />
        <p
          className="font-mono text-[10px] font-black uppercase tracking-[0.28em]"
          style={{ color: ROSE_TONE }}
        >
          Component Removed
        </p>
        <p className="text-[12.5px] text-[#0D1B3E]/65">Space reclaimed by layout engine.</p>
      </div>
    </div>
  );
}

function StateFrame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl border bg-white p-5"
      style={{ borderColor: INK_10 }}
    >
      <p className="mb-4 font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/55">
        {label}
      </p>
      {children}
    </div>
  );
}

export default function RunwayOnboardingSystemSheet() {
  return (
    <div
      className="overflow-hidden rounded-2xl border bg-white text-[#0D1B3E]"
      style={{ borderColor: INK_10 }}
    >
      <MockChromeBar />

      <div
        className="space-y-12 px-6 py-10 sm:px-10 sm:py-12"
        style={{ backgroundColor: CREAM_PANEL }}
      >
        <header className="max-w-2xl space-y-3">
          <h1 className="font-serif text-[clamp(2rem,3.5vw,2.6rem)] font-black leading-[1.05] tracking-tight">
            Runway Onboarding Checklist
          </h1>
          <p className="text-[13.5px] leading-relaxed text-[#0D1B3E]/65">
            Technical specification and state variations for the new user onboarding widget
            (Dashboard component).
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <TechnicalImplementationCard />

          <StateFrame label="State : 0/3 (Initial)">
            <ChecklistCard
              subtitle="Complétez ces étapes pour tirer le meilleur parti de votre espace de recherche."
              steps={INITIAL_STEPS}
            />
          </StateFrame>

          <StateFrame label="State : 2/3 (Progress)">
            <ChecklistCard
              subtitle="Presque terminé. Complétez la dernière étape."
              steps={PROGRESS_STEPS}
            />
          </StateFrame>

          <StateFrame label="State : Dismissed / Null">
            <DismissedSpecimen />
          </StateFrame>
        </div>

        <section
          className="rounded-2xl border bg-white p-6"
          style={{ borderColor: INK_10 }}
          aria-labelledby="runway-runtime-title"
        >
          <h2
            id="runway-runtime-title"
            className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/55"
          >
            Runtime contract
          </h2>
          <ul className="mt-4 grid gap-3 text-[13px] leading-relaxed text-[#0D1B3E]/75 sm:grid-cols-2">
            <li>
              <strong className="font-semibold text-[#0D1B3E]">Montage :</strong> bloc optionnel sur
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono"> /overview</code>{' '}
              (PAGE 22 · <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">OverviewPageClient</code>),
              après <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">ObjectivePreferencePanel</code>.
            </li>
            <li>
              <strong className="font-semibold text-[#0D1B3E]">Storage :</strong>{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">lib/onboarding-storage.ts</code>{' '}
              expose <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">readOnboarding</code>{' '}
              / <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">writeOnboarding</code>{' '}
              et l&apos;event{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">
                ONBOARDING_STORAGE_UPDATED_EVENT
              </code>{' '}
              (resync multi-onglets).
            </li>
            <li>
              <strong className="font-semibold text-[#0D1B3E]">Sources de complétion :</strong>{' '}
              étape 1 = <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">GET /api/user/profile</code>{' '}
              (PAGE 24). Étape 2 ={' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">recoSeen</code>{' '}
              écrit depuis{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">/recommendations</code>{' '}
              (PAGE 06). Étape 3 ={' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">
                markExplorerOnboardingEngaged()
              </code>{' '}
              (PAGE 02).
            </li>
            <li>
              <strong className="font-semibold text-[#0D1B3E]">Hrefs objectif-aware :</strong> via{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">
                useObjectivePreferenceOptional()
              </code>{' '}
              + <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">ctaExploreHref</code>{' '}
              / <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">ctaCompareHref</code>{' '}
              (PAGE 41).
            </li>
            <li>
              <strong className="font-semibold text-[#0D1B3E]">Conditions null :</strong>{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">!isLoaded</code> ·{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">!hydrated</code> ·{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">!user</code> ·{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">dismissed</code> ·{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">
                !recent &amp;&amp; profileOk
              </code>{' '}
              (<code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">accountIsRecent(createdAt, 21)</code>){' '}
              · <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">allDone</code>.
            </li>
            <li>
              <strong className="font-semibold text-[#0D1B3E]">A11y :</strong>{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">
                aria-label=&quot;Masquer la checklist&quot;
              </code>{' '}
              sur le bouton ✕ ; icônes <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">aria-hidden</code>.
            </li>
          </ul>
        </section>

        <footer
          className="flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-[12px] text-[#0D1B3E]/55"
          style={{ borderColor: INK_10 }}
        >
          <p>
            Source runtime :{' '}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono">
              components/dashboard/PostSignupOnboarding.tsx
            </code>{' '}
            · storage :{' '}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono">
              lib/onboarding-storage.ts
            </code>
            .
          </p>
          <Link
            href="/admin"
            className="font-mono text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65 transition-colors hover:text-[#0D1B3E]"
          >
            ← Citadel Admin Console
          </Link>
        </footer>
      </div>
    </div>
  );
}
