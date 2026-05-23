/**
 * CI: every manifest (categoryId, sourceLabel) must appear in the URL map with https url or skipped:true.
 * Run: npm run agent:manifest-validate
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { listAllManifestSourceKeys, manifestEntryId } from '../lib/agent-manifest-keys';
import type { ManifestUrlMapFile } from '../lib/agent-manifest-url-map-types';

function loadMap(): ManifestUrlMapFile {
  const override = process.env.AGENT_MANIFEST_MAP_PATH?.trim();
  const candidates = [
    override ? path.resolve(process.cwd(), override) : null,
    path.join(process.cwd(), 'data', 'agent-manifest-url-map.json'),
    path.join(process.cwd(), 'data', 'agent-manifest-url-map.committed.json'),
  ].filter(Boolean) as string[];

  for (const p of candidates) {
    if (!existsSync(p)) continue;
    return JSON.parse(readFileSync(p, 'utf8')) as ManifestUrlMapFile;
  }
  throw new Error(
    'No URL map found. Run npm run agent:manifest-build-committed or create data/agent-manifest-url-map.json',
  );
}

function main() {
  const map = loadMap();
  const byKey = new Map<string, (typeof map.entries)[0]>();
  for (const e of map.entries) {
    byKey.set(manifestEntryId(e.categoryId, e.sourceLabel), e);
  }

  const missing: string[] = [];
  const invalid: string[] = [];
  const keys = listAllManifestSourceKeys();

  for (const row of keys) {
    const id = manifestEntryId(row.categoryId, row.sourceLabel);
    const entry = byKey.get(id);
    if (!entry) {
      missing.push(id);
      continue;
    }
    if (entry.skipped) continue;
    const url = entry.urlTemplate?.trim() ?? '';
    if (!url.startsWith('https://')) {
      invalid.push(`${id} (missing https urlTemplate)`);
    }
  }

  if (missing.length > 0) {
    console.error(`[agent:manifest-validate] missing ${missing.length} manifest rows in map`);
    for (const m of missing.slice(0, 25)) console.error(`  - ${m}`);
    process.exit(1);
  }
  if (invalid.length > 0) {
    console.error(
      `[agent:manifest-validate] invalid ${invalid.length} rows (not skipped, no https URL)`,
    );
    for (const m of invalid.slice(0, 25)) console.error(`  - ${m}`);
    process.exit(1);
  }

  const fetchable = map.entries.filter(
    (e) => !e.skipped && e.urlTemplate.startsWith('https://'),
  ).length;
  const pendingManual = map.entries.filter((e) => e.skipReason === 'pending_manual_url_template');
  if (pendingManual.length > 0) {
    console.error(
      `[agent:manifest-validate] ${pendingManual.length} rows still pending_manual_url_template`,
    );
    for (const e of pendingManual.slice(0, 15)) {
      console.error(`  - ${manifestEntryId(e.categoryId, e.sourceLabel)}`);
    }
    process.exit(1);
  }

  console.log(
    `[agent:manifest-validate] OK — ${keys.length} manifest rows covered (${fetchable} fetchable URLs in map)`,
  );
}

main();
