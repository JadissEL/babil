import { Anchor, Globe, Heart, LayoutDashboard, Menu, Ship } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const INK_10 = 'rgba(13,27,62,0.10)';
const CREAM_HEADER = '#FDF8EF';
const ROSE_SOFT = 'rgba(244,114,182,0.16)';
const ROSE_TONE = '#BE185D';

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: typeof Ship;
  title: string;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border bg-white text-[#0D1B3E]"
        style={{ borderColor: INK_10 }}
        aria-hidden
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <h2 className="font-serif text-[22px] font-black tracking-tight text-[#0D1B3E]">
        {title}
      </h2>
    </div>
  );
}

function GhostBar({ widthClass = 'w-24' }: { widthClass?: string }) {
  return (
    <span
      className={`block h-2 rounded-full ${widthClass}`}
      style={{ backgroundColor: 'rgba(13,27,62,0.10)' }}
      aria-hidden
    />
  );
}

function HeaderSpecimen({ signedIn }: { signedIn: boolean }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border bg-white shadow-[0_1px_0_rgba(13,27,62,0.04)]"
      style={{ borderColor: INK_10 }}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6"
        style={{ borderColor: INK_10, backgroundColor: CREAM_HEADER }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            disabled
            className="rounded-md border bg-white p-1.5 text-[#0D1B3E]/60"
            style={{ borderColor: INK_10 }}
            aria-label="Specimen menu (read-only)"
          >
            <Menu className="h-4 w-4" aria-hidden />
          </button>
          <span className="flex items-center gap-2">
            <span className="rounded-lg bg-[#0D1B3E] p-1.5 text-white" aria-hidden>
              <Globe className="h-4 w-4" />
            </span>
            <span className="font-serif text-base font-black tracking-tighter text-[#0D1B3E]">
              VisaFlow
            </span>
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <span
            className="hidden h-9 w-44 items-center rounded-xl border bg-white/80 px-3 sm:flex"
            style={{ borderColor: INK_10 }}
            aria-hidden
          >
            <GhostBar widthClass="w-28" />
          </span>

          {signedIn ? (
            <>
              <span
                className="inline-flex items-center gap-1.5 rounded-xl border bg-white px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]"
                style={{ borderColor: INK_10 }}
              >
                <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
                Tableau de bord
              </span>
              <span
                className="inline-block h-8 w-8 rounded-full"
                style={{
                  backgroundColor: 'rgba(13,27,62,0.10)',
                  border: '2px solid #FDF8EF',
                }}
                aria-hidden
              />
            </>
          ) : (
            <>
              <span className="inline-flex items-center rounded-xl bg-[#0D1B3E]/85 px-5 py-2 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-white">
                Connexion
              </span>
              <span
                className="inline-flex items-center rounded-xl border bg-white px-5 py-2 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]"
                style={{ borderColor: INK_10 }}
              >
                S&apos;inscrire
              </span>
            </>
          )}
        </div>
      </div>

      <div
        className="space-y-2 px-4 py-5 sm:px-6"
        style={{ backgroundColor: '#FBF6E9' }}
        aria-hidden
      >
        <div className="grid grid-cols-4 gap-3">
          <GhostBar widthClass="w-full" />
          <GhostBar widthClass="w-full" />
          <GhostBar widthClass="w-full" />
          <GhostBar widthClass="w-full" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          <GhostBar widthClass="w-2/3" />
          <GhostBar widthClass="w-3/4" />
          <GhostBar widthClass="w-1/2" />
          <GhostBar widthClass="w-3/4" />
        </div>
      </div>
    </div>
  );
}

function HeaderSpecimenRow({
  label,
  signedIn,
}: {
  label: string;
  signedIn: boolean;
}) {
  return (
    <div className="grid grid-cols-[20px_1fr] items-stretch gap-3 sm:grid-cols-[24px_1fr]">
      <div className="relative">
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/45"
          aria-hidden
        >
          {label}
        </span>
        <span className="sr-only">{label}</span>
      </div>
      <HeaderSpecimen signedIn={signedIn} />
    </div>
  );
}

