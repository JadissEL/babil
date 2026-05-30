/**
 * Parallel track gate: block fetch/collect on new datafile sources until discovery complete.
 */

import type { SourceDiscoveryStatus } from '@prisma/client'

import prisma from '@/lib/prisma'

const COLLECT_KINDS = new Set([
  'manifest_fetch',
  'deep_collect',
  'pdf_extract',
  'link_follow',
  'visa_friction',
  'education',
  'travel_signals',
  'news_trends',
  'extract_manifest_batch',
])

export type DiscoveryGateResult =
  | { allowed: true }
  | { allowed: false; reason: 'discovery_incomplete' | 'discovery_failed'; status: SourceDiscoveryStatus }

export function isCollectJobKind(kind: string): boolean {
  return COLLECT_KINDS.has(kind)
}

export async function assertDiscoveryGateForJob(args: {
  kind: string
  sourceId?: string | null
  sourceSlug?: string | null
}): Promise<DiscoveryGateResult> {
  if (!isCollectJobKind(args.kind)) return { allowed: true }

  let source = null
  if (args.sourceId) {
    source = await prisma.intelligenceSource.findUnique({ where: { id: args.sourceId } })
  } else if (args.sourceSlug) {
    source = await prisma.intelligenceSource.findUnique({ where: { slug: args.sourceSlug } })
  }

  if (!source?.requiresDiscoveryGate) return { allowed: true }

  const status = source.discoveryStatus
  if (status === 'complete' || status === 'procedural_no_fetch') {
    return { allowed: true }
  }
  if (status === 'failed') {
    return { allowed: false, reason: 'discovery_failed', status }
  }
  return { allowed: false, reason: 'discovery_incomplete', status }
}
