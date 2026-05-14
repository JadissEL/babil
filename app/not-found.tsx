import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page introuvable',
  description: 'La page demandée n’existe pas ou a été déplacée sur VisaFlow.',
}

function WormholeMark({ className }: { className?: string }) {
  const rings: Array<{ r: number; opacity: number; width: number }> = [
    { r: 270, opacity: 0.04, width: 1 },
    { r: 250, opacity: 0.07, width: 1 },
    { r: 232, opacity: 0.1, width: 1 },
    { r: 215, opacity: 0.14, width: 1 },
    { r: 198, opacity: 0.18, width: 1 },
    { r: 182, opacity: 0.22, width: 1.5 },
    { r: 166, opacity: 0.28, width: 1.5 },
    { r: 150, opacity: 0.34, width: 1.5 },
    { r: 134, opacity: 0.4, width: 1.5 },
    { r: 118, opacity: 0.46, width: 1.5 },
    { r: 102, opacity: 0.5, width: 1.5 },
    { r: 86, opacity: 0.52, width: 1.5 },
    { r: 70, opacity: 0.55, width: 1.5 },
    { r: 56, opacity: 0.55, width: 1.5 },
    { r: 44, opacity: 0.55, width: 1.5 },
    { r: 34, opacity: 0.55, width: 1.5 },
    { r: 25, opacity: 0.55, width: 1.5 },
    { r: 18, opacity: 0.55, width: 1.5 },
  ]
  return (
    <svg
      viewBox="0 0 600 600"
      role="presentation"
      aria-hidden
      className={className}
    >
      <defs>
        <radialGradient id="wh-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFEFD9" stopOpacity="1" />
          <stop offset="14%" stopColor="#F2D5A7" stopOpacity="0.7" />
          <stop offset="32%" stopColor="#2E2F3F" stopOpacity="0.55" />
          <stop offset="62%" stopColor="#10121B" stopOpacity="0.92" />
          <stop offset="100%" stopColor="#0D1B3E" stopOpacity="1" />
        </radialGradient>
        <radialGradient id="wh-soft" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0D1B3E" stopOpacity="0" />
          <stop offset="80%" stopColor="#0D1B3E" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#0D1B3E" stopOpacity="0.08" />
        </radialGradient>
        <linearGradient id="wh-streak" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#FFEFD9" stopOpacity="0" />
          <stop offset="46%" stopColor="#FFEFD9" stopOpacity="0.3" />
          <stop offset="54%" stopColor="#FFEFD9" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFEFD9" stopOpacity="0" />
        </linearGradient>
      </defs>

      <circle cx="300" cy="300" r="296" fill="url(#wh-soft)" />
      <circle cx="300" cy="300" r="282" fill="url(#wh-glow)" />

      {rings.map((ring) => (
        <circle
          key={ring.r}
          cx="300"
          cy="300"
          r={ring.r}
          fill="none"
          stroke="#FFEFD9"
          strokeOpacity={ring.opacity}
          strokeWidth={ring.width}
        />
      ))}

      <ellipse
        cx="300"
        cy="300"
        rx="282"
        ry="14"
        fill="url(#wh-streak)"
        opacity="0.6"
      />

      <circle cx="300" cy="300" r="14" fill="#FFEFD9" />
      <circle cx="300" cy="300" r="22" fill="#FFEFD9" opacity="0.35" />
      <circle cx="300" cy="300" r="36" fill="#FFEFD9" opacity="0.12" />
    </svg>
  )
}

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ backgroundColor: '#FAF7EE' }}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 40%, rgba(13,27,62,0.04), transparent 60%)',
        }}
      />

      <header className="mx-auto flex max-w-6xl items-center px-6 pt-8 sm:px-10 sm:pt-10">
        <Link
          href="/"
          className="font-serif text-2xl font-black tracking-tight text-[#0D1B3E] transition-opacity hover:opacity-80"
        >
          VisaFlow
        </Link>
      </header>

      <main className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pb-24 pt-2 text-center sm:px-10 sm:pt-6">
        <WormholeMark className="w-full max-w-[420px] sm:max-w-[480px] lg:max-w-[520px]" />

        <div className="mt-6 flex items-center gap-5">
          <span aria-hidden className="h-px w-12 bg-[#0D1B3E]/20" />
          <p className="font-mono text-[11px] font-black uppercase tracking-[0.3em] text-[#0D1B3E]/60">
            Erreur 404
          </p>
          <span aria-hidden className="h-px w-12 bg-[#0D1B3E]/20" />
        </div>

        <h1
          className="mt-5 font-serif font-black tracking-tight text-[#0D1B3E]"
          style={{ fontSize: 'clamp(2.25rem, 5vw, 3rem)', lineHeight: 1.05 }}
        >
          Page introuvable
        </h1>

        <p className="mt-5 max-w-xl font-serif text-[15px] font-medium leading-[1.7] text-[#0D1B3E]/65 sm:text-[16px]">
          Le document ou la ressource que vous tentez de consulter n’est plus disponible à cette
          adresse. L’architecture de nos données a pu être mise à jour. Nous vous invitons à regagner
          l’espace principal.
        </p>

        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#0D1B3E] px-7 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-sm transition-colors hover:bg-[#0D1B3E]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3E]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7EE]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Retour à l’accueil
        </Link>
      </main>
    </div>
  )
}
