import {
  ArrowLeftRight,
  Award,
  Briefcase,
  CircleUserRound,
  Compass,
  FileText,
  FlaskConical,
  GraduationCap,
  Headphones,
  Landmark,
  Map,
  Menu,
  Sliders,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const INK_10 = 'rgba(13,27,62,0.10)';
const INK_60 = 'rgba(13,27,62,0.60)';
const CREAM_PANEL = '#FAF7EE';
const CREAM_HEADER = '#FDF8EF';
const ACCENT_SOFT = 'rgba(59,125,255,0.10)';
const ACCENT = '#3B7DFF';
const ROSE_TONE = '#BE185D';
const ROSE_SOFT = 'rgba(244,114,182,0.16)';

type RailItem = {
  label: string;
  Icon: typeof Compass;
  active?: boolean;
};

const RAIL_ITEMS: RailItem[] = [
  { label: 'Explorer', Icon: Compass },
  { label: 'Schengen', Icon: Map },
  { label: 'Comparer', Icon: ArrowLeftRight, active: true },
  { label: 'Visa Engine', Icon: Sliders },
  { label: 'Recommendation Lab', Icon: FlaskConical },
  { label: 'Assist', Icon: Headphones },
  { label: 'Education', Icon: GraduationCap },
  { label: 'Community', Icon: Users },
  { label: 'Business', Icon: Briefcase },
  { label: 'Permits', Icon: FileText },
  { label: 'Investment', Icon: Landmark },
];

const MOBILE_DRAWER_ITEMS: RailItem[] = [
  { label: 'Explorer', Icon: Compass },
  { label: 'Schengen', Icon: Map },
  { label: 'Comparer', Icon: ArrowLeftRight, active: true },
  { label: 'Visa Engine', Icon: Sliders },
];

function StateEyebrow({ label }: { label: string }) {
  return (
    <p className="mb-3 flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/55">
      <span className="inline-block h-2 w-2 rounded-full bg-[#0D1B3E]/45" aria-hidden />
      {label}
    </p>
  );
}

function RailLink({ item }: { item: RailItem }) {
  return (
    <span
      className="flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-semibold transition-colors"
      style={
        item.active
          ? { backgroundColor: ACCENT_SOFT, color: ACCENT }
          : { color: INK_60 }
      }
    >
      <item.Icon
        className="h-4 w-4 shrink-0"
        style={{ color: item.active ? ACCENT : INK_60 }}
        aria-hidden
      />
      <span className="leading-tight">{item.label}</span>
    </span>
  );
}

function DesktopRailSpecimen() {
  return (
    <div
      className="grid grid-cols-1 overflow-hidden rounded-2xl border bg-white md:grid-cols-[260px_1fr]"
      style={{ borderColor: INK_10 }}
    >
      {/* Sticky rail */}
      <aside
        className="flex flex-col gap-5 border-b p-5 md:border-b-0 md:border-r"
        style={{ borderColor: INK_10, backgroundColor: CREAM_HEADER }}
      >
        <div>
          <p className="font-serif text-[22px] font-black tracking-tight text-[#0D1B3E]">
            VisaFlow
          </p>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/55">
            Global Mobility Suite
          </p>
        </div>
        <ol className="space-y-0.5">
          {RAIL_ITEMS.map((item) => (
            <li key={item.label}>
              <RailLink item={item} />
            </li>
          ))}
        </ol>
        <div className="mt-auto">
          <span
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[12px] font-bold text-white"
            style={{ backgroundColor: '#0D1B3E' }}
          >
            Upgrade to Premium
            <Award className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </aside>

      {/* Stage preview */}
      <div className="relative px-6 py-7 sm:px-10">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/55">
          Compare Visas
        </p>
        <h3 className="mt-2 font-serif text-[28px] font-black leading-[1.05] tracking-tight text-[#0D1B3E] sm:text-[32px]">
          Schengen
          <br />
          Assessment
        </h3>

        <div className="mt-7 grid grid-cols-2 gap-4">
          <div
            className="aspect-[5/4] rounded-2xl border"
            style={{ borderColor: INK_10, backgroundColor: '#FFFFFF' }}
            aria-hidden
          />
          <div
            className="aspect-[5/4] rounded-2xl border"
            style={{ borderColor: INK_10, backgroundColor: '#FFFFFF' }}
            aria-hidden
          />
        </div>

        <div
          className="pointer-events-none absolute right-6 top-6 max-w-[280px] rounded-xl border bg-[#FFF1F2] p-3 text-[11px] leading-relaxed shadow-[0_8px_24px_rgba(190,24,93,0.18)]"
          style={{ borderColor: 'rgba(190,24,93,0.18)' }}
        >
          <p className="font-mono text-[9px] font-black uppercase tracking-[0.24em]" style={{ color: ROSE_TONE }}>
            Technical Annotation
          </p>
          <pre className="mt-1.5 whitespace-pre-wrap font-mono text-[11px] leading-[1.55] text-[#0D1B3E]/80">
{`position: sticky; top: 0;
height: 100vh; overflow-y: auto;`}
          </pre>
        </div>
      </div>
    </div>
  );
}

function MobileHeaderClosedSpecimen() {
  return (
    <div
      className="rounded-2xl border bg-white"
      style={{ borderColor: INK_10 }}
    >
      <div
        className="flex items-center justify-between gap-3 rounded-t-2xl px-4 py-3"
        style={{ backgroundColor: CREAM_HEADER }}
      >
        <div className="flex items-center gap-3">
          <Menu className="h-5 w-5" style={{ color: INK_60 }} aria-hidden />
          <span className="font-serif text-base font-black tracking-tight text-[#0D1B3E]">
            VisaFlow
          </span>
        </div>
        <CircleUserRound className="h-6 w-6" style={{ color: INK_60 }} aria-hidden />
      </div>
      <div className="h-28 rounded-b-2xl bg-white" aria-hidden />
    </div>
  );
}

function MobileDrawerOpenSpecimen() {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Backdrop overlay */}
      <div
        className="relative h-[420px] rounded-2xl border bg-white"
        style={{ borderColor: INK_10 }}
      >
        {/* Right backdrop annotation overlay */}
        <div
          className="absolute inset-y-0 right-0 w-[40%] rounded-r-2xl"
          style={{ backgroundColor: 'rgba(13,27,62,0.55)' }}
          aria-hidden
        />
        <div
          className="absolute right-3 top-4 max-w-[150px] rounded-md border bg-[#FFF1F2] px-2.5 py-1.5 text-[10px] font-mono leading-tight"
          style={{ borderColor: 'rgba(190,24,93,0.18)' }}
        >
          <p className="font-mono text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: ROSE_TONE }}>
            Backdrop
          </p>
          <p className="text-[#0D1B3E]/80">z-index: 40;</p>
          <p className="text-[#0D1B3E]/80">bg-primary/40</p>
        </div>

        {/* Drawer */}
        <aside
          className="relative z-[2] flex h-full w-[68%] flex-col border-r p-4"
          style={{ borderColor: INK_10, backgroundColor: CREAM_HEADER }}
          aria-label="Specimen — mobile drawer"
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="font-serif text-[18px] font-black tracking-tight text-[#0D1B3E]">
              Menu
            </span>
            <X className="h-5 w-5" style={{ color: INK_60 }} aria-hidden />
          </div>
          <ol className="space-y-0.5">
            {MOBILE_DRAWER_ITEMS.map((item) => (
              <li key={item.label}>
                <RailLink item={item} />
              </li>
            ))}
          </ol>
        </aside>
      </div>

      <div
        className="mt-4 rounded-xl border bg-white p-3"
        style={{ borderColor: INK_10 }}
      >
        <p
          className="font-mono text-[10px] font-black uppercase tracking-[0.22em]"
          style={{ color: ROSE_TONE }}
        >
          Drawer Layout
        </p>
        <pre className="mt-1.5 whitespace-pre-wrap font-mono text-[11px] leading-[1.55] text-[#0D1B3E]/80">
{`position: fixed; left: 0;
z-index: 50; w-[280px];`}
        </pre>
      </div>
    </div>
  );
}

