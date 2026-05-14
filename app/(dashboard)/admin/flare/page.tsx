'use client';

import {
  Activity,
  Bell,
  CheckCircle2,
  CircleUser,
  Info,
  Repeat,
  Target,
  User,
  X,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { appToast } from '@/lib/toast-store';
import { cn } from '@/lib/utils';

const INK = '#0D1B3E';
const INK_10 = 'rgba(13,27,62,0.10)';
const CREAM_SHELL = '#FAF7EE';

type ToastVariant = 'success' | 'error' | 'info';

type SpecimenToast = {
  variant: ToastVariant;
  message: string;
};

const SPECIMENS: SpecimenToast[] = [
  { variant: 'success', message: 'Votre profil a été mis à jour avec succès.' },
  { variant: 'error', message: "Une erreur est survenue lors de l’exportation." },
  { variant: 'info', message: 'Nouveau message dans le forum Canada.' },
];

function ToastSpecimen({
  variant,
  message,
  dismissed,
  onDismiss,
}: {
  variant: ToastVariant;
  message: string;
  dismissed: boolean;
  onDismiss: () => void;
}) {
  if (dismissed) return null;
  return (
    <div
      data-variant={variant}
      role={variant === 'error' ? 'alert' : undefined}
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-2xl border px-4 py-3 shadow-card backdrop-blur-sm transition-colors',
        variant === 'success' && 'border-[#94dfbd]/60 bg-[#e9f9f1]/95 text-success',
        variant === 'error' && 'border-red-300/50 bg-[#fff0f0]/95 text-danger',
        variant === 'info' && 'border-primary/30 bg-primary-soft/90 text-text',
      )}
    >
      {variant === 'success' ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      ) : variant === 'error' ? (
        <XCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      ) : (
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
      )}
      <p className="min-w-0 flex-1 text-sm font-bold leading-snug">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="-mr-1 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-black/5 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Fermer la notification (specimen)"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

function FakeDock() {
  const items = [
    { id: 'insights', label: 'Insights', Icon: Activity },
    { id: 'flow', label: 'Flow', Icon: Repeat },
    { id: 'objectives', label: 'Objectives', Icon: Target },
    { id: 'profile', label: 'Profile', Icon: User },
  ];
  return (
    <div
      role="presentation"
      aria-hidden
      className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center"
      style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div
        className="flex items-center gap-6 rounded-full border bg-white/95 px-5 py-3 shadow-[0_18px_36px_rgba(13,27,62,0.10)] backdrop-blur"
        style={{ borderColor: INK_10 }}
      >
        {items.map(({ id, label, Icon }) => (
          <div key={id} className="flex flex-col items-center gap-1 text-[#0D1B3E]/55">
            <Icon className="h-4 w-4" aria-hidden />
            <span className="font-mono text-[9px] font-black uppercase tracking-[0.22em]">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FlareSpecimenPage() {
  const [dismissed, setDismissed] = useState<Record<ToastVariant, boolean>>({
    success: false,
    error: false,
    info: false,
  });

  const reset = () =>
    setDismissed({ success: false, error: false, info: false });

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: CREAM_SHELL }}
    >
      <header
        className="flex items-center justify-between px-6 py-5 sm:px-10"
        style={{ borderBottomColor: INK_10 }}
      >
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-2xl font-black tracking-tight text-[#0D1B3E]">
            FLARE
          </span>
          <span className="font-serif text-2xl font-black tracking-tight text-[#0D1B3E]/65">
            – 3 états
          </span>
        </div>
        <div className="flex items-center gap-3 text-[#0D1B3E]/55">
          <Bell className="h-5 w-5" aria-hidden />
          <CircleUser className="h-6 w-6" aria-hidden />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 py-16 sm:py-24">
        <div
          className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3"
          aria-label="Specimens des 3 variantes de toast (success, error, info)"
        >
          {SPECIMENS.map((spec) => (
            <ToastSpecimen
              key={spec.variant}
              variant={spec.variant}
              message={spec.message}
              dismissed={dismissed[spec.variant]}
              onDismiss={() =>
                setDismissed((prev) => ({ ...prev, [spec.variant]: true }))
              }
            />
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() =>
              appToast.success('Votre profil a été mis à jour avec succès.')
            }
            className="rounded-xl border bg-white px-4 py-2 text-[12px] font-bold text-success transition-colors hover:bg-[#e9f9f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/40"
            style={{ borderColor: INK_10 }}
          >
            Trigger live success
          </button>
          <button
            type="button"
            onClick={() =>
              appToast.error('Une erreur est survenue lors de l’exportation.')
            }
            className="rounded-xl border bg-white px-4 py-2 text-[12px] font-bold text-danger transition-colors hover:bg-[#fff0f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
            style={{ borderColor: INK_10 }}
          >
            Trigger live error
          </button>
          <button
            type="button"
            onClick={() => appToast.info('Nouveau message dans le forum Canada.')}
            className="rounded-xl border bg-white px-4 py-2 text-[12px] font-bold text-primary transition-colors hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            style={{ borderColor: INK_10 }}
          >
            Trigger live info
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-xl border bg-white px-4 py-2 text-[12px] font-bold text-[#0D1B3E]/65 transition-colors hover:bg-[#0D1B3E]/[0.04] hover:text-[#0D1B3E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3E]/30"
            style={{ borderColor: INK_10 }}
          >
            Reset specimens
          </button>
        </div>

        <p className="mt-10 max-w-2xl text-center text-[12.5px] leading-relaxed text-[#0D1B3E]/55">
          Cette planche valide la <strong className="font-semibold text-[#0D1B3E]">forme</strong>,
          le <strong className="font-semibold text-[#0D1B3E]">ton</strong> et le{' '}
          <strong className="font-semibold text-[#0D1B3E]">clearance vertical</strong> des toasts
          globaux gérés par <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">components/AppToaster.tsx</code>{' '}
          et <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">lib/toast-store.ts</code>{' '}
          (API <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">appToast.success | error | info</code>).
          Le dock factice ci-dessous reproduit la position de <code className="font-mono">SiteObjectiveDock</code> (PAGE 41).
        </p>

        <Link
          href="/admin"
          className="mt-8 font-mono text-[11px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/55 transition-colors hover:text-[#0D1B3E]"
        >
          ← Citadel Admin Console
        </Link>
      </main>

      <FakeDock />
    </div>
  );
}
