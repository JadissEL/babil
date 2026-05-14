import {
  AlertCircle,
  ArrowLeft,
  CircleAlert,
  CircleUserRound,
  Clock,
  Globe,
  Search,
  Telescope,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const INK_10 = 'rgba(13,27,62,0.10)';
const INK_60 = 'rgba(13,27,62,0.60)';
const INK_45 = 'rgba(13,27,62,0.45)';
const CREAM_PANEL = '#FAF7EE';
const CREAM_HEADER = '#FDF8EF';
const SOFT_GRAY = '#F3F4F6';

function NumberedEyebrow({ index, label }: { index: string; label: string }) {
  return (
    <p className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/55">
      {index} {label}
    </p>
  );
}

function Annotation({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 max-w-md text-[12px] leading-relaxed text-[#0D1B3E]/65">
      <span className="font-semibold text-[#0D1B3E]">Annotation:</span> {children}
    </p>
  );
}

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
        <span>Research</span>
        <span>Strategy</span>
        <span>Compliance</span>
        <span>Archives</span>
        <span className="border-b border-[#0D1B3E] pb-0.5 text-[#0D1B3E]">Global Waypoint</span>
      </nav>
      <div className="flex items-center gap-3">
        <Search className="h-4 w-4" style={{ color: INK_60 }} />
        <CircleUserRound className="h-5 w-5" style={{ color: INK_60 }} />
      </div>
    </div>
  );
}

function DesktopTriggerSpecimen() {
  return (
    <div
      className="rounded-2xl border bg-white p-6"
      style={{ borderColor: INK_10 }}
    >
      <p className="mb-4 text-right font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/45">
        Desktop
      </p>
      <div className="flex justify-start">
        <span
          className="inline-flex items-center gap-2 rounded-full border bg-white pl-4 pr-2 py-2 text-[13px] text-[#0D1B3E]/55 shadow-[0_1px_0_rgba(13,27,62,0.04)]"
          style={{ borderColor: INK_10 }}
        >
          <Search className="h-3.5 w-3.5" style={{ color: INK_60 }} aria-hidden />
          Search destinations...
          <span
            className="ml-2 inline-flex items-center rounded-md border bg-white px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#0D1B3E]"
            style={{ borderColor: INK_10 }}
          >
            ⌘K
          </span>
        </span>
      </div>
      <Annotation>
        Full expanded trigger on wide viewports. Keyboard shortcut explicitly displayed to encourage
        power-user behavior.
      </Annotation>
    </div>
  );
}

function MobileTriggerSpecimen() {
  return (
    <div
      className="rounded-2xl border bg-white p-6"
      style={{ borderColor: INK_10 }}
    >
      <p className="mb-4 text-right font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/45">
        Mobile
      </p>
      <div className="flex justify-start">
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white shadow-[0_1px_0_rgba(13,27,62,0.04)]"
          style={{ borderColor: INK_10 }}
        >
          <Search className="h-4 w-4" style={{ color: INK_60 }} aria-hidden />
        </span>
      </div>
      <Annotation>
        Collapsed to icon-only on breakpoints &lt; md. Triggers full-screen overlay when tapped.
      </Annotation>
    </div>
  );
}

function CommandPaletteSpecimen() {
  const rows: { name: string; region: string; highlight?: boolean }[] = [
    { name: 'France', region: 'European Union' },
    { name: 'Canada', region: 'North America', highlight: true },
    { name: 'Spain', region: 'European Union' },
  ];

  return (
    <div
      className="rounded-2xl border p-8"
      style={{ borderColor: INK_10, backgroundColor: CREAM_PANEL }}
    >
      <div
        className="mx-auto max-w-md overflow-hidden rounded-2xl border bg-white shadow-[0_24px_60px_rgba(13,27,62,0.10)]"
        style={{ borderColor: INK_10 }}
        role="dialog"
        aria-label="Specimen — desktop command palette"
      >
        <div
          className="flex items-center gap-3 border-b px-5 py-3.5"
          style={{ borderColor: INK_10 }}
        >
          <Search className="h-4 w-4 shrink-0" style={{ color: INK_60 }} aria-hidden />
          <span className="flex-1 text-[14px] text-[#0D1B3E]">Can</span>
          <span
            className="inline-flex items-center rounded-md border bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-[#0D1B3E]"
            style={{ borderColor: INK_10 }}
          >
            ESC
          </span>
        </div>
        <div className="px-5 pt-4">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
            Destinations
          </p>
        </div>
        <ol className="pb-2 pt-1">
          {rows.map((row) => (
            <li
              key={row.name}
              className="relative flex items-center gap-3 px-5 py-3 transition-colors"
              style={
                row.highlight
                  ? {
                      backgroundColor: 'rgba(13,27,62,0.06)',
                      boxShadow: `inset 3px 0 0 #0D1B3E`,
                    }
                  : undefined
              }
            >
              <Globe className="h-4 w-4 shrink-0" style={{ color: INK_60 }} aria-hidden />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="text-[14px] font-semibold text-[#0D1B3E]">{row.name}</span>
                <span className="text-[12px] text-[#0D1B3E]/55">{row.region}</span>
              </div>
              {row.highlight ? (
                <ArrowLeft className="h-3.5 w-3.5" style={{ color: INK_60 }} aria-hidden />
              ) : null}
            </li>
          ))}
        </ol>
        <div
          className="flex items-center justify-between gap-3 border-t px-5 py-2.5"
          style={{ borderColor: INK_10 }}
        >
          <span className="text-[11px] text-[#0D1B3E]/55">Use arrows to navigate</span>
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
            Z-Index: 70
          </span>
        </div>
      </div>
    </div>
  );
}

