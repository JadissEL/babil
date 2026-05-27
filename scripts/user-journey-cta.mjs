import { chromium } from 'playwright';

const base = 'https://babil-amber.vercel.app';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext();
await ctx.addInitScript(() => {
  localStorage.setItem(
    'babil_objective_pref_v1',
    JSON.stringify({
      version: 1,
      primarySlug: 'tourism',
      secondarySlugs: [],
      wizardCompletedAt: new Date().toISOString(),
    }),
  );
});
const page = await ctx.newPage();
await page.goto(base, { waitUntil: 'networkidle', timeout: 90000 });
const exploreLink = page.getByRole('link', { name: /ouvrir l'explorateur/i }).first();
const href = await exploreLink.getAttribute('href');
console.log('Explorer CTA href:', href);
await exploreLink.click();
await page.waitForTimeout(2000);
console.log('After click URL:', page.url());
console.log('h1:', await page.locator('h1').first().innerText().catch(() => 'n/a'));
await browser.close();
