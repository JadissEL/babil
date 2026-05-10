import './globals.css'
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Globe, Heart, LayoutDashboard } from 'lucide-react'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { AppToaster } from '@/components/AppToaster'
import { GlobalCountrySearch } from '@/components/nav/GlobalCountrySearch'
import { SentryClerkSync } from '@/components/SentryClerkSync'
import { PAYPAL_DONATE_URL } from '@/lib/paypal-donate'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VisaFlow — Mobilité internationale',
  description:
    'Scores visa, friction, études et business par pays — outils d’exploration, comparaison et moteur de recommandation pour profils marocains.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body
          className={
            inter.className + ' flex min-h-screen flex-col bg-bg text-text antialiased'
          }
        >
          <SentryClerkSync />
          <header className="sticky top-0 z-50 border-b border-line bg-[#fdf8ef]/90 text-text backdrop-blur">
            <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-x-4 gap-y-3 px-4 py-2 sm:px-6 lg:px-8">
              <div className="flex items-center gap-6 lg:gap-8">
                <Link href="/" className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary p-1.5 text-white shadow-soft">
                    <Globe className="h-6 w-6" />
                  </div>
                  <span className="text-lg font-black tracking-tighter">VisaFlow</span>
                </Link>

                <nav className="hidden items-center gap-5 lg:flex">
                  <Link href="/explorer" className="text-sm font-semibold text-muted transition-colors hover:text-primary">
                    Explorer
                  </Link>
                  <Link href="/schengen" className="text-sm font-semibold text-muted transition-colors hover:text-primary">
                    Schengen
                  </Link>
                  <Link href="/compare" className="text-sm font-semibold text-muted transition-colors hover:text-primary">
                    Comparer
                  </Link>
                  <Link href="/recommendations" className="text-sm font-semibold text-muted transition-colors hover:text-primary">
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
                  <Link href="/education" className="text-sm font-semibold text-muted transition-colors hover:text-primary">
                    Éducation
                  </Link>
                  <Link href="/community" className="text-sm font-semibold text-muted transition-colors hover:text-primary">
                    Communauté
                  </Link>
                  <Link href="/business" className="text-sm font-semibold text-muted transition-colors hover:text-primary">
                    Business
                  </Link>
                  <Link href="/permis" className="text-sm font-semibold text-muted transition-colors hover:text-primary">
                    Permis
                  </Link>
                  <Link href="/investment" className="text-sm font-semibold text-muted transition-colors hover:text-primary">
                    Investissement
                  </Link>
                </nav>
              </div>

                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
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
          <AppToaster />
          <main className="flex-1 pb-12">{children}</main>
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
        </body>
      </html>
    </ClerkProvider>
  )
}
