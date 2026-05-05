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
  if (friction === 'Low') return 'border-[#94dfbd] bg-[#e9f9f1] text-success'
  if (friction === 'Medium') return 'border-[#f2c27a] bg-[#fff5e7] text-warning'
  return 'border-[#f3afaf] bg-[#fff0f0] text-danger'
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
        'rounded-2xl border border-line bg-surface shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft',
        interactive || focusableLink ? 'cursor-pointer' : undefined,
      )}
    >
      <CardContent className="space-y-5 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {iso ? (
              <span className={cn(`fi fi-${iso}`, 'text-2xl leading-none shadow-sm')} aria-hidden />
            ) : (
              <Globe className="size-6 shrink-0 text-muted" aria-hidden />
            )}
            <h3 className="text-lg font-semibold tracking-tight text-text">{name}</h3>
          </div>

          <Badge className="shrink-0" variant="default">
            {score}/100
          </Badge>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-muted">Visa probability</p>
          <Progress value={visaScore} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className={cn(frictionStripClass(friction), 'font-semibold')} variant="secondary">
            ⚡ {friction}
          </Badge>
          <Badge variant="secondary">🎓 Study: {study}</Badge>
          <Badge variant="secondary">💼 Business: {business}</Badge>
        </div>
      </CardContent>
    </Card>
  )

  if (interactive) return card

  if (countryId != null) {
    return (
      <Link
        href={`/countries/${countryId}`}
        className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        {card}
      </Link>
    )
  }

  return card
}

export default CountryCard
