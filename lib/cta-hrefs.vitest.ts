import { describe, expect, it } from 'vitest';
import {
  compareHrefForGuest,
  ctaCompareHref,
  signInRedirectHref,
} from '@/lib/cta-hrefs';

describe('compareHrefForGuest', () => {
  it('returns sign-in redirect with compare path for guests', () => {
    const product = ctaCompareHref('tourism');
    const href = compareHrefForGuest(true, 'tourism');
    expect(href).toContain('/sign-in?redirect_url=');
    expect(decodeURIComponent(href.split('redirect_url=')[1] ?? '')).toBe(product);
  });

  it('returns product compare path for signed-in users', () => {
    expect(compareHrefForGuest(false, 'tourism')).toBe(ctaCompareHref('tourism'));
  });
});

describe('signInRedirectHref', () => {
  it('uses relative redirect on server', () => {
    expect(signInRedirectHref('/compare?objective=tourism')).toBe(
      '/sign-in?redirect_url=%2Fcompare%3Fobjective%3Dtourism',
    );
  });
});
