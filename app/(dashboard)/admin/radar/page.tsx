import { auth } from '@clerk/nextjs/server';
import { ArrowDown, Bug, KeyRound, Sliders } from 'lucide-react';
import Link from 'next/link';
import { sentryAnonymizedUserKey } from '@/lib/sentry-anon-user-id';

export const dynamic = 'force-dynamic';

const INK_10 = 'rgba(13,27,62,0.10)';
const CREAM_SHELL = '#FAF7EE';
const CREAM_PANEL = '#F5F0E3';
const ACCENT = '#3B7DFF';
const ACCENT_SOFT = 'rgba(59,125,255,0.10)';

function resolveEnvironment(): string {
  return (
    process.env.NEXT_PUBLIC_VERCEL_ENV ||
    process.env.VERCEL_ENV ||
    process.env.NODE_ENV ||
    'development'
  );
}

function resolveSampleRate(): string {
  const raw = process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE;
  if (!raw) return '0.1';
  const n = Number(raw);
  if (!Number.isFinite(n)) return raw;
  return n.toString();
}

function dsnConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
}

async function buildSampleAnonId(currentUserId: string | null): Promise<string> {
  try {
    const raw = currentUserId ?? 'demo_anonymous_seed';
    const key = await sentryAnonymizedUserKey(raw);
    return key;
  } catch {
    return 'u_4a8b1f7c0d2e3b6f';
  }
}

function SectionHeader({ icon: Icon, label }: { icon: typeof KeyRound; label: string }) {
  return (
    <div className="mb-5 flex items-center gap-2">
      <Icon className="h-3.5 w-3.5" style={{ color: 'rgba(13,27,62,0.55)' }} aria-hidden />
      <span className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#0D1B3E]/55">
        {label}
      </span>
    </div>
  );
}

function PipelineStep({
  eyebrow,
  title,
  hint,
  highlighted,
}: {
  eyebrow: string;
  title: string;
  hint?: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border px-4 py-3 text-center"
      style={{
        borderColor: highlighted ? 'rgba(59,125,255,0.40)' : INK_10,
        backgroundColor: highlighted ? ACCENT_SOFT : CREAM_PANEL,
      }}
    >
      <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55">
        {eyebrow}
      </p>
      <p className="mt-1 font-mono text-[13px] font-semibold text-[#0D1B3E]">{title}</p>
      {hint ? (
        <p className="mt-1 font-mono text-[11px] text-[#0D1B3E]/55">↳ {hint}</p>
      ) : null}
    </div>
  );
}

function PipelineArrow() {
  return (
    <div className="flex justify-center py-2">
      <ArrowDown className="h-4 w-4" style={{ color: 'rgba(13,27,62,0.35)' }} aria-hidden />
    </div>
  );
}

function SynchronizationLogicCard({ sampleAnonId }: { sampleAnonId: string }) {
  const previewSlice = sampleAnonId.length > 9 ? `${sampleAnonId.slice(0, 9)}...` : sampleAnonId;
  return (
    <section
      className="rounded-2xl border bg-white p-6"
      style={{ borderColor: INK_10 }}
      aria-labelledby="radar-sync-title"
    >
      <h2 id="radar-sync-title" className="sr-only">
        Synchronization Logic
      </h2>
      <SectionHeader icon={KeyRound} label="Synchronization Logic" />
      <div>
        <PipelineStep eyebrow="Input" title="Clerk raw user id" />
        <PipelineArrow />
        <PipelineStep
          eyebrow="Process Pipeline"
          title="SHA-256 Hashing"
          hint="slice(0,16)"
          highlighted
        />
        <PipelineArrow />
        <PipelineStep
          eyebrow="Output"
          title={`Anonymized ID (e.g., '${previewSlice}')`}
        />
      </div>
    </section>
  );
}

