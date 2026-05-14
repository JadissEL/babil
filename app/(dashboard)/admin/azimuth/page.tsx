import {
  Briefcase,
  Building2,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Landmark,
  Plane,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { USER_OBJECTIVES } from '@/lib/user-objectives/registry';

export const dynamic = 'force-dynamic';

const INK_10 = 'rgba(13,27,62,0.10)';
const INK_60 = 'rgba(13,27,62,0.60)';
const CREAM_SHELL = '#FAF7EE';
const CREAM_PANEL = '#F5F0E3';
const ACCENT = '#3B7DFF';
const ACCENT_SOFT = 'rgba(59,125,255,0.10)';

type FeatureSlugIconMap = Partial<Record<string, typeof Plane>>;

const SLUG_ICONS: FeatureSlugIconMap = {
  tourism: Plane,
  studies_master: GraduationCap,
  work: Briefcase,
  business: Building2,
  investment: Landmark,
};

function pickSpecimens() {
  const wanted = ['tourism', 'studies_master', 'work', 'business', 'investment'] as const;
  return wanted
    .map((s) => USER_OBJECTIVES.find((o) => o.slug === s))
    .filter((o): o is (typeof USER_OBJECTIVES)[number] => !!o)
    .map((o) => ({
      slug: o.slug,
      labelFr:
        o.slug === 'studies_master'
          ? 'Études'
          : o.slug === 'tourism'
            ? 'Tourisme'
            : o.slug === 'work'
              ? 'Travail'
              : o.slug === 'business'
                ? 'Business'
                : o.slug === 'investment'
                  ? 'Investissement'
                  : o.labelFr,
      teaserFr:
        o.slug === 'studies_master'
          ? 'Programmes académiques'
          : o.slug === 'tourism'
            ? 'Visites courte durée'
            : o.slug === 'work'
              ? 'Emploi et détachement'
              : o.slug === 'business'
                ? 'Réunions et prospection'
                : o.slug === 'investment'
                  ? 'Projets et immobilier'
                  : o.teaserFr,
      Icon: SLUG_ICONS[o.slug] ?? Plane,
    }));
}

function ChromeWindowDecor() {
  return (
    <div className="flex items-center gap-1.5 px-4 pt-3">
      <span className="h-2.5 w-2.5 rounded-full bg-[#0D1B3E]/15" aria-hidden />
      <span className="h-2.5 w-2.5 rounded-full bg-[#0D1B3E]/15" aria-hidden />
      <span className="h-2.5 w-2.5 rounded-full bg-[#0D1B3E]/15" aria-hidden />
    </div>
  );
}

function StateHeading({
  index,
  title,
  description,
}: {
  index: number;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 space-y-2">
      <h2 className="font-serif text-[22px] font-black leading-tight tracking-tight text-[#0D1B3E] sm:text-[24px]">
        State {index}: {title}
      </h2>
      <p className="max-w-2xl text-[13.5px] leading-relaxed text-[#0D1B3E]/65">{description}</p>
    </div>
  );
}

function StateOneWizard() {
  const specimens = pickSpecimens();
  return (
    <div
      className="overflow-hidden rounded-3xl border bg-white"
      style={{ borderColor: INK_10 }}
    >
      <ChromeWindowDecor />
      <div
        className="relative mt-3 rounded-b-3xl p-5 sm:p-7"
        style={{ backgroundColor: CREAM_PANEL }}
      >
        <button
          type="button"
          disabled
          className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55"
        >
          Fermer sans choisir
          <X className="h-3 w-3" aria-hidden />
        </button>

        <h3 className="mb-6 text-center font-serif text-[22px] font-black tracking-tight text-[#0D1B3E] sm:text-[26px]">
          Quel est votre objectif de mobilité ?
        </h3>

        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
          {specimens.map((spec) => (
            <div
              key={spec.slug}
              className="flex flex-col items-center gap-2 rounded-2xl border bg-white px-4 py-5 text-center"
              style={{ borderColor: INK_10 }}
            >
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: CREAM_SHELL }}
              >
                <spec.Icon
                  className="h-4 w-4"
                  style={{ color: INK_60 }}
                  aria-hidden
                />
              </span>
              <span className="font-serif text-[15px] font-black text-[#0D1B3E]">
                {spec.labelFr}
              </span>
              <span className="text-[11.5px] leading-tight text-[#0D1B3E]/55">
                {spec.teaserFr}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <span
            className="inline-flex items-center rounded-md border bg-white px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65"
            style={{ borderColor: INK_10 }}
          >
            z-index 200
          </span>
        </div>
      </div>
    </div>
  );
}

function DockShell({
  expanded,
  label = 'Études en France',
}: {
  expanded?: boolean;
  label?: string;
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 shadow-soft"
      style={{ borderColor: INK_10 }}
    >
      <div className="flex min-w-0 flex-col">
        <span className="font-mono text-[9px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/55">
          Objectif principal
        </span>
        <span className="mt-0.5 truncate text-[14px] font-bold text-[#0D1B3E]">{label}</span>
      </div>
      {expanded ? (
        <ChevronUp className="h-5 w-5 shrink-0" style={{ color: INK_60 }} aria-hidden />
      ) : (
        <ChevronDown className="h-5 w-5 shrink-0" style={{ color: INK_60 }} aria-hidden />
      )}
    </div>
  );
}

function StateTwoDockClosed() {
  return (
    <div
      className="flex h-full flex-col gap-5 rounded-3xl border bg-white p-6"
      style={{ borderColor: INK_10 }}
    >
      <div className="space-y-3">
        <span className="block h-2 w-3/4 rounded-full bg-[#0D1B3E]/10" aria-hidden />
        <span className="block h-2 w-2/3 rounded-full bg-[#0D1B3E]/10" aria-hidden />
        <span className="block h-2 w-4/5 rounded-full bg-[#0D1B3E]/10" aria-hidden />
        <span className="block h-2 w-1/2 rounded-full bg-[#0D1B3E]/10" aria-hidden />
        <span className="block h-2 w-3/5 rounded-full bg-[#0D1B3E]/10" aria-hidden />
      </div>

      <div className="mt-auto space-y-3">
        <div
          className="inline-flex flex-col gap-0.5 rounded-md border px-3 py-2"
          style={{ borderColor: INK_10, backgroundColor: CREAM_SHELL }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#0D1B3E]/55">
            --vf-objective-dock-height
          </span>
          <span className="font-mono text-[12px] font-black text-[#0D1B3E]">
            64px <span className="text-[#0D1B3E]/55">(fixed)</span>
          </span>
        </div>
        <DockShell />
      </div>
    </div>
  );
}

function StateThreeDockExpanded() {
  const options = [
    { label: 'Études en France', active: true },
    { label: 'Stage professionnel', active: false },
    { label: 'Travailler qualifié', active: false },
    { label: 'Passion Talent', active: false },
  ];

  return (
    <div
      className="flex h-full flex-col gap-3 rounded-3xl border bg-white p-6"
      style={{ borderColor: INK_10 }}
    >
      <div
        className="rounded-2xl border bg-white p-3 shadow-card"
        style={{ borderColor: INK_10 }}
        role="listbox"
        aria-label="Specimen — listbox objectifs"
      >
        <p className="mb-2 px-2 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
          Section active
        </p>
        <ol className="space-y-1">
          {options.map((opt) => (
            <li
              key={opt.label}
              className={
                opt.active
                  ? 'flex items-center gap-2 rounded-lg px-3 py-2'
                  : 'flex items-center gap-2 rounded-lg px-3 py-2 text-[#0D1B3E]/65'
              }
              style={opt.active ? { backgroundColor: ACCENT_SOFT, color: ACCENT } : undefined}
            >
              <span
                className={
                  opt.active
                    ? 'inline-block h-2 w-2 rounded-full'
                    : 'inline-block h-2 w-2 rounded-full bg-[#0D1B3E]/15'
                }
                style={opt.active ? { backgroundColor: ACCENT } : undefined}
                aria-hidden
              />
              <span
                className={
                  opt.active
                    ? 'text-[13.5px] font-semibold'
                    : 'text-[13.5px] font-medium'
                }
              >
                {opt.label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-auto">
        <DockShell expanded />
      </div>
    </div>
  );
}

export default function AzimuthSystemSheet() {
  const wizardTotal = USER_OBJECTIVES.length;
  return (
    <div className="space-y-12 text-[#0D1B3E]">
      <header className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between" style={{ borderColor: INK_10 }}>
        <div className="space-y-2">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/55">
            Technical Design Sheet
          </p>
          <h1 className="font-serif text-[clamp(2rem,3.5vw,2.6rem)] font-black leading-[1.05] tracking-tight">
            Azimuth System
          </h1>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
              Status
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-[#0D1B3E]">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
              Approved
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
              Version
            </span>
            <span className="font-semibold text-[#0D1B3E]">v1.2</span>
          </div>
        </div>
      </header>

      <section aria-labelledby="azimuth-state-1">
        <StateHeading
          index={1}
          title="Initial Discovery"
          description="Le wizard premier passage couvre tout l'écran (z-index 200) et fixe l'objectif de mobilité principal avant que la navigation standard ne reprenne."
        />
        <h2 id="azimuth-state-1" className="sr-only">
          State 1 — Initial Discovery wizard
        </h2>
        <StateOneWizard />
        <p className="mt-3 text-[12px] text-[#0D1B3E]/55">
          Le registre <code className="rounded bg-white px-1 py-0.5 font-mono">USER_OBJECTIVES</code>{' '}
          contient {wizardTotal} slugs typés, groupés en 7 catégories (
          <code className="rounded bg-white px-1 py-0.5 font-mono">USER_OBJECTIVE_CATEGORY_ORDER</code>).
        </p>
      </section>

      <section
        aria-labelledby="azimuth-state-2-3"
        className="grid gap-8 lg:grid-cols-2"
      >
        <h2 id="azimuth-state-2-3" className="sr-only">
          States 2 et 3 — dock fermé et listbox étendue
        </h2>
        <div>
          <StateHeading
            index={2}
            title="Dock Closed"
            description="Barre horizontale persistante (fixed, z-30) ancrée en bas. Maintient le contexte sans envahir le viewport."
          />
          <StateTwoDockClosed />
        </div>
        <div>
          <StateHeading
            index={3}
            title="Dock Expanded"
            description="Le panneau listbox ancré bottom-full s'ouvre vers le haut (z-80) au-dessus du dock pour permettre la modification rapide de l'objectif."
          />
          <StateThreeDockExpanded />
        </div>
      </section>

      <footer
        className="flex flex-wrap items-center justify-between gap-3 border-t pt-6 text-[12px] text-[#0D1B3E]/55"
        style={{ borderColor: INK_10 }}
      >
        <p>
          Sources runtime :{' '}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono">
            components/layout/AppObjectiveRoot.tsx
          </code>
          {' · '}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono">
            components/layout/SiteObjectiveDock.tsx
          </code>
          {' · '}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono">
            components/objectives/FirstVisitObjectiveWizard.tsx
          </code>
          {' · '}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono">
            components/objectives/DockObjectivePicker.tsx
          </code>
        </p>
        <Link
          href="/admin"
          className="font-mono text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65 transition-colors hover:text-[#0D1B3E]"
        >
          ← Citadel Admin Console
        </Link>
      </footer>
    </div>
  );
}
