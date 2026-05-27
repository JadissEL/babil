import { chromium } from 'playwright';

const base = 'https://babil-amber.vercel.app';
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
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

const res = await page.request.get(`${base}/api/countries?limit=5`);
const data = await res.json();
const rows = Array.isArray(data) ? data : data?.items ?? [];
const france = rows.find((c) => /france/i.test(c.name)) ?? rows[0];
const id = france?.id ?? 1;
console.log('Country:', france?.name, 'id', id);

await page.goto(`${base}/countries/${id}`, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(4000);

const h1 = await page.locator('h1').allTextContents();
const h2 = await page.locator('h2').allTextContents();
const body = await page.locator('body').innerText();
console.log('h1:', h1);
console.log('h2 sample:', h2.slice(0, 10));
console.log('body len:', body.length);
console.log('snippet:', body.replace(/\s+/g, ' ').slice(0, 2200));

await browser.close();
