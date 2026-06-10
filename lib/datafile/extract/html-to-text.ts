/**
 * Lightweight HTML → readable text for extraction excerpts (no DOM dependency).
 */

const BLOCK_STRIP = /<(script|style|noscript|svg|iframe|head)[^>]*>[\s\S]*?<\/\1>/gi
const COMMENTS = /<!--[\s\S]*?-->/g
const TAGS = /<[^>]+>/g

const ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&eacute;': 'é',
  '&egrave;': 'è',
  '&agrave;': 'à',
  '&ccedil;': 'ç',
  '&ugrave;': 'ù',
  '&ocirc;': 'ô',
  '&icirc;': 'î',
  '&ecirc;': 'ê',
  '&acirc;': 'â',
}

export function looksLikeHtml(text: string): boolean {
  const head = text.slice(0, 600).toLowerCase()
  return (
    head.includes('<!doctype') ||
    head.includes('<html') ||
    (head.match(/<\w+[\s>]/g)?.length ?? 0) >= 3
  )
}

/** Strip tags/scripts/styles, decode common entities, collapse whitespace. */
export function htmlToText(html: string): string {
  let text = html.replace(BLOCK_STRIP, ' ').replace(COMMENTS, ' ')
  // Preserve sentence boundaries at block-level closings.
  text = text.replace(/<\/(p|div|li|h[1-6]|tr|td|th|section|article|br)>/gi, '. ')
  text = text.replace(/<br\s*\/?>/gi, '. ')
  text = text.replace(TAGS, ' ')
  for (const [entity, char] of Object.entries(ENTITIES)) {
    text = text.split(entity).join(char)
  }
  text = text.replace(/&#(\d+);/g, (_, code) => {
    const n = Number(code)
    return n > 31 && n < 65536 ? String.fromCharCode(n) : ' '
  })
  return text.replace(/\s+/g, ' ').replace(/(\. )+/g, '. ').trim()
}

/** Remove CSS rule residue that survives upstream tag stripping (style tag content). */
export function stripCssResidue(text: string): string {
  let out = text
  // Repeatedly drop selector{...} rule blocks, including nested @media wrappers.
  for (let i = 0; i < 5 && /\{[^{}]*\}/.test(out); i++) {
    out = out.replace(/[#.@:\w[\]()>+~^=",*\s-]{0,160}\{[^{}]*\}/g, ' ')
  }
  // Drop leftover skip-link boilerplate.
  out = out.replace(/skip to (main |secondary )?(content|navigation|search)\.?/gi, ' ')
  return out.replace(/\s+/g, ' ').trim()
}

/** Normalize an excerpt: convert HTML to text when needed, drop CSS residue. */
export function normalizeExcerpt(excerpt: string): string {
  const text = looksLikeHtml(excerpt) ? htmlToText(excerpt) : excerpt
  return stripCssResidue(text)
}
