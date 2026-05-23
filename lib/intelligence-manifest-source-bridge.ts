/**
 * Maps agent manifest source labels → IntelligenceSource slugs for observation staging.
 */

import type { IntelligenceSourceTier } from '@prisma/client';
import type { AgentResearchTier } from '@/lib/agent-research-sources';
import {
  DEFAULT_INTELLIGENCE_SOURCES,
  type DefaultSourceSeed,
} from '@/lib/intelligence-pipeline/default-sources';
import { OFFICIAL_SOURCE_URL_TEMPLATES } from '@/lib/agent-manifest-url-templates';

function slugifyLabel(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 80);
}

function tierFromAgentTier(tier: AgentResearchTier): IntelligenceSourceTier {
  switch (tier) {
    case 'official_critical':
    case 'morocco_official':
    case 'morocco_embassy_examples':
    case 'morocco_visa_corridor':
    case 'visa':
      return 'TIER_A_OFFICIAL';
    case 'statistics':
    case 'morocco_cost_of_living':
    case 'education':
    case 'employment':
    case 'transport':
    case 'housing':
    case 'morocco_education_corridor':
    case 'morocco_employment_corridor':
    case 'morocco_transport':
    case 'morocco_housing_platforms':
      return 'TIER_B_MULTILATERAL';
    default:
      return 'TIER_C_CURATED';
  }
}

/** Extra seeds derived from manifest labels that have known official URLs. */
export function buildManifestDerivedSourceSeeds(): DefaultSourceSeed[] {
  const seen = new Set(DEFAULT_INTELLIGENCE_SOURCES.map((s) => s.slug));
  const extra: DefaultSourceSeed[] = [];

  for (const [name, url] of Object.entries(OFFICIAL_SOURCE_URL_TEMPLATES)) {
    const slug = `manifest_${slugifyLabel(name)}`;
    if (seen.has(slug)) continue;
    seen.add(slug);
    extra.push({
      slug,
      name,
      tier: 'TIER_A_OFFICIAL',
      baseUrl: url.split('/{')[0] ?? url,
      licenseNote: 'Mapped from agent research manifest — verify terms per site.',
    });
  }

  return extra;
}

export function allIntelligenceSourceSeeds(): DefaultSourceSeed[] {
  return [...DEFAULT_INTELLIGENCE_SOURCES, ...buildManifestDerivedSourceSeeds()];
}

export function resolveSourceSlugForManifestLabel(sourceLabel: string): string {
  const direct = DEFAULT_INTELLIGENCE_SOURCES.find(
    (s) => s.name.toLowerCase() === sourceLabel.toLowerCase(),
  );
  if (direct) return direct.slug;
  if (OFFICIAL_SOURCE_URL_TEMPLATES[sourceLabel]) {
    return `manifest_${slugifyLabel(sourceLabel)}`;
  }
  return 'babil_curated_research';
}

export function intelligenceTierForAgentTier(tier: AgentResearchTier): IntelligenceSourceTier {
  return tierFromAgentTier(tier);
}
