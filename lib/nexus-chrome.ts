/**
 * Nexus authenticated shell chrome tokens (Mobility Intel).
 * Shared literals for header, workspace drawer, and toolbar controls.
 */

export const NEXUS_INK = '#0D1B3E'
export const NEXUS_SHELL = '#FAF7EE'
export const NEXUS_BORDER = 'rgba(13,27,62,0.10)'
export const NEXUS_BORDER_STRONG = 'rgba(13,27,62,0.12)'
export const NEXUS_GOLD_LINE = 'rgba(154, 123, 79, 0.25)'

export const NEXUS_TOOLBAR_H_CLASS = 'h-10'
export const NEXUS_TOOLBAR_ICON_W_CLASS = 'w-10'

export const NEXUS_TRANSITION =
  'transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out motion-reduce:transition-none'

export const NEXUS_TRANSITION_UNDERLINE =
  'transition-transform duration-200 ease-out motion-reduce:transition-none'

export const NEXUS_FOCUS_VISIBLE =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3E]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7EE]'

export const NEXUS_FOCUS_VISIBLE_ON_DARK =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D1B3E]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF7EE]'

/** Solid ink / navy button (hero, legal) — light ring on dark fill */
export const NEXUS_FOCUS_VISIBLE_ON_INK_SOLID =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1B3E]'

export const NEXUS_DRAWER_SURFACE_TRANSITION =
  'transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none'

export const NEXUS_BACKDROP_TRANSITION =
  'transition-opacity duration-300 motion-reduce:transition-none'

/** Tailwind arbitrary classes — keep literals here so JIT sees them */
export const NEXUS_TW = {
  pageBg: 'bg-[#FAF7EE] text-[#0D1B3E]',
  headerBg: 'bg-[#FAF7EE]/95 backdrop-blur-md',
  headerHairline: 'before:bg-[rgba(154,123,79,0.25)]',
  ink: 'text-[#0D1B3E]',
  ink65: 'text-[#0D1B3E]/65',
  ink55: 'text-[#0D1B3E]/55',
  ink45: 'text-[#0D1B3E]/45',
  ink85: 'text-[#0D1B3E]/85',
  borderStrong: 'border-[rgba(13,27,62,0.12)]',
  hoverSurface: 'hover:bg-[#0D1B3E]/[0.04]',
  hoverBorder: 'hover:border-[#0D1B3E]/20',
  underlineActive: 'bg-[#0D1B3E]',
  underlineMuted: 'bg-[#0D1B3E]/35',
  navRowActiveShadow: 'shadow-[inset_3px_0_0_0_#0D1B3E]',
  backdropInk45: 'bg-[#0D1B3E]/45',
  backdropInk30: 'lg:bg-[#0D1B3E]/30',
  kbdBar: 'border-[rgba(13,27,62,0.1)] bg-[#EFEBE3] text-[#0D1B3E]/50',
} as const

/**
 * Reading-friendly routes: prose-heavy, no known full-bleed grids/maps.
 * Audit (2026-05): `/history`, `/profile` only — other Nexus routes keep full main width.
 */
const READING_WIDTH_PREFIXES = ['/history', '/profile'] as const

export function isNexusReadingWidthPath(pathname: string): boolean {
  const raw = pathname.split('?')[0] || '/'
  const normalized = raw.length > 1 && raw.endsWith('/') ? raw.slice(0, -1) : raw
  return READING_WIDTH_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  )
}

export const NEXUS_READING_INNER_CLASS = 'mx-auto w-full max-w-4xl'