function SdkConfigurationCard({
  environment,
  sampleRate,
}: {
  environment: string;
  sampleRate: string;
}) {
  return (
    <section
      className="rounded-2xl border bg-white p-6"
      style={{ borderColor: INK_10 }}
      aria-labelledby="radar-sdk-title"
    >
      <h2 id="radar-sdk-title" className="sr-only">
        SDK Configuration
      </h2>
      <SectionHeader icon={Sliders} label="SDK Configuration" />
      <dl className="space-y-5 text-[13.5px]">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[#0D1B3E]">Environment</dt>
          <dd>
            <span
              className="rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold"
              style={{ backgroundColor: ACCENT_SOFT, color: ACCENT }}
            >
              {environment}
            </span>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[#0D1B3E]">Traces Sample Rate</dt>
          <dd className="font-mono text-[12.5px] text-[#0D1B3E]">{sampleRate}</dd>
        </div>
        <div className="flex items-start justify-between gap-3">
          <dt className="text-[#0D1B3E]">Anonymization Algorithm</dt>
          <dd className="text-right">
            <div className="font-mono text-[12.5px] text-[#0D1B3E]">SHA-256</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#0D1B3E]/55">
              (stable)
            </div>
          </dd>
        </div>
      </dl>
    </section>
  );
}

function SentryContextMappingCard({
  signedInExample,
}: {
  signedInExample: string;
}) {
  return (
    <section
      className="rounded-2xl border bg-white"
      style={{ borderColor: INK_10 }}
      aria-labelledby="radar-mapping-title"
    >
      <header className="px-6 pt-6">
        <h2 id="radar-mapping-title" className="sr-only">
          Sentry Context Mapping
        </h2>
        <SectionHeader icon={Bug} label="Sentry Context Mapping" />
      </header>
      <table className="w-full table-fixed">
        <thead>
          <tr className="border-t" style={{ borderColor: INK_10 }}>
            <th
              scope="col"
              className="px-6 pb-3 pt-4 text-left font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55"
            >
              Authentication State
            </th>
            <th
              scope="col"
              className="px-6 pb-3 pt-4 text-left font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55"
            >
              Sentry User ID
            </th>
            <th
              scope="col"
              className="px-6 pb-3 pt-4 text-left font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55"
            >
              Sentry Auth Tag
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t" style={{ borderColor: INK_10 }}>
            <td className="px-6 py-4 text-[13.5px] font-semibold text-[#0D1B3E]">Signed In</td>
            <td className="px-6 py-4 font-mono text-[12.5px] text-[#0D1B3E]/85">
              {signedInExample}
            </td>
            <td className="px-6 py-4">
              <span
                className="inline-flex items-center rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold text-[#0D1B3E]"
                style={{ backgroundColor: 'rgba(13,27,62,0.08)' }}
              >
                signed_in
              </span>
            </td>
          </tr>
          <tr className="border-t" style={{ borderColor: INK_10 }}>
            <td className="px-6 py-4 text-[13.5px] font-semibold text-[#0D1B3E]">Anonymous</td>
            <td className="px-6 py-4 font-mono text-[12.5px] italic text-[#0D1B3E]/55">null</td>
            <td className="px-6 py-4">
              <span
                className="inline-flex items-center rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold text-[#0D1B3E]"
                style={{ backgroundColor: 'rgba(13,27,62,0.08)' }}
              >
                anonymous
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <footer
        className="border-t px-6 py-4 font-mono text-[11px] text-[#0D1B3E]/55"
        style={{ borderColor: INK_10 }}
      >
        Source : <code className="rounded bg-[#F5F0E3] px-1.5 py-0.5">components/SentryClerkSync.tsx</code>
        {' · '}
        <code className="rounded bg-[#F5F0E3] px-1.5 py-0.5">lib/sentry-anon-user-id.ts</code>
      </footer>
    </section>
  );
}

function TechnicalTraceCard({ signedInExample }: { signedInExample: string }) {
  return (
    <section
      className="overflow-hidden rounded-2xl bg-[#0F141F] text-white shadow-[0_24px_60px_rgba(13,27,62,0.18)]"
      aria-labelledby="radar-trace-title"
    >
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: '#EF4444' }}
            aria-hidden
          />
          <h2
            id="radar-trace-title"
            className="font-mono text-[11px] font-black uppercase tracking-[0.28em] text-white/85"
          >
            Technical Trace
          </h2>
        </div>
        <span className="font-mono text-[11px] text-white/55">ID: evt_9a8b7c0d5e4f</span>
      </header>
      <div className="space-y-5 px-6 py-6">
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-red-300/85">
            Exception
          </p>
          <p className="mt-2 font-serif text-[18px] font-black leading-snug text-white">
            TypeError: Cannot read property &apos;map&apos; of undefined
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-md bg-white/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-white/85">
            auth: signed_in
          </span>
          <span className="rounded-md bg-white/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-white/85">
            browser: chrome
          </span>
          <span className="rounded-md bg-white/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-white/85">
            env: production
          </span>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-white/55">
            Affected Context
          </p>
          <p className="mt-2 font-mono text-[12.5px] text-white/85">
            User ID: <span className="text-white">{signedInExample}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

export default async function RadarSentryClerkSyncPage() {
  const { userId } = await auth();
  const sampleAnonId = await buildSampleAnonId(userId);
  const environment = resolveEnvironment();
  const sampleRate = resolveSampleRate();
  const dsn = dsnConfigured();

  return (
    <div className="space-y-10 text-[#0D1B3E]">
      <header className="max-w-3xl space-y-3">
        <h1 className="font-serif text-[clamp(2rem,3.5vw,2.6rem)] font-black leading-[1.05] tracking-tight">
          Radar: Client Observability &amp; Sentry-Clerk Sync
        </h1>
        <p className="text-[14.5px] leading-relaxed text-[#0D1B3E]/70">
          Télémétrie interne en temps réel pour surveiller le pipeline d&apos;anonymisation des
          identités et les mappings de contexte SDK actifs.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-md border bg-white px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-[0.22em]"
            style={{ borderColor: INK_10 }}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: dsn ? '#10B981' : '#F59E0B' }}
              aria-hidden
            />
            {dsn ? 'DSN actif' : 'DSN absent (noop)'}
          </span>
          <span
            className="inline-flex items-center rounded-md border bg-white px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65"
            style={{ borderColor: INK_10 }}
          >
            ZERO PII
          </span>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <SynchronizationLogicCard sampleAnonId={sampleAnonId} />
        <SdkConfigurationCard environment={environment} sampleRate={sampleRate} />
      </section>

      <SentryContextMappingCard signedInExample={sampleAnonId} />

      <TechnicalTraceCard signedInExample={sampleAnonId} />

      <footer
        className="flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-[12px] text-[#0D1B3E]/55"
        style={{ borderColor: INK_10 }}
      >
        <p>
          Configurer via{' '}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono">NEXT_PUBLIC_SENTRY_DSN</code>{' '}
          et{' '}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono">
            NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE
          </code>
          . Aucun email / nom / id Clerk brut n&apos;est envoyé.
        </p>
        <Link
          href="/admin"
          className="font-mono text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/65 transition-colors hover:text-[#0D1B3E]"
          style={{ backgroundColor: CREAM_SHELL }}
        >
          ← Citadel Admin Console
        </Link>
      </footer>
    </div>
  );
}
