/**
 * Build data/agent-manifest-url-map.committed.json from TS manifest + policy.
 * Run: npm run agent:manifest-build-committed
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { listAllManifestSourceKeys } from '../lib/agent-manifest-keys';
import {
  isProceduralGuidanceLabel,
  resolveManifestUrlTemplate,
  SKIPPED_FETCH_TIERS,
} from '../lib/agent-manifest-url-templates';
import type { ManifestUrlMapEntry } from '../lib/agent-manifest-url-map-types';

function main() {
  const entries: ManifestUrlMapEntry[] = [];

  for (const row of listAllManifestSourceKeys()) {
    const knownUrl = resolveManifestUrlTemplate(row.sourceLabel);
    const skipTier = SKIPPED_FETCH_TIERS.has(row.tier);
    const procedural = isProceduralGuidanceLabel(row.sourceLabel);

    if (procedural) {
      entries.push({
        categoryId: row.categoryId,
        sourceLabel: row.sourceLabel,
        method: 'GET',
        urlTemplate: '',
        skipped: true,
        skipReason: 'procedural_guidance_no_fetch',
      });
      continue;
    }

    if (knownUrl) {
      entries.push({
        categoryId: row.categoryId,
        sourceLabel: row.sourceLabel,
        method: 'GET',
        urlTemplate: knownUrl,
        responseKind: knownUrl.includes('api') || knownUrl.includes('data.') ? 'json' : 'text',
      });
      continue;
    }

    if (skipTier) {
      entries.push({
        categoryId: row.categoryId,
        sourceLabel: row.sourceLabel,
        method: 'GET',
        urlTemplate: '',
        skipped: true,
        skipReason: `tier_${row.tier}_qualitative_no_stable_url`,
      });
      continue;
    }

    entries.push({
      categoryId: row.categoryId,
      sourceLabel: row.sourceLabel,
      method: 'GET',
      urlTemplate: '',
      skipped: true,
      skipReason: 'pending_manual_url_template',
    });
  }

  const outPath = path.join(process.cwd(), 'data', 'agent-manifest-url-map.committed.json');
  const doc = {
    version: '1-committed-policy',
    _comment:
      'Versioned map for CI parity. Fill urlTemplate for rows with pending_manual_url_template; or set skipped with reason. Override locally via data/agent-manifest-url-map.json (gitignored).',
    entries,
  };
  writeFileSync(outPath, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
  const fetchable = entries.filter(
    (e) => !e.skipped && e.urlTemplate.startsWith('https://'),
  ).length;
  const skipped = entries.filter((e) => e.skipped).length;
  console.log(
    `[agent:manifest-build-committed] wrote ${entries.length} entries (${fetchable} fetchable, ${skipped} skipped) → ${path.relative(process.cwd(), outPath)}`,
  );
}

main();