function FooterSpecimen() {
  return (
    <div
      className="rounded-2xl border bg-white"
      style={{ borderColor: INK_10 }}
    >
      <div
        className="rounded-t-2xl px-8 py-10 text-center"
        style={{ backgroundColor: CREAM_HEADER }}
      >
        <div className="mx-auto flex flex-col items-center gap-5">
          <span className="flex items-center gap-2" aria-hidden>
            <span className="rounded-lg bg-[#0D1B3E] p-1.5 text-white">
              <Globe className="h-4 w-4" />
            </span>
            <span className="font-serif text-lg font-black tracking-tight text-[#0D1B3E]">
              VisaFlow
            </span>
          </span>
          <nav
            aria-label="Specimen — liens footer"
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12.5px] text-[#0D1B3E]/65"
          >
            <span>PayPal Donation</span>
            <span>Mentions Légales</span>
            <span>Contact</span>
          </nav>
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0D1B3E]/[0.06] px-4 py-2 text-[12px] font-semibold text-[#0D1B3E]"
            aria-hidden
          >
            <Heart className="h-3.5 w-3.5" aria-hidden />
            Soutenir le projet
            <span className="ml-1 inline-flex items-center rounded-md bg-white px-1.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/55">
              ext
            </span>
          </span>
          <p className="text-[11.5px] text-[#0D1B3E]/55">
            © VisaFlow Research Terminal. Tous droits réservés.
          </p>
        </div>
      </div>

      <div
        className="rounded-b-2xl border-t px-8 py-5 text-center"
        style={{ borderColor: INK_10, backgroundColor: ROSE_SOFT }}
      >
        <span
          className="font-mono text-[10px] font-black uppercase tracking-[0.28em]"
          style={{ color: ROSE_TONE }}
        >
          SiteObjectiveDock Clearance (5.5rem)
        </span>
      </div>
    </div>
  );
}

export default function HarborMasterReferenceSheet() {
  return (
    <div className="space-y-12 text-[#0D1B3E]">
      <header className="max-w-2xl space-y-2">
        <h1 className="font-serif text-[clamp(2rem,3.5vw,2.6rem)] font-black leading-[1.05] tracking-tight">
          Harbor Master Reference
        </h1>
        <p className="text-[13.5px] text-[#0D1B3E]/65">
          Shared Components Architecture &amp; Identity Tokens
        </p>
      </header>

      <section aria-labelledby="harbor-header-title" className="space-y-8">
        <SectionHeader icon={Ship} title="SiteHeader – Global Navigation & Auth" />
        <div className="space-y-6">
          <HeaderSpecimenRow label="State : Signed Out" signedIn={false} />
          <HeaderSpecimenRow label="State : Signed In" signedIn />
        </div>
        <p
          className="border-t pt-4 text-[12.5px] leading-relaxed text-[#0D1B3E]/60"
          style={{ borderColor: INK_10 }}
        >
          Conteneur <code className="rounded bg-white px-1 py-0.5 font-mono">sticky top-0 z-50</code>,{' '}
          <code className="rounded bg-white px-1 py-0.5 font-mono">max-w-[1600px]</code>, fond papier{' '}
          <code className="rounded bg-white px-1 py-0.5 font-mono">#fdf8ef/90</code>{' '}
          + <code className="rounded bg-white px-1 py-0.5 font-mono">backdrop-blur</code>. Le bouton menu
          n&apos;apparaît que si <code className="rounded bg-white px-1 py-0.5 font-mono">onPrimaryNavOpen</code>{' '}
          est passé (pattern <code className="rounded bg-white px-1 py-0.5 font-mono">SiteChrome</code> · PAGE 34).
        </p>
      </section>

      <section aria-labelledby="harbor-footer-title" className="space-y-6">
        <SectionHeader icon={Anchor} title="SiteFooter – Trust & Logistics" />
        <FooterSpecimen />
        <p
          className="border-t pt-4 text-[12.5px] leading-relaxed text-[#0D1B3E]/60"
          style={{ borderColor: INK_10 }}
        >
          Padding bas dynamique{' '}
          <code className="rounded bg-white px-1 py-0.5 font-mono">
            pb-[calc(var(--vf-objective-dock-height,5.5rem)+1.5rem)]
          </code>{' '}
          pour laisser le dock objectif (PAGE 41) et le{' '}
          <code className="rounded bg-white px-1 py-0.5 font-mono">safe-area-inset-bottom</code>{' '}
          flotter sans masquer le copyright. Le lien PayPal porte{' '}
          <code className="rounded bg-white px-1 py-0.5 font-mono">target=&quot;_blank&quot;</code>{' '}
          et <code className="rounded bg-white px-1 py-0.5 font-mono">rel=&quot;noopener noreferrer&quot;</code>.
        </p>
      </section>

      <footer
        className="flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-[12px] text-[#0D1B3E]/55"
        style={{ borderColor: INK_10 }}
      >
        <p>
          Source runtime :{' '}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono">
            components/layout/SiteHeader.tsx
          </code>{' '}
          (exports <code className="rounded bg-white px-1 py-0.5 font-mono">SiteHeader</code>{' '}
          + <code className="rounded bg-white px-1 py-0.5 font-mono">SiteFooter</code>). Monté par{' '}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono">
            components/layout/SiteChrome.tsx
          </code>{' '}
          (PAGE 34).
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
