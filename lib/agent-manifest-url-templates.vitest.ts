import { describe, expect, it } from 'vitest';
import {
  isProceduralGuidanceLabel,
  normalizeManifestLabel,
  resolveManifestUrlTemplate,
} from './agent-manifest-url-templates';

describe('normalizeManifestLabel', () => {
  it('maps curly apostrophe labels to templates', () => {
    const curly =
      'Ministère des Affaires Étrangères, de la Coopération Africaine et des Marocains Résidant à l’Étranger (MAECME)';
    const ascii =
      "Ministère des Affaires Étrangères, de la Coopération Africaine et des Marocains Résidant à l'Étranger (MAECME)";
    expect(normalizeManifestLabel(curly)).toBe(normalizeManifestLabel(ascii));
    expect(resolveManifestUrlTemplate(curly)).toBe('https://www.diplomatie.ma');
  });

  it('flags procedural guidance labels', () => {
    expect(isProceduralGuidanceLabel('Important: verify with consulate')).toBe(true);
    expect(isProceduralGuidanceLabel('World Bank')).toBe(false);
  });
});
