/**
 * Canonical master list format for /datafile/sources.master.json
 */

export type DatafileSourceTier = 'official' | 'multilateral' | 'curated'

export type DatafileMasterSource = {
  id: string
  name: string
  baseUrl?: string | null
  tier: DatafileSourceTier
  topics: string[]
  countryScope?: string | null
  language?: string | null
  trustScore?: number
  authorityScore?: number
  reliabilityLevel?: 'high' | 'medium' | 'low'
  updateFrequencyHint?: string | null
  notes?: string | null
  /** When true, manifest fetch / deep collect blocked until site discovery completes. */
  requiresDiscoveryGate?: boolean
  categoryId?: string | null
}

export type DatafileMasterList = {
  version: number
  generatedAt: string
  sources: DatafileMasterSource[]
}
