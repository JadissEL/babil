import { describe, expect, it } from 'vitest';
import {
  BUSINESS_HUB_EXPLORER_HREF,
  businessHubExplorerHref,
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

describe('businessHubExplorerHref', () => {
  it('uses business funnel when primary explorer default is not business', () => {
    expect(businessHubExplorerHref(null)).toBe(BUSINESS_HUB_EXPLORER_HREF);
    expect(businessHubExplorerHref('tourism')).toBe(BUSINESS_HUB_EXPLORER_HREF);
    expect(businessHubExplorerHref('work')).toBe(BUSINESS_HUB_EXPLORER_HREF);
    expect(businessHubExplorerHref('sports_professional_abroad')).toBe(BUSINESS_HUB_EXPLORER_HREF);
  });

  it('uses objective-aligned explorer when registry explorer default is business', () => {
    expect(businessHubExplorerHref('business')).toBe('/explorer?goal=business');
    expect(businessHubExplorerHref('startup')).toBe('/explorer?goal=business');
    expect(businessHubExplorerHref('creator_influencer_abroad')).toBe('/explorer?goal=business');
    expect(businessHubExplorerHref('small_business_street_food')).toBe('/explorer?goal=business');
  });
});
