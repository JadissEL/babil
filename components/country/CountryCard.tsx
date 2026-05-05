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
  highlightPlace?: string
  highlightImageUrl?: string
  onClick?: () => void
}

function frictionStripClass(friction: CountryCardProps['friction']) {
  if (friction === 'Low') return 'border-[#94dfbd] bg-[#e9f9f1] text-success'
  if (friction === 'Medium') return 'border-[#f2c27a] bg-[#fff5e7] text-warning'
  return 'border-[#f3afaf] bg-[#fff0f0] text-danger'
}

const COUNTRY_HIGHLIGHTS: Record<string, { place: string; imageUrl: string }> = {
  de: {
    place: 'Brandenburg Gate',
    imageUrl:
      'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1600&q=80',
  },
  fr: {
    place: 'Eiffel Tower',
    imageUrl:
      'https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=1600&q=80',
  },
  ca: {
    place: 'Moraine Lake',
    imageUrl:
      'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1600&q=80',
  },
  jp: {
    place: 'Mount Fuji',
    imageUrl:
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&w=1600&q=80',
  },
  gb: {
    place: 'Tower Bridge',
    imageUrl:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1600&q=80',
  },
  us: {
    place: 'New York Skyline',
    imageUrl:
      'https://images.unsplash.com/photo-1496588152823-e9b3f88a2f0b?auto=format&fit=crop&w=1600&q=80',
  },
}

function fallbackCountryImageUrl(countryName: string) {
  const q = encodeURIComponent(`${countryName} landmark travel photography`)
  return `https://source.unsplash.com/1600x900/?${q}`
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
  highlightPlace,
  highlightImageUrl,
  onClick,
}: CountryCardProps) {
  const iso = code.toLowerCase().trim()
  const interactive = typeof onClick === 'function'
  const focusableLink = countryId != null && !interactive
  const curated = COUNTRY_HIGHLIGHTS[iso]
  const scenicImage = highlightImageUrl || curated?.imageUrl || fallbackCountryImageUrl(name)
  const scenicLabel = highlightPlace || curated?.place || `Signature place in ${name}`

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
        'group rounded-2xl border border-line bg-surface shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-soft',
        interactive || focusableLink ? 'cursor-pointer' : undefined,
      )}
    >
      <CardContent className="space-y-5 p-0">
        <div className="relative h-36 overflow-hidden rounded-t-2xl border-b border-line">
          <img
            src={scenicImage}
            alt={`${scenicLabel}, ${name}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-2 left-3 rounded-full border border-white/40 bg-black/35 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white">
            {scenicLabel} - {name}
          </div>
        </div>

        <div className="space-y-5 px-6 pb-6">
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
