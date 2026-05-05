import { Globe } from 'lucide-react'

export default function CountryFlag({ iso2, className = '' }: { iso2?: string; className?: string }) {
  if (!iso2) return <Globe className={`h-5 w-5 text-muted ${className}`} />
  return <span className={`fi fi-${iso2.toLowerCase()} rounded-[4px] shadow-sm ${className}`} />
}

