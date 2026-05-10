import { afterEach, describe, expect, it } from 'vitest';
import { getPublicSiteOrigin } from '@/lib/site-public-url';

const keys = ['NEXT_PUBLIC_APP_URL', 'BABIL_APP_URL', 'RENDER_EXTERNAL_URL', 'VERCEL_URL'] as const;

describe('getPublicSiteOrigin', () => {
  const snapshot: Partial<Record<(typeof keys)[number], string | undefined>> = {};

  afterEach(() => {
    for (const k of keys) {
      const v = snapshot[k];
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
      delete snapshot[k];
    }
  });

  function stash() {
    for (const k of keys) {
      snapshot[k] = process.env[k];
      delete process.env[k];
    }
  }

  it('prefers NEXT_PUBLIC_APP_URL origin (host only)', () => {
    stash();
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.example.com/base';
    expect(getPublicSiteOrigin()).toBe('https://app.example.com');
  });

  it('falls back to https://VERCEL_URL', () => {
    stash();
    process.env.VERCEL_URL = 'my-app.vercel.app';
    expect(getPublicSiteOrigin()).toBe('https://my-app.vercel.app');
  });
});
