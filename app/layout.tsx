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

/**
 * PAGE 33 — Keyhole : theming Clerk co-brandé VisaFlow.
 * Toutes les surfaces Clerk (modal SignInButton, SignUpButton, /sign-in, /sign-up,
 * UserButton) héritent automatiquement de ces tokens.
 */
const clerkAppearance = {
  variables: {
    colorPrimary: '#0D1B3E',
    colorText: '#0D1B3E',
    colorTextSecondary: 'rgba(13,27,62,0.65)',
    colorBackground: '#ffffff',
    colorInputBackground: '#FAF7EE',
    colorInputText: '#0D1B3E',
    colorDanger: '#dc2626',
    borderRadius: '0.5rem',
    fontFamily: inter.style.fontFamily,
  },
  elements: {
    rootBox: 'w-full',
    card: 'shadow-none border-0 bg-transparent',
    headerTitle: 'font-serif text-[#0D1B3E] font-black tracking-tight',
    headerSubtitle: 'text-[#0D1B3E]/65 font-medium',
    socialButtonsBlockButton:
      'border-[rgba(13,27,62,0.10)] bg-white text-[#0D1B3E] hover:bg-[#0D1B3E]/[0.03]',
    formButtonPrimary:
      'bg-[#0D1B3E] hover:bg-[#0D1B3E]/90 text-white font-bold text-sm normal-case tracking-normal',
    formFieldInput:
      'bg-[#FAF7EE] border-[rgba(13,27,62,0.10)] text-[#0D1B3E] focus:border-[#0D1B3E] focus:ring-[#0D1B3E]/15',
    formFieldLabel:
      'font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#0D1B3E]/70',
    footerActionLink:
      'text-[#0D1B3E] font-medium underline decoration-[#0D1B3E]/25 underline-offset-4 hover:decoration-[#0D1B3E]',
    dividerText:
      'font-mono text-[10px] font-black uppercase tracking-[0.26em] text-[#0D1B3E]/55',
    dividerLine: 'bg-[rgba(13,27,62,0.10)]',
    identityPreviewEditButtonIcon: 'text-[#0D1B3E]',
  },
} as const

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
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
