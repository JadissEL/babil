import Link from 'next/link'
import { Globe } from 'lucide-react'

const links = [
  { href: '/explorer', label: 'Explorer' },
  { href: '/schengen', label: 'Schengen' },
  { href: '/probability', label: 'Visa Engine' },
]

export default function AppNavbar() {
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
            <Link key={link.href} href={link.href} className="text-sm font-semibold text-muted transition-colors hover:text-primary">
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

