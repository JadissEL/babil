'use client';

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { Globe, Heart, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { GlobalCountrySearch } from '@/components/nav/GlobalCountrySearch';
import { HeaderObjectiveSelector } from '@/components/objectives/HeaderObjectiveSelector';
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider';
import { ctaCompareHref, ctaExploreHref } from '@/lib/cta-hrefs';
import { PAYPAL_DONATE_URL } from '@/lib/paypal-donate';

/**
 * Global sticky header + compact objective strip on small screens.
 */
export function SiteHeader() {
  const { preference } = useObjectivePreference();
  const explorerNavHref = useMemo(
    () => ctaExploreHref(preference.primarySlug),
    [preference.primarySlug],
  );
  const compareNavHref = useMemo(
    () => ctaCompareHref(preference.primarySlug),
    [preference.primarySlug],
  );

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-[#fdf8ef]/90 text-text backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-2 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-4 lg:gap-6 xl:gap-8">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <div className="rounded-lg bg-primary p-1.5 text-white shadow-soft">
                <Globe className="h-6 w-6" />
              </div>
              <span className="text-lg font-black tracking-tighter">VisaFlow</span>
            </Link>

            <nav className="hidden items-center gap-4 lg:flex xl:gap-5">
              <Link
                href={explorerNavHref}
                className="text-sm font-semibold text-muted transition-colors hover:text-primary"
              >
                Explorer
              </Link>
              <Link
                href="/schengen"
                className="text-sm font-semibold text-muted transition-colors hover:text-primary"
              >
                Schengen
              </Link>
              <Link
                href={compareNavHref}
                className="text-sm font-semibold text-muted transition-colors hover:text-primary"
              >
                Comparer
              </Link>
              <Link
                href="/recommendations"
                className="text-sm font-semibold text-muted transition-colors hover:text-primary"
              >
                Moteur visa
              </Link>
              <Link
                href="/recommendation-engine"
                className="text-sm font-semibold text-muted transition-colors hover:text-primary"
              >
                Labo reco
              </Link>
              <Link
                href="/services/delegated-applications"
                className="text-sm font-semibold text-muted transition-colors hover:text-primary"
              >
                Assist
              </Link>
              <Link
                href="/education"
                className="text-sm font-semibold text-muted transition-colors hover:text-primary"
              >
                Éducation
              </Link>
              <Link
                href="/community"
                className="text-sm font-semibold text-muted transition-colors hover:text-primary"
              >
                Communauté
              </Link>
              <Link
                href="/business"
                className="text-sm font-semibold text-muted transition-colors hover:text-primary"
              >
                Business
              </Link>
              <Link
                href="/permis"
                className="text-sm font-semibold text-muted transition-colors hover:text-primary"
              >
                Permis
              </Link>
              <Link
                href="/investment"
                className="text-sm font-semibold text-muted transition-colors hover:text-primary"
              >
                Investissement
              </Link>
            </nav>
          </div>

          <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
            <div className="hidden md:block">
              <HeaderObjectiveSelector />
            </div>
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
      <div className="border-b border-line bg-primary-soft/25 px-4 py-2 md:hidden">
        <HeaderObjectiveSelector className="w-full" />
      </div>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-[#fdf8ef]/90 text-text">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-6 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-medium text-muted">
          <span>© {new Date().getFullYear()} VisaFlow.</span>{' '}
          <span>
            Réalisé par <span className="font-black text-text">JADISS EL ANTAKI</span>.
          </span>
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
    </footer>
  );
}
