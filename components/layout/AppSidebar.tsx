import {
  Briefcase,
  Car,
  Gavel,
  Globe,
  GraduationCap,
  LayoutDashboard,
  MessagesSquare,
  Scale,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { useObjectivePreference } from '@/components/objectives/ObjectivePreferenceProvider'
import { ctaCompareHref, ctaExploreHref } from '@/lib/cta-hrefs'

export default function AppSidebar() {
  const { preference } = useObjectivePreference()
  const explorerHref = useMemo(() => ctaExploreHref(preference.primarySlug), [preference.primarySlug])
  const compareHref = useMemo(() => ctaCompareHref(preference.primarySlug), [preference.primarySlug])

  const items = useMemo(
    () => [
      { key: 'overview', href: '/overview', label: 'Tableau de bord', icon: LayoutDashboard },
      { key: 'explorer', href: explorerHref, label: 'Explorer', icon: Globe },
      { key: 'compare', href: compareHref, label: 'Comparer', icon: Scale },
      { key: 'schengen', href: '/schengen', label: 'Schengen', icon: ShieldCheck },
      { key: 'probability', href: '/probability', label: 'Moteur visa', icon: Zap },
      { key: 'education', href: '/education', label: 'Éducation', icon: GraduationCap },
      { key: 'community', href: '/community', label: 'Communauté', icon: MessagesSquare },
      { key: 'business', href: '/business', label: 'Affaires', icon: Briefcase },
      { key: 'permis', href: '/permis', label: 'Permis de conduire', icon: Car },
      { key: 'moderation', href: '/moderation', label: 'Modération', icon: Gavel },
    ],
    [compareHref, explorerHref],
  )

  return (
    <aside className="rounded-2xl border border-line bg-surface p-4 text-text shadow-soft">
      <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted">Navigation</p>
      <nav className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-primary-soft hover:text-primary"
          >
            <item.icon className="h-4 w-4" /> {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

