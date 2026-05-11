import { describe, expect, it } from 'vitest';
import {
  BUSINESS_HUB_EXPLORER_HREF,
  businessHubExplorerHref,
  EDUCATION_HUB_EXPLORER_HREF,
  educationHubExplorerHref,
  TOURISM_HUB_EXPLORER_HREF,
  tourismHubExplorerHref,
  WORK_HUB_EXPLORER_HREF,
  workHubExplorerHref,
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

describe('workHubExplorerHref', () => {
  it('uses work funnel when explorer default is not work', () => {
    expect(workHubExplorerHref(null)).toBe(WORK_HUB_EXPLORER_HREF);
    expect(workHubExplorerHref('tourism')).toBe(WORK_HUB_EXPLORER_HREF);
    expect(workHubExplorerHref('business')).toBe(WORK_HUB_EXPLORER_HREF);
  });

  it('uses objective-aligned explorer when registry default is work', () => {
    expect(workHubExplorerHref('work')).toBe('/explorer?goal=work');
    expect(workHubExplorerHref('sports_professional_abroad')).toBe('/explorer?goal=work');
  });
});

describe('tourismHubExplorerHref', () => {
  it('uses tourism funnel when explorer default is not tourism', () => {
    expect(tourismHubExplorerHref(null)).toBe(TOURISM_HUB_EXPLORER_HREF);
    expect(tourismHubExplorerHref('work')).toBe(TOURISM_HUB_EXPLORER_HREF);
    expect(tourismHubExplorerHref('studies_master')).toBe(TOURISM_HUB_EXPLORER_HREF);
  });

  it('uses objective-aligned explorer for tourism primary', () => {
    expect(tourismHubExplorerHref('tourism')).toBe('/explorer?goal=tourism');
  });
});
