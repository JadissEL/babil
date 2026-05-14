import {
  CheckCircle2,
  Dices,
  Flag,
  Network,
  Radio,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/admin-auth';
import {
  getProtectedRouteDisplayRows,
  PROTECTED_ROUTE_RULES,
  REQUEST_ID_RESOLUTION_PIPELINE,
  type ProtectedRouteDisplayRow,
} from '@/lib/auth-protected-routes';

export const dynamic = 'force-dynamic';

const INK = '#0D1B3E';
const INK_10 = 'rgba(13,27,62,0.10)';
const INK_60 = 'rgba(13,27,62,0.60)';
const CREAM_SHELL = '#FAF7EE';
const ACCENT = '#3B7DFF';
const ACCENT_SOFT = 'rgba(59,125,255,0.10)';
const RBAC_TONE = '#B45309';
const RBAC_SOFT = 'rgba(180,83,9,0.10)';

function envValueFlag(key: string): { display: string; enabled: boolean } {
  const raw = process.env[key];
  if (!raw) return { display: '—', enabled: false };
  const enabled = raw === '1' || raw.toLowerCase() === 'true';
  return { display: raw, enabled };
}

function shouldJsonAccessLogPreview(): boolean {
  if (process.env.BABIL_API_ACCESS_LOG === '0') return false;
  if (process.env.BABIL_API_ACCESS_LOG === '1') return true;
  return process.env.VERCEL === '1';
}

function StatusPill({
  label,
  state,
  tone,
}: {
  label: string;
  state: string;
  tone: 'ok' | 'warn';
}) {
  const dot = tone === 'ok' ? '#10B981' : '#F59E0B';
  return (
    <div
      className="flex items-center gap-3 rounded-xl border bg-white px-4 py-2.5"
      style={{ borderColor: INK_10 }}
    >
      <span className="font-mono text-[9px] font-black uppercase leading-tight tracking-[0.22em] text-[#0D1B3E]/55">
        {label}
      </span>
      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0D1B3E]">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: dot }}
          aria-hidden
        />
        {state}
      </span>
    </div>
  );
}

