'use client'

import Link from 'next/link'
import { Globe } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export type MobilityTier = 'Strong' | 'Medium' | 'Weak'

export type CountryCardProps = {
  /** When provided and no `onClick`, navigation vers `/countries/[countryId]` */
  countryId?: string | number
  name: string
  /** ISO Alpha-2 (flag-icons css: `fi fi-xx`) */
  code: string
  score: number
  visaScore: number
  friction: 'Low' | 'Medium' | 'High'
  study: MobilityTier
  business: MobilityTier
  onClick?: () => void
}

function frictionStripClass(friction: CountryCardProps['friction']) {
  if (friction === 'Low') return 'bg-green-500'
  if (friction === 'Medium') return 'bg-yellow-500'
  return 'bg-red-500'
}

export function CountryCard({
  countryId,
  name,
  code,
  score,
  visaScore,
  friction,
  study,
  business,
  onClick,
}: CountryCardProps) {
  const iso = code.toLowerCase().trim()
  const interactive = typeof onClick === 'function'
  const focusableLink = countryId != null && !interactive

  const card = (
    <Card
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cn(
        'rounded-2xl border border-gray-800 bg-[#111827] shadow-sm transition-all hover:border-blue-600/35 hover:shadow-lg',
        interactive || focusableLink ? 'cursor-pointer' : undefined,
      )}
    >
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {iso ? (
              <span className={cn(`fi fi-${iso}`, 'text-xl leading-none')} aria-hidden />
            ) : (
              <Globe className="size-6 shrink-0 text-slate-500" aria-hidden />
            )}
            <h3 className="text-lg font-semibold tracking-tight text-white">{name}</h3>
          </div>

          <Badge className="shrink-0 bg-blue-600 text-white">{score}/100</Badge>
        </div>

        <div>
          <p className="mb-1 text-sm text-gray-400">Visa probability</p>
          <Progress value={visaScore} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className={cn(frictionStripClass(friction), 'text-black')} variant="secondary">
            ⚡ {friction}
          </Badge>
          <Badge variant="secondary">🎓 {study}</Badge>
          <Badge variant="secondary">💼 {business}</Badge>
        </div>
      </CardContent>
    </Card>
  )

  if (interactive) return card

  if (countryId != null) {
    return (
      <Link
        href={`/countries/${countryId}`}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/70"
      >
        {card}
      </Link>
    )
  }

  return card
}

export default CountryCard
