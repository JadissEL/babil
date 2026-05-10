import { describe, expect, it } from 'vitest';
import {
  EDUCATION_HUB_EXPLORER_HREF,
  educationHubExplorerHref,
} from '@/lib/cta-hrefs';

describe('educationHubExplorerHref', () => {
  it('uses education funnel when primary is not studies/training', () => {
    expect(educationHubExplorerHref(null)).toBe(EDUCATION_HUB_EXPLORER_HREF);
    expect(educationHubExplorerHref('tourism')).toBe(EDUCATION_HUB_EXPLORER_HREF);
    expect(educationHubExplorerHref('events')).toBe(EDUCATION_HUB_EXPLORER_HREF);
  });

  it('uses objective-aligned explorer when primary is studies or training', () => {
    expect(educationHubExplorerHref('studies_master')).toBe('/explorer?goal=study');
    expect(educationHubExplorerHref('training_language')).toBe('/explorer?goal=study');
    expect(educationHubExplorerHref('training_short_technical')).toBe('/explorer?goal=short_course');
  });
});
