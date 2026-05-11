import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import { AppObjectiveRoot } from '@/components/layout/AppObjectiveRoot'
import { SiteChrome } from '@/components/layout/SiteChrome'
import { SentryClerkSync } from '@/components/SentryClerkSync'
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
          <AppObjectiveRoot>
            <SiteChrome>{children}</SiteChrome>
          </AppObjectiveRoot>
        </body>
      </html>
    </ClerkProvider>
  )
}