export default function QuayNavigationSystemSheet() {
  return (
    <div className="space-y-12 text-[#0D1B3E]" style={{ backgroundColor: CREAM_PANEL }}>
      <header className="max-w-2xl space-y-3">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/55">
          Design System Specification
        </p>
        <h1 className="font-serif text-[clamp(2rem,3.5vw,2.6rem)] font-black leading-[1.05] tracking-tight">
          Quay Navigation System
        </h1>
        <p className="text-[13.5px] leading-relaxed text-[#0D1B3E]/65">
          Technical design sheet illustrating the structural states of the primary navigation
          rail. &quot;Paper &amp; Ink&quot; aesthetic emphasizing typography over heavy
          containment boundaries.
        </p>
      </header>

      <div
        className="border-t pt-8"
        style={{ borderColor: INK_10 }}
      >
        <div className="grid gap-8 lg:grid-cols-[1.7fr_1fr]">
          <section aria-labelledby="quay-state-01" className="space-y-3">
            <h2 id="quay-state-01" className="sr-only">
              State 01 — Desktop rail (sticky)
            </h2>
            <StateEyebrow label="State 01 : Desktop Rail (Sticky)" />
            <DesktopRailSpecimen />
          </section>

          <section aria-labelledby="quay-state-02-03" className="space-y-8">
            <h2 id="quay-state-02-03" className="sr-only">
              States 02 et 03 — mobile header & drawer
            </h2>
            <div>
              <StateEyebrow label="State 03 : Mobile Header (Closed)" />
              <MobileHeaderClosedSpecimen />
            </div>
            <div>
              <StateEyebrow label="State 02 : Mobile Drawer (Open)" />
              <MobileDrawerOpenSpecimen />
            </div>
          </section>
        </div>
      </div>

      <section
        className="rounded-2xl border bg-white p-6"
        style={{ borderColor: INK_10 }}
        aria-labelledby="quay-runtime-title"
      >
        <h2
          id="quay-runtime-title"
          className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/55"
        >
          Runtime contract
        </h2>
        <ul className="mt-4 grid gap-3 text-[13px] leading-relaxed text-[#0D1B3E]/75 sm:grid-cols-2">
          <li>
            <strong className="font-semibold text-[#0D1B3E]">Z-index:</strong> aside{' '}
            <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">z-[56]</code> · backdrop{' '}
            <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">z-[55]</code> · header{' '}
            <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">z-50</code> (PAGE 43) ·
            dock <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">z-30</code>{' '}
            (PAGE 41).
          </li>
          <li>
            <strong className="font-semibold text-[#0D1B3E]">Sticky:</strong>{' '}
            <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">lg:sticky</code>{' '}
            <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">lg:top-16</code>{' '}
            <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">
              lg:h-[calc(100dvh-4rem)]
            </code>{' '}
            <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">lg:w-56</code>.
          </li>
          <li>
            <strong className="font-semibold text-[#0D1B3E]">Drawer width:</strong>{' '}
            <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">
              w-[min(19rem,88vw)]
            </code>{' '}
            ; transition{' '}
            <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">
              translate-x-full → translate-x-0
            </code>
            .
          </li>
          <li>
            <strong className="font-semibold text-[#0D1B3E]">Liens dynamiques:</strong> Explorer
            et Comparer dérivés de{' '}
            <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">
              preference.primarySlug
            </code>{' '}
            via{' '}
            <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">
              ctaExploreHref / ctaCompareHref
            </code>{' '}
            (PAGE 41).
          </li>
          <li>
            <strong className="font-semibold text-[#0D1B3E]">A11y:</strong>{' '}
            <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">aria-current=&quot;page&quot;</code>{' '}
            sur le lien actif ; backdrop{' '}
            <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">aria-hidden</code>{' '}
            quand fermé ; scroll lock global sur{' '}
            <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">documentElement</code>.
          </li>
          <li>
            <strong className="font-semibold text-[#0D1B3E]">Clavier:</strong>{' '}
            <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">Escape</code> ferme le
            drawer (hook{' '}
            <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">
              useSitePrimaryNavState
            </code>
            ).
          </li>
        </ul>
        <p
          className="mt-5 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.22em]"
          style={{ borderColor: 'rgba(190,24,93,0.25)', backgroundColor: ROSE_SOFT, color: ROSE_TONE }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ROSE_TONE }} aria-hidden />
          Stitch ↔ Runtime: lg:left-56 du dock objectif doit suivre le changement de lg:w-56 du
          rail (cf. PAGE 41).
        </p>
      </section>

      <footer
        className="flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-[12px] text-[#0D1B3E]/55"
        style={{ borderColor: INK_10 }}
      >
        <p>
          Source runtime :{' '}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono">
            components/layout/SitePrimaryNav.tsx
          </code>{' '}
          (exports{' '}
          <code className="rounded bg-white px-1 py-0.5 font-mono">SitePrimaryNavColumn</code>,{' '}
          <code className="rounded bg-white px-1 py-0.5 font-mono">SiteHeaderMenuButton</code>,{' '}
          <code className="rounded bg-white px-1 py-0.5 font-mono">useSitePrimaryNavState</code>).
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
