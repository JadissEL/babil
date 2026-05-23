/**
 * CI: glossary ↔ taxonomy v1 ↔ materialize targets stay aligned.
 * npm run intelligence:validate-taxonomy
 */
import { INTELLIGENCE_FIELDPATH_GLOSSARY } from '../lib/intelligence-fieldpath-glossary';
import { MATERIALIZE_TARGETS } from '../lib/intelligence-pipeline/taxonomy-v1';

function main() {
  const glossaryPaths = new Set(INTELLIGENCE_FIELDPATH_GLOSSARY.map((e) => e.fieldPath));
  const materializePaths = Object.keys(MATERIALIZE_TARGETS);
  const errors: string[] = [];

  for (const fp of materializePaths) {
    if (!glossaryPaths.has(fp)) {
      errors.push(`materialize target missing glossary entry: ${fp}`);
    }
    const entry = INTELLIGENCE_FIELDPATH_GLOSSARY.find((e) => e.fieldPath === fp);
    if (entry?.materializedPathFr) {
      const expected = MATERIALIZE_TARGETS[fp].fullDataPath;
      if (entry.materializedPathFr !== expected) {
        errors.push(
          `glossary materializedPathFr mismatch for ${fp}: ${entry.materializedPathFr} vs ${expected}`,
        );
      }
    }
  }

  if (errors.length > 0) {
    console.error(`[intelligence:validate-taxonomy] ${errors.length} error(s)`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  console.log(
    `[intelligence:validate-taxonomy] OK — ${materializePaths.length} materialize paths, ${glossaryPaths.size} glossary entries`,
  );
}

main();
