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

const items = [
  { href: '/overview', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/explorer', label: 'Explorer', icon: Globe },
  { href: '/compare', label: 'Comparer', icon: Scale },
  { href: '/schengen', label: 'Schengen', icon: ShieldCheck },
  { href: '/probability', label: 'Moteur visa', icon: Zap },
  { href: '/education', label: 'Éducation', icon: GraduationCap },
  { href: '/community', label: 'Communauté', icon: MessagesSquare },
  { href: '/business', label: 'Affaires', icon: Briefcase },
  { href: '/permis', label: 'Permis de conduire', icon: Car },
  { href: '/moderation', label: 'Modération', icon: Gavel },
]

export default function AppSidebar() {
  return (
    <aside className="rounded-2xl border border-line bg-surface p-4 text-text shadow-soft">
      <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-muted">Navigation</p>
      <nav className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
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

