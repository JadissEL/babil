import { Globe } from 'lucide-react'

export default function CountryFlag({ iso2, className = '' }: { iso2?: string; className?: string }) {
  if (!iso2) return <Globe className={`h-4 w-4 text-slate-400 ${className}`} />
  return <span className={`fi fi-${iso2.toLowerCase()} rounded-sm ${className}`} />
}