function MobileOverlaySpecimen() {
  return (
    <div
      className="rounded-2xl border p-8"
      style={{ borderColor: INK_10, backgroundColor: SOFT_GRAY }}
    >
      <div
        className="mx-auto max-w-sm overflow-hidden rounded-2xl border bg-white shadow-[0_24px_60px_rgba(13,27,62,0.18)]"
        style={{ borderColor: INK_10 }}
        role="dialog"
        aria-label="Specimen — mobile overlay"
      >
        <div
          className="flex items-center gap-3 border-b px-4 py-3"
          style={{ borderColor: INK_10 }}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" style={{ color: INK_60 }} aria-hidden />
          <span className="flex-1 text-[14px] text-[#0D1B3E]/55">Search...</span>
        </div>
        <div className="px-4 pt-4">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
            Recent Searches
          </p>
        </div>
        <ol className="pb-3 pt-1">
          {['United Kingdom', 'Japan'].map((name) => (
            <li
              key={name}
              className="flex items-center gap-3 px-4 py-3 text-[14px] font-semibold text-[#0D1B3E]"
            >
              <Clock className="h-4 w-4 shrink-0" style={{ color: INK_60 }} aria-hidden />
              <span>{name}</span>
            </li>
          ))}
        </ol>
      </div>
      <p className="mt-5 text-center font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/45">
        System Keyboard
      </p>
    </div>
  );
}

function StateLoadingCard() {
  return (
    <div
      className="rounded-2xl border bg-white px-6 py-7"
      style={{ borderColor: INK_10 }}
    >
      <div className="flex items-center justify-center gap-1.5 text-[#0D1B3E]/45" aria-hidden>
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0D1B3E]/45" />
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0D1B3E]/30" />
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0D1B3E]/20" />
      </div>
      <p className="mt-3 text-center text-[13px] text-[#0D1B3E]/65">Querying database...</p>
    </div>
  );
}

function StateEmptyCard() {
  return (
    <div
      className="rounded-2xl border bg-white px-6 py-7 text-center"
      style={{ borderColor: INK_10 }}
    >
      <Telescope className="mx-auto h-6 w-6" style={{ color: INK_60 }} aria-hidden />
      <p className="mt-3 font-semibold text-[#0D1B3E]">No results found</p>
      <p className="text-[12px] text-[#0D1B3E]/55">Try a different term</p>
    </div>
  );
}

function StateErrorCard() {
  return (
    <div
      className="overflow-hidden rounded-2xl border bg-white px-6 py-7 text-center shadow-[inset_0_3px_0_#DC2626]"
      style={{ borderColor: INK_10 }}
    >
      <AlertCircle className="mx-auto h-6 w-6" style={{ color: '#DC2626' }} aria-hidden />
      <p className="mt-3 font-semibold text-[#DC2626]">Connection Interrupted</p>
      <p className="text-[12px] text-[#0D1B3E]/55">Unable to reach terminal servers</p>
    </div>
  );
}

