import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Créer un compte — VisaFlow',
  description: 'Créez votre compte VisaFlow pour sauvegarder vos scénarios de mobilité.',
  robots: { index: false, follow: false },
}

const SHELL = '#FAF7EE'

type Props = {
  searchParams?: { redirect_url?: string }
}

export default function SignUpPage({ searchParams }: Props) {
  const redirectTarget =
    typeof searchParams?.redirect_url === 'string' && searchParams.redirect_url.startsWith('/')
      ? searchParams.redirect_url
      : '/overview'

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12 sm:px-8"
      style={{ backgroundColor: SHELL }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 30%, rgba(13,27,62,0.05), transparent 55%), radial-gradient(circle at 20% 80%, rgba(13,27,62,0.04), transparent 55%)',
        }}
      />

      <div className="relative w-full max-w-md">
        <div className="text-center">
          <Link
            href="/"
            className="inline-block font-serif text-3xl font-black tracking-tight text-[#0D1B3E] transition-opacity hover:opacity-80"
          >
            VisaFlow
          </Link>
          <p className="mt-1 font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#0D1B3E]/55">
            Powered by Clerk
          </p>
          <p className="mt-5 font-serif text-[15px] font-medium text-[#0D1B3E]">
            Créez votre compte VisaFlow.
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            forceRedirectUrl={redirectTarget}
          />
        </div>

        <p className="mt-6 text-center font-serif text-[12.5px] font-medium text-[#0D1B3E]/55">
          <Link
            href="/"
            className="underline decoration-[#0D1B3E]/20 underline-offset-4 transition-colors hover:text-[#0D1B3E] hover:decoration-[#0D1B3E]"
          >
            Retour à l’accueil
          </Link>
        </p>
      </div>
    </div>
  )
}
