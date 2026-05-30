#!/usr/bin/env node
/**
 * Build datafile/sources.master.json from agent research categories (~300 labels).
 * Enriches baseUrl from OFFICIAL_SOURCE_URL_TEMPLATES + committed manifest urlTemplates.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'datafile', 'sources.master.json');
const MANIFEST_COMMITTED = path.join(ROOT, 'data', 'agent-manifest-url-map.committed.json');

const { execSync } = await import('node:child_process');

function loadTsExport(modulePath, exportName, tmpName) {
  const tmpOut = path.join(ROOT, `.tmp-datafile-${tmpName}.json`);
  execSync(
    `npx tsx -e "import { ${exportName} } from '${modulePath.replace(/\\/g, '/')}'; import fs from 'fs'; fs.writeFileSync('${tmpOut.replace(/\\/g, '/')}', JSON.stringify(${exportName}));"`,
    { cwd: ROOT, stdio: 'inherit' },
  );
  const data = JSON.parse(fs.readFileSync(tmpOut, 'utf8'));
  try {
    fs.unlinkSync(tmpOut);
  } catch {
    /* ignore */
  }
  return data;
}

const AGENT_RESEARCH_SOURCE_CATEGORIES = loadTsExport(
  './lib/agent-research-sources.ts',
  'AGENT_RESEARCH_SOURCE_CATEGORIES',
  'categories',
);
const OFFICIAL_SOURCE_URL_TEMPLATES = loadTsExport(
  './lib/agent-manifest-url-templates.ts',
  'OFFICIAL_SOURCE_URL_TEMPLATES',
  'templates',
);

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 72);
}

function tierMap(tier) {
  if (tier === 'official_critical' || tier.startsWith('morocco_official') || tier === 'visa') {
    return 'official';
  }
  if (tier === 'statistics' || tier.includes('education') || tier.includes('employment')) {
    return 'multilateral';
  }
  return 'curated';
}

function defaultScores(tier) {
  if (tier === 'official') return { trustScore: 92, authorityScore: 95, reliabilityLevel: 'high' };
  if (tier === 'multilateral')
    return { trustScore: 78, authorityScore: 82, reliabilityLevel: 'medium' };
  return { trustScore: 55, authorityScore: 50, reliabilityLevel: 'low' };
}

/** Root site URL from template (strip country placeholders). */
function baseUrlFromTemplate(template) {
  if (!template || typeof template !== 'string') return null;
  const t = template.trim();
  if (!/^https?:\/\//i.test(t)) return null;
  const root = t.split('/{')[0].split('{')[0].replace(/\/$/, '');
  try {
    const u = new URL(root);
    return u.origin;
  } catch {
    return root || null;
  }
}

function normalizeLabel(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const baseUrlByLabel = new Map();

for (const [label, template] of Object.entries(OFFICIAL_SOURCE_URL_TEMPLATES)) {
  const url = baseUrlFromTemplate(template);
  if (url) baseUrlByLabel.set(normalizeLabel(label), url);
}

if (fs.existsSync(MANIFEST_COMMITTED)) {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_COMMITTED, 'utf8'));
  for (const entry of manifest.entries ?? []) {
    const label = normalizeLabel(entry.sourceLabel);
    const url = baseUrlFromTemplate(entry.urlTemplate);
    if (url && label) baseUrlByLabel.set(label, url);
  }
}

const sources = [];
const seen = new Set();
let withUrl = 0;

for (const cat of AGENT_RESEARCH_SOURCE_CATEGORIES) {
  const tier = tierMap(cat.tier);
  const scores = defaultScores(tier);
  for (const name of cat.sources) {
    const id = slugify(name);
    if (seen.has(id)) continue;
    seen.add(id);
    const baseUrl = baseUrlByLabel.get(normalizeLabel(name)) ?? null;
    if (baseUrl) withUrl++;
    sources.push({
      id,
      name,
      baseUrl,
      tier,
      topics: [cat.id],
      countryScope: cat.tier.startsWith('morocco') ? 'morocco_corridor' : 'global',
      language: cat.tier.startsWith('morocco') ? 'fr' : 'en',
      ...scores,
      updateFrequencyHint: tier === 'official' ? 'monthly' : 'variable',
      requiresDiscoveryGate: true,
      categoryId: cat.id,
      notes: `From agent category ${cat.id}`,
    });
  }
}

const payload = {
  version: 1,
  generatedAt: new Date().toISOString(),
  sources,
  stats: { total: sources.length, withBaseUrl: withUrl },
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8');
console.log(`Wrote ${sources.length} sources (${withUrl} with baseUrl) → ${OUT}`);