export default function WaypointSystemSheet() {
  return (
    <div
      className="overflow-hidden rounded-2xl border bg-white text-[#0D1B3E]"
      style={{ borderColor: INK_10 }}
    >
      <MockChromeBar />

      <div className="space-y-12 px-6 py-10 sm:px-10 sm:py-12" style={{ backgroundColor: CREAM_PANEL }}>
        <header className="max-w-2xl space-y-3">
          <h1 className="font-serif text-[clamp(2rem,3.5vw,2.6rem)] font-black leading-[1.05] tracking-tight">
            PAGE 45 — WAYPOINT
          </h1>
          <p className="text-[13.5px] leading-relaxed text-[#0D1B3E]/65">
            Technical design sheet detailing the interactions, states, and visual structure of the
            global country search mechanism within the Research Terminal environment.
          </p>
        </header>

        <section aria-labelledby="waypoint-section-1" className="border-t pt-8" style={{ borderColor: INK_10 }}>
          <h2 id="waypoint-section-1" className="sr-only">
            1.0 Header triggers
          </h2>
          <NumberedEyebrow index="1.0" label="Header Triggers" />
          <div className="grid gap-5 md:grid-cols-2">
            <DesktopTriggerSpecimen />
            <MobileTriggerSpecimen />
          </div>
        </section>

        <section aria-labelledby="waypoint-section-2" className="border-t pt-8" style={{ borderColor: INK_10 }}>
          <h2 id="waypoint-section-2" className="sr-only">
            2.0 Desktop command palette and 3.0 Mobile overlay
          </h2>
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <NumberedEyebrow index="2.0" label="Desktop Command Palette" />
              <CommandPaletteSpecimen />
            </div>
            <div>
              <NumberedEyebrow index="3.0" label="Mobile Overlay" />
              <MobileOverlaySpecimen />
            </div>
          </div>
        </section>

        <section aria-labelledby="waypoint-section-4" className="border-t pt-8" style={{ borderColor: INK_10 }}>
          <h2 id="waypoint-section-4" className="sr-only">
            4.0 System states
          </h2>
          <NumberedEyebrow index="4.0" label="System States" />
          <div className="grid gap-5 sm:grid-cols-3">
            <StateLoadingCard />
            <StateEmptyCard />
            <StateErrorCard />
          </div>
        </section>

        <section
          className="rounded-2xl border bg-white p-6"
          style={{ borderColor: INK_10 }}
          aria-labelledby="waypoint-runtime-title"
        >
          <h2
            id="waypoint-runtime-title"
            className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/55"
          >
            <CircleAlert className="h-3.5 w-3.5" style={{ color: INK_45 }} aria-hidden />
            Runtime contract
          </h2>
          <ul className="mt-4 grid gap-3 text-[13px] leading-relaxed text-[#0D1B3E]/75 sm:grid-cols-2">
            <li>
              <strong className="font-semibold text-[#0D1B3E]">Source données :</strong>{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">
                GET /api/countries?light=1
              </code>{' '}
              + <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">
                normalizeCountriesApiListResponse
              </code>
              .
            </li>
            <li>
              <strong className="font-semibold text-[#0D1B3E]">Préchargement :</strong>{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">
                requestIdleCallback
              </code>{' '}
              avec fallback{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">setTimeout(500ms)</code>;
              re-fetch garanti à l&apos;ouverture du dialogue.
            </li>
            <li>
              <strong className="font-semibold text-[#0D1B3E]">Raccourci :</strong>{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">⌘K</code> /{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">Ctrl+K</code>{' '}
              (libellé via <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">useAppleLikePlatform</code>) ;
              court-circuité quand palette fermée et focus sur champ éditable.
            </li>
            <li>
              <strong className="font-semibold text-[#0D1B3E]">Z-index :</strong> backdrop{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">z-[60]</code> · dialogue{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">z-[70]</code>{' '}
              (au-dessus du header z-50, sous toasts z-[100] et wizard z-[200]).
            </li>
            <li>
              <strong className="font-semibold text-[#0D1B3E]">Bornes liste :</strong> 14 entrées
              sans requête, max 24 avec filtre substring (lowercase). Navigation flèches modulo
              longueur ;{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">onMouseEnter</code>{' '}
              met à jour l&apos;index.
            </li>
            <li>
              <strong className="font-semibold text-[#0D1B3E]">Dock objectif :</strong> hauteur max
              du panneau respecte{' '}
              <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">
                --vf-objective-dock-height
              </code>{' '}
              + <code className="rounded bg-[#F5F0E3] px-1 py-0.5 font-mono">safe-area-inset-bottom</code>{' '}
              (cf. PAGE 41).
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
              components/nav/GlobalCountrySearch.tsx
            </code>{' '}
            · normalizer :{' '}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono">
              lib/country-full-data-materialize.ts
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
