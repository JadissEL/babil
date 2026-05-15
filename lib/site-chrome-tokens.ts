/**
 * Public marketing shell (Harbor / Quay) — interaction tokens aligned with Nexus chrome.
 *
 * Nexus authenticated surfaces use `lib/nexus-chrome.ts`. Keep marketing visually distinct
 * (lighter cream #fdf8ef vs Nexus #FAF7EE) while sharing motion and focus philosophy.
 *
 * @see https://www.w3.org/WAI/WCAG22/Understanding/focus-visible — keyboard-only focus
 * @see https://thefrontkit.com/blogs/consistency-matters-how-design-tokens-keep-your-saas-and-ai-products-cohesive — token cohesion across surfaces
 */

import { NEXUS_TRANSITION } from '@/lib/nexus-chrome'

export const MARKETING_SHELL_HEX = '#fdf8ef'

/** Re-use Nexus motion vocabulary on rails, drawers, and controls */
export const SITE_INTERACTION_TRANSITION = NEXUS_TRANSITION

export const SITE_RAIL_TRANSITION =
  'transition-transform duration-200 ease-out motion-reduce:transition-none'

export const SITE_BACKDROP_TRANSITION =
  'transition-opacity duration-200 motion-reduce:transition-none'

/** Default: navy-tint ring on marketing cream (matches skip-link language in SiteChrome) */
export const SITE_FOCUS_VISIBLE =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3E]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf8ef]'

/** Ghost / surface controls on cream */
export const SITE_FOCUS_VISIBLE_SOFT =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf8ef]'

/** Filled primary CTA (#3157d5) — high contrast ring */
export const SITE_FOCUS_VISIBLE_ON_PRIMARY =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-primary'

/** PayPal / dark gradient buttons */
export const SITE_FOCUS_VISIBLE_ON_DARK_CTA =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/95 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0070BA]'

/** Home marketing strip — navy CTA on white */
export const SITE_FOCUS_HOME_CTA_GHOST =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a1f33]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white'

export const SITE_FOCUS_HOME_CTA_SOLID =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1f33]'

/** Links / controls over imagery (hero carousel) */
export const SITE_FOCUS_VISIBLE_ON_MEDIA_OVERLAY =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/60'

/** Cookie banner & dark ink panels — light ring on navy */
export const SITE_FOCUS_VISIBLE_ON_INK_PANEL =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E141F]'
