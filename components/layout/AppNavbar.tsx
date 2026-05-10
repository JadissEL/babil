import { Globe } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider'
import { ctaCompareHref, ctaExploreHref } from '@/lib/cta-hrefs'

export default function AppNavbar() {
  const { preference } = useObjectivePreference()
  const explorerHref = useMemo(() => ctaExploreHref(preference.primarySlug), [preference.primarySlug])
  const compareHref = useMemo(() => ctaCompareHref(preference.primarySlug), [preference.primarySlug])

  const links = useMemo(
    () => [
      { key: 'explorer', href: explorerHref, label: 'Explorer' },
      { key: 'compare', href: compareHref, label: 'Comparer' },
      { key: 'schengen', href: '/schengen', label: 'Schengen' },
      { key: 'probability', href: '/probability', label: 'Moteur visa' },
    ],
    [compareHref, explorerHref],
  )

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[#fdf8ef]/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-text">
          <div className="rounded-lg bg-primary p-1.5 text-white shadow-soft">
            <Globe className="h-5 w-5" />
          </div>
          <span className="text-sm font-black uppercase tracking-widest">VisaFlow</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link key={link.key} href={link.href} className="text-sm font-semibold text-muted transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/overview" className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-black uppercase tracking-widest text-text hover:bg-primary-soft">
          Espace perso
        </Link>
      </div>
    </header>
  )
}

