import './globals.css'
import type { Metadata } from 'next'
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Globe, LayoutDashboard } from 'lucide-react'

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
        <body className={inter.className + ' min-h-screen bg-[#0B0F19] text-slate-100 antialiased'}>
          <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0F19]/90 text-white backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-6 lg:gap-8">
                <Link href="/" className="flex items-center gap-2">
                  <div className="rounded-lg bg-blue-600 p-1.5">
                    <Globe className="h-6 w-6" />
                  </div>
                  <span className="text-lg font-black tracking-tighter">VisaFlow</span>
                </Link>

                <nav className="hidden items-center gap-5 lg:flex">
                  <Link href="/explorer" className="text-sm font-bold text-slate-300 transition-colors hover:text-white">
                    Explorer
                  </Link>
                  <Link href="/schengen" className="text-sm font-bold text-slate-300 transition-colors hover:text-white">
                    Schengen
                  </Link>
                  <Link href="/compare" className="text-sm font-bold text-slate-300 transition-colors hover:text-white">
                    Compare
                  </Link>
                  <Link href="/recommendations" className="text-sm font-bold text-slate-300 transition-colors hover:text-white">
                    Visa Engine
                  </Link>
                  <Link href="/education" className="text-sm font-bold text-slate-300 transition-colors hover:text-white">
                    Education
                  </Link>
                  <Link href="/community" className="text-sm font-bold text-slate-300 transition-colors hover:text-white">
                    Community
                  </Link>
                  <Link href="/business" className="text-sm font-bold text-slate-300 transition-colors hover:text-white">
                    Business
                  </Link>
                  <Link href="/permis" className="text-sm font-bold text-slate-300 transition-colors hover:text-white">
                    Driving
                  </Link>
                  <Link href="/investment" className="text-sm font-bold text-slate-300 transition-colors hover:text-white">
                    Investment
                  </Link>
                </nav>
              </div>

              <div className="flex items-center gap-3">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-blue-500">
                        Login
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <div className="flex items-center gap-3">
                      <Link href="/overview" className="hidden items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-white/10 sm:flex">
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </SignedIn>
                </div>
            </div>
          </header>
          <main className="pb-12">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
}
