#!/usr/bin/env node
/**
 * Build datafile/sources.master.json from agent research categories (~300 labels).
 * Enriches baseUrl from overrides, resolveManifestUrlTemplate, templates + committed manifest.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'datafile', 'sources.master.json');
const MANIFEST_COMMITTED = path.join(ROOT, 'data', 'agent-manifest-url-map.committed.json');
const URL_OVERRIDES = path.join(ROOT, 'datafile', 'url-overrides.json');

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

function loadTsFn(modulePath, fnName, tmpName) {
  const tmpOut = path.join(ROOT, `.tmp-datafile-fn-${tmpName}.json`);
  execSync(
    `npx tsx -e "import { ${fnName} } from '${modulePath.replace(/\\/g, '/')}'; import fs from 'fs'; const samples = ['World Bank','OECD','Important: verify embassy hours','France-Visas — formulaires']; fs.writeFileSync('${tmpOut.replace(/\\/g, '/')}', JSON.stringify({ fn: '${fnName}', samples: samples.map(s => ({ label: s, result: ${fnName}(s) })) }));"`,
    { cwd: ROOT, stdio: 'pipe' },
  );
  return JSON.parse(fs.readFileSync(tmpOut, 'utf8'));
}

const AGENT_RESEARCH_SOURCE_CATEGORIES = loadTsExport(
  './lib/agent-research-sources.ts',
  'AGENT_RESEARCH_SOURCE_CATEGORIES',
  'categories',
);
const AGENT_MOROCCO_SOURCE_CATEGORIES = loadTsExport(
  './lib/agent-research-sources.ts',
  'AGENT_MOROCCO_SOURCE_CATEGORIES',
  'morocco-categories',
);
const ALL_CATEGORIES = [...AGENT_RESEARCH_SOURCE_CATEGORIES, ...AGENT_MOROCCO_SOURCE_CATEGORIES];
const OFFICIAL_SOURCE_URL_TEMPLATES = loadTsExport(
  './lib/agent-manifest-url-templates.ts',
  'OFFICIAL_SOURCE_URL_TEMPLATES',
  'templates',
);

function loadSkippedTiers() {
  const tmpOut = path.join(ROOT, '.tmp-datafile-skipped-tiers.json');
  execSync(
    `npx tsx -e "import { SKIPPED_FETCH_TIERS } from './lib/agent-manifest-url-templates.ts'; import fs from 'fs'; fs.writeFileSync('${tmpOut.replace(/\\/g, '/')}', JSON.stringify([...SKIPPED_FETCH_TIERS]));"`,
    { cwd: ROOT, stdio: 'pipe' },
  );
  const arr = JSON.parse(fs.readFileSync(tmpOut, 'utf8'));
  try {
    fs.unlinkSync(tmpOut);
  } catch {
    /* ignore */
  }
  return new Set(arr);
}

const SKIPPED_FETCH_TIERS = loadSkippedTiers();

/** Load resolveManifestUrlTemplate + isProceduralGuidanceLabel via tsx batch. */
function loadManifestResolvers() {
  const tmpOut = path.join(ROOT, '.tmp-datafile-resolvers.json');
  execSync(
    `npx tsx -e "import { resolveManifestUrlTemplate, isProceduralGuidanceLabel } from './lib/agent-manifest-url-templates.ts'; import fs from 'fs'; import { AGENT_RESEARCH_SOURCE_CATEGORIES, AGENT_MOROCCO_SOURCE_CATEGORIES } from './lib/agent-research-sources.ts'; const cats = [...AGENT_RESEARCH_SOURCE_CATEGORIES, ...AGENT_MOROCCO_SOURCE_CATEGORIES]; const out = {}; for (const cat of cats) { for (const name of cat.sources) { out[name] = { template: resolveManifestUrlTemplate(name) ?? null, procedural: isProceduralGuidanceLabel(name) }; } } fs.writeFileSync('${tmpOut.replace(/\\/g, '/')}', JSON.stringify(out));"`,
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

const manifestResolvers = loadManifestResolvers();

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
    if (entry.skipped) continue;
    const label = normalizeLabel(entry.sourceLabel);
    const url = baseUrlFromTemplate(entry.urlTemplate);
    if (url && label) baseUrlByLabel.set(label, url);
  }
}

const urlOverrides = {};
if (fs.existsSync(URL_OVERRIDES)) {
  const raw = JSON.parse(fs.readFileSync(URL_OVERRIDES, 'utf8'));
  Object.assign(urlOverrides, raw.overrides ?? raw);
}

const sources = [];
const seen = new Set();
let withUrl = 0;
let proceduralCount = 0;
let skippedTierCount = 0;

for (const cat of ALL_CATEGORIES) {
  const tier = tierMap(cat.tier);
  const scores = defaultScores(tier);
  const catTierSkipped = SKIPPED_FETCH_TIERS.has(cat.tier);

  for (const name of cat.sources) {
    const id = slugify(name);
    if (seen.has(id)) continue;
    seen.add(id);

    const resolved = manifestResolvers[name] ?? {};
    const procedural = resolved.procedural === true;
    const tierSkipped = catTierSkipped;

    let baseUrl = null;
    let requiresDiscoveryGate = true;
    let notes = `From agent category ${cat.id}`;

    const override = urlOverrides[id];
    if (override && /^https?:\/\//i.test(String(override))) {
      baseUrl = baseUrlFromTemplate(String(override)) ?? String(override).replace(/\/$/, '');
    }
    if (!baseUrl) {
      const tpl = resolved.template ?? null;
      if (tpl) baseUrl = baseUrlFromTemplate(tpl);
    }
    if (!baseUrl) {
      baseUrl = baseUrlByLabel.get(normalizeLabel(name)) ?? null;
    }

    if (procedural || tierSkipped) {
      requiresDiscoveryGate = false;
      notes = procedural ? 'procedural_no_fetch' : `tier_skipped:${cat.tier}`;
      if (procedural) proceduralCount++;
      else skippedTierCount++;
    }

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
      requiresDiscoveryGate,
      categoryId: cat.id,
      notes,
    });
  }
}

const payload = {
  version: 1,
  generatedAt: new Date().toISOString(),
  sources,
  stats: {
    total: sources.length,
    withBaseUrl: withUrl,
    proceduralNoFetch: proceduralCount,
    tierSkipped: skippedTierCount,
  },
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(payload, null, 2), 'utf8');
console.log(
  `Wrote ${sources.length} sources (${withUrl} with baseUrl, ${proceduralCount} procedural, ${skippedTierCount} tier-skipped) → ${OUT}`,
);
