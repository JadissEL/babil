/**
 * Client-safe perspective mapping for homepage country tiles (no Prisma / Next cache).
 */

import type { CountryGridItem } from '@/components/country/CountryGrid'
import type { MobilityTier } from '@/components/country/CountryCard'
import { scoreToMobilityTier } from '@/lib/country-card-mappers'
import {
  perspectiveContractFromSlug,
  type CountryScoreFocus,
} from '@/lib/user-objectives/perspective-contract'

export type ShowcaseVisaBreakdown = {
  tourism: number
  study: number
  work: number
  business: number
}

function primaryScoreFromBreakdown(
  breakdown: ShowcaseVisaBreakdown,
  focus: CountryScoreFocus,
): number {
  switch (focus) {
    case 'tourism':
      return breakdown.tourism
    case 'study':
      return breakdown.study
    case 'work':
      return breakdown.work
    case 'business':
      return breakdown.business
    default:
      return breakdown.tourism
  }
}

function mobilityForFocus(
  breakdown: ShowcaseVisaBreakdown,
  focus: CountryScoreFocus,
): MobilityTier {
  return scoreToMobilityTier(primaryScoreFromBreakdown(breakdown, focus))
}

/**
 * Re-rank and relabel showcase tiles for the visitor’s primary interest (client-safe).
 */
export function applyPerspectiveToShowcaseItems(
  items: CountryGridItem[],
  primarySlug: string | null | undefined,
): CountryGridItem[] {
  const contract = perspectiveContractFromSlug(primarySlug)
  if (!contract) return items

  const focus = contract.primaryScoreFocus
  const mapped = items.map((item) => {
    const breakdown = item.visaBreakdown
    if (!breakdown) return item

    const primaryScore = primaryScoreFromBreakdown(breakdown, focus)

    return {
      ...item,
      score: primaryScore,
      visaScore: primaryScore,
      primaryFocus: focus,
      showSecondaryMobility: false,
      tourism: mobilityForFocus(breakdown, 'tourism'),
      study: mobilityForFocus(breakdown, 'study'),
      work: mobilityForFocus(breakdown, 'work'),
      business: mobilityForFocus(breakdown, 'business'),
    }
  })

  return [...mapped].sort((a, b) => b.score - a.score)
}
