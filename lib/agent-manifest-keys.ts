/**
 * Flat manifest index: every (categoryId, sourceLabel) from agent-research-sources.ts.
 */

import {
  AGENT_MOROCCO_SOURCE_CATEGORIES,
  AGENT_RESEARCH_SOURCE_CATEGORIES,
  type AgentResearchTier,
} from '@/lib/agent-research-sources';

export type ManifestSourceKey = {
  categoryId: string;
  sourceLabel: string;
  tier: AgentResearchTier;
};

export function listAllManifestSourceKeys(): ManifestSourceKey[] {
  const out: ManifestSourceKey[] = [];
  for (const cat of AGENT_RESEARCH_SOURCE_CATEGORIES) {
    for (const sourceLabel of cat.sources) {
      out.push({ categoryId: cat.id, sourceLabel, tier: cat.tier });
    }
  }
  for (const cat of AGENT_MOROCCO_SOURCE_CATEGORIES) {
    for (const sourceLabel of cat.sources) {
      out.push({ categoryId: cat.id, sourceLabel, tier: cat.tier });
    }
  }
  return out;
}

export function manifestEntryId(categoryId: string, sourceLabel: string): string {
  return `${categoryId}::${sourceLabel}`;
}
