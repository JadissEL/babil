'use client';

import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'vf.cookies.v1';
const REOPEN_EVENT = 'vf:cookies:open';

type ConsentRecord = {
  status: 'accepted' | 'rejected';
  ts: number;
};

function readConsent(): ConsentRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (parsed && (parsed.status === 'accepted' || parsed.status === 'rejected')) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function writeConsent(status: ConsentRecord['status']) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ status, ts: Date.now() } satisfies ConsentRecord),
    );
  } catch {
    /* swallow */
  }
}

export function openCookiePreferences() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(REOPEN_EVENT));
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = readConsent();
    if (!consent) {
      const id = window.setTimeout(() => setVisible(true), 350);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, []);

  useEffect(() => {
    const handler = () => setVisible(true);
    window.addEventListener(REOPEN_EVENT, handler);
    return () => window.removeEventListener(REOPEN_EVENT, handler);
  }, []);

  if (!visible) return null;

  const dismiss = (status: ConsentRecord['status']) => {
    writeConsent(status);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="vf-cookies-title"
      aria-describedby="vf-cookies-body"
      className="fixed inset-x-0 bottom-4 z-[80] mx-auto w-[min(46rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#0E141F]/95 px-5 py-4 text-white shadow-[0_24px_60px_rgba(13,27,62,0.35)] backdrop-blur-xl sm:px-6 sm:py-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2 font-serif text-base font-semibold">
            <ShieldCheck className="h-4 w-4 text-[#D4A857]" aria-hidden />
            <span id="vf-cookies-title">Préférences de navigation</span>
          </div>
          <p id="vf-cookies-body" className="text-[12.5px] leading-relaxed text-white/70">
            Nous utilisons des cookies essentiels pour le fonctionnement du terminal VisaFlow,
            ainsi que des cookies d&apos;analyse pour améliorer votre expérience de recherche.
            Vous pouvez définir vos préférences ci-dessous.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-nowrap">
          <Link
            href="/legal#cookies"
            onClick={() => setVisible(false)}
            className="rounded-md border border-white/15 bg-transparent px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            Personnaliser
          </Link>
          <button
            type="button"
            onClick={() => dismiss('rejected')}
            className="rounded-md border border-white/15 bg-transparent px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => dismiss('accepted')}
            className="rounded-md bg-[#3B7DFF] px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-white transition-colors hover:bg-[#2D6EF0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B7DFF]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E141F]"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