function RouteMatcherCard({ rows }: { rows: ProtectedRouteDisplayRow[] }) {
  return (
    <section
      className="rounded-2xl border bg-white"
      style={{ borderColor: INK_10 }}
      aria-labelledby="rampart-matcher-title"
    >
      <header
        className="flex items-center justify-between gap-3 border-b px-5 py-4"
        style={{ borderColor: INK_10 }}
      >
        <h2
          id="rampart-matcher-title"
          className="flex items-center gap-2 font-serif text-[18px] font-black text-[#0D1B3E]"
        >
          <ShieldCheck className="h-4 w-4" style={{ color: ACCENT }} aria-hidden />
          Protected Route Matcher
        </h2>
        <span
          className="rounded-full border px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-[0.22em]"
          style={{ borderColor: INK_10, color: INK_60, backgroundColor: CREAM_SHELL }}
        >
          {rows.length} active rules
        </span>
      </header>

      <table className="w-full table-fixed">
        <thead>
          <tr>
            <th
              scope="col"
              className="w-1/2 px-5 pb-3 pt-4 text-left font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55"
            >
              Path Prefix
            </th>
            <th
              scope="col"
              className="px-5 pb-3 pt-4 text-left font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55"
            >
              Requirement
            </th>
            <th
              scope="col"
              className="w-16 px-5 pb-3 pt-4 text-right font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55"
            >
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const rbac = row.requirement === 'auth+rbac';
            return (
              <tr key={row.displayPath} className="border-t" style={{ borderColor: INK_10 }}>
                <td className="px-5 py-3 align-middle font-mono text-[12.5px] text-[#0D1B3E]">
                  {row.displayPath}
                </td>
                <td className="px-5 py-3 align-middle">
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-[0.18em]"
                    style={{
                      color: rbac ? RBAC_TONE : ACCENT,
                      backgroundColor: rbac ? RBAC_SOFT : ACCENT_SOFT,
                    }}
                  >
                    {rbac ? 'Auth Required + RBAC' : 'Auth Required'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right align-middle">
                  <CheckCircle2
                    className="ml-auto h-4 w-4"
                    style={{ color: '#10B981' }}
                    aria-label="actif"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function ResolveRequestIdCard() {
  return (
    <section
      className="rounded-2xl border bg-white"
      style={{ borderColor: INK_10 }}
      aria-labelledby="rampart-reqid-title"
    >
      <header
        className="flex items-center gap-2 border-b px-5 py-4"
        style={{ borderColor: INK_10 }}
      >
        <Network className="h-4 w-4" style={{ color: ACCENT }} aria-hidden />
        <h2
          id="rampart-reqid-title"
          className="font-serif text-[16px] font-black text-[#0D1B3E]"
        >
          resolveRequestId
        </h2>
      </header>
      <ol className="space-y-2 p-5">
        {REQUEST_ID_RESOLUTION_PIPELINE.map((entry) => {
          const isFallback = entry.step === 4;
          return (
            <li key={entry.step} className="flex items-center gap-3">
              <span
                className={
                  isFallback
                    ? 'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white'
                    : 'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-[11px] font-black'
                }
                style={
                  isFallback
                    ? { backgroundColor: INK }
                    : { backgroundColor: CREAM_SHELL, color: INK }
                }
                aria-hidden
              >
                {isFallback ? <Dices className="h-3.5 w-3.5" /> : entry.step}
              </span>
              <span
                className="flex flex-1 items-center justify-between rounded-md border bg-[#F5F0E3]/60 px-3 py-2"
                style={{ borderColor: INK_10 }}
              >
                <span className="font-mono text-[12px] text-[#0D1B3E]">{entry.source}</span>
                <span className="hidden font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/45 sm:inline">
                  {entry.label}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function EnvironmentFlagsCard() {
  const flags: Array<{ key: string; label: string; value: { display: string; enabled: boolean } }> = [
    {
      key: 'BABIL_API_ACCESS_LOG',
      label: 'BABIL_API_ACCESS_LOG',
      value: envValueFlag('BABIL_API_ACCESS_LOG'),
    },
    { key: 'VERCEL', label: 'VERCEL', value: envValueFlag('VERCEL') },
    {
      key: 'NODE_ENV',
      label: 'NODE_ENV',
      value: { display: process.env.NODE_ENV ?? '—', enabled: process.env.NODE_ENV === 'production' },
    },
    {
      key: 'EDGE_REGION',
      label: 'EDGE_REGION',
      value: {
        display:
          process.env.VERCEL_REGION ||
          process.env.RENDER_REGION ||
          process.env.EDGE_REGION ||
          'iad1',
        enabled: true,
      },
    },
  ];

  return (
    <section
      className="rounded-2xl border bg-white"
      style={{ borderColor: INK_10 }}
      aria-labelledby="rampart-flags-title"
    >
      <header
        className="flex items-center gap-2 border-b px-5 py-4"
        style={{ borderColor: INK_10 }}
      >
        <Flag className="h-4 w-4" style={{ color: ACCENT }} aria-hidden />
        <h2
          id="rampart-flags-title"
          className="font-serif text-[16px] font-black text-[#0D1B3E]"
        >
          Environment Flags
        </h2>
      </header>
      <dl className="divide-y px-5" style={{ borderColor: INK_10 }}>
        {flags.map((flag) => (
          <div
            key={flag.key}
            className="flex items-center justify-between gap-3 py-3 first:pt-4 last:pb-4"
            style={{ borderColor: INK_10 }}
          >
            <dt className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#0D1B3E]/55">
              {flag.label}
            </dt>
            <dd className="font-mono text-[12.5px] text-[#0D1B3E]">{flag.value.display}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function LiveAccessLogStreamCard({ enabled }: { enabled: boolean }) {
  const sampleLines = [
    {
      level: 'info',
      ts: '2026-05-14T14:32:01.442Z',
      requestId: 'req_2WvX9_lwq',
      method: 'GET',
      path: '/api/user/profile',
      status: 200,
      duration_ms: 42,
      edge_region: 'iad1',
    },
    {
      level: 'info',
      ts: '2026-05-14T14:32:05.110Z',
      requestId: 'req_2WvXa_kpz',
      method: 'POST',
      path: '/api/user/data-export',
      status: 202,
      duration_ms: 115,
      edge_region: 'sfo1',
    },
  ];

  return (
    <section
      className="overflow-hidden rounded-2xl bg-[#0F141F] text-white shadow-[0_24px_60px_rgba(13,27,62,0.18)]"
      aria-labelledby="rampart-log-title"
    >
      <header className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: enabled ? '#EF4444' : '#6B7280' }}
            aria-hidden
          />
          <h2
            id="rampart-log-title"
            className="font-mono text-[11px] font-black uppercase tracking-[0.28em] text-white/85"
          >
            <Radio className="mr-1 inline h-3 w-3" aria-hidden />
            Live Access Log Stream
          </h2>
        </div>
        <span className="rounded-md border border-white/15 px-2 py-1 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-white/65">
          JSON format
        </span>
      </header>
      <div className="px-5 py-5">
        {enabled ? (
          <pre className="overflow-x-auto whitespace-pre font-mono text-[12.5px] leading-[1.65] text-white/85">
            {sampleLines
              .map((line) =>
                JSON.stringify(line, null, 2)
                  .replace(/"(level|ts|requestId|method|path|status|duration_ms|edge_region)":/g, '"$1":')
                  .trim(),
              )
              .join('\n')}
          </pre>
        ) : (
          <p className="font-mono text-[12px] leading-relaxed text-white/55">
            BABIL_API_ACCESS_LOG=0 — flux désactivé sur cet environnement. Les requêtes
            <code className="mx-1 rounded bg-white/[0.08] px-1 py-0.5">/api/*</code>
            ne sont pas journalisées via console JSON ; la corrélation reste possible via{' '}
            <code className="rounded bg-white/[0.08] px-1 py-0.5">x-babil-request-id</code>.
          </p>
        )}
      </div>
    </section>
  );
}

export default async function RampartPage() {
  const admin = await getAdminUser();
  if (!admin) redirect('/');

  const rows = getProtectedRouteDisplayRows();
  const accessLogEnabled = shouldJsonAccessLogPreview();
  const clerkActive = Boolean(process.env.CLERK_SECRET_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <div className="space-y-8 text-[#0D1B3E]">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/55">
            System Status Dashboard
          </p>
          <h1 className="font-serif text-[clamp(2rem,3.5vw,2.6rem)] font-black leading-[1.05] tracking-tight">
            Rampart: Edge Auth Firewall
          </h1>
          <p className="text-[14.5px] leading-relaxed text-[#0D1B3E]/70">
            Middleware Clerk, terminaison d&apos;authentification et monitoring du cycle de vie des
            requêtes pour les déploiements Edge. Liste centralisée dans{' '}
            <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[12px]">
              lib/auth-protected-routes.ts
            </code>
            .
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill
            label="Clerk Auth"
            state={clerkActive ? 'Active' : 'Disabled'}
            tone={clerkActive ? 'ok' : 'warn'}
          />
          <StatusPill label="Edge Runtime" state="Healthy" tone="ok" />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <RouteMatcherCard rows={rows} />
        <div className="flex flex-col gap-6">
          <ResolveRequestIdCard />
          <EnvironmentFlagsCard />
        </div>
      </div>

      <LiveAccessLogStreamCard enabled={accessLogEnabled} />

      <footer
        className="flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-[12px] text-[#0D1B3E]/55"
        style={{ borderColor: INK_10 }}
      >
        <p>
          {PROTECTED_ROUTE_RULES.length} règles actives · Source :{' '}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono">proxy.ts</code> ·{' '}
          <code className="rounded bg-white px-1.5 py-0.5 font-mono">
            lib/auth-protected-routes.ts
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
