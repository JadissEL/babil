'use client';

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Globe, Heart, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { openCookiePreferences } from '@/components/cookies/CookieConsentBanner';
import { SiteHeaderMenuButton } from '@/components/layout/SitePrimaryNav';
import { ObjectiveDockInline } from '@/components/layout/SiteObjectiveDock';
import { GlobalCountrySearch } from '@/components/nav/GlobalCountrySearch';
import { PAYPAL_DONATE_URL } from '@/lib/paypal-donate';

/**
 * En-tête global : menu, logo, **objectif principal** (inline), recherche pays, auth.
 * La navigation principale est dans {@link SitePrimaryNavColumn}.
 */
export function SiteHeader({ onPrimaryNavOpen }: { onPrimaryNavOpen?: () => void }) {
  return (
    <header className="sticky top-0 z-50 overflow-visible border-b border-line bg-[#fdf8ef]/90 text-text backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-[1600px] flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
          {onPrimaryNavOpen ? <SiteHeaderMenuButton onClick={onPrimaryNavOpen} /> : null}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="rounded-lg bg-primary p-1.5 text-white shadow-soft">
              <Globe className="h-6 w-6" />
            </div>
            <span className="text-lg font-black tracking-tighter">VisaFlow</span>
          </Link>
          <ObjectiveDockInline className="min-w-0 max-[480px]:basis-full max-[480px]:max-w-none sm:max-w-none" />
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
          <GlobalCountrySearch />
          <SignedOut>
            <>
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-black uppercase tracking-widest text-white shadow-soft transition-all hover:bg-primary-hover"
                >
                  Connexion
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="rounded-xl border border-line bg-surface px-5 py-2 text-xs font-black uppercase tracking-widest text-text transition-all hover:bg-primary-soft"
                >
                  S&apos;inscrire
                </button>
              </SignUpButton>
            </>
          </SignedOut>
          <SignedIn>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <Link
                href="/overview"
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-[10px] font-black uppercase tracking-wider text-text transition-colors hover:bg-primary-soft sm:gap-2 sm:px-4 sm:text-xs sm:tracking-widest"
                title="Tableau de bord"
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                <span className="max-[380px]:sr-only">Tableau de bord</span>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-[#fdf8ef]/90 text-text">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-9 lg:px-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <div className="rounded-lg bg-primary p-1.5 text-white shadow-soft">
              <Globe className="h-5 w-5" />
            </div>
            <span className="font-serif text-xl font-black tracking-tight text-text">VisaFlow</span>
          </Link>

          <nav
            aria-label="Liens légaux"
            className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-muted"
          >
            <Link href="/legal#mentions" className="transition-colors hover:text-text">
              Legal
            </Link>
            <a
              href="mailto:support@visaflow.com?subject=Support%20VisaFlow"
              className="transition-colors hover:text-text"
            >
              Support
            </a>
            <Link href="/legal#confidentialite" className="transition-colors hover:text-text">
              Privacy Policy
            </Link>
            <Link href="/legal#cgu" className="transition-colors hover:text-text">
              Terms of Service
            </Link>
            <button
              type="button"
              onClick={() => openCookiePreferences()}
              className="cursor-pointer font-mono text-[10px] font-black uppercase tracking-[0.22em] text-muted transition-colors hover:text-text"
            >
              Gérer les cookies
            </button>
          </nav>

          <p className="text-xs font-medium text-muted">
            © {year} VisaFlow Intelligence. Tous droits réservés.
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-muted">
            Réalisé par <span className="font-black text-text">JADISS EL ANTAKI</span>.
          </p>
          <a
            href={PAYPAL_DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#0070BA] to-[#003087] px-5 py-2.5 text-[11px] font-black uppercase tracking-wider text-white shadow-[0_1px_2px_rgba(0,48,135,0.25)] ring-1 ring-[#009CDE]/35 transition-[filter] hover:brightness-110"
          >
            <Heart className="h-3.5 w-3.5 shrink-0 fill-white/95" aria-hidden />
            PayPal · Don
          </a>
        </div>
      </div>
    </footer>
  );
}
