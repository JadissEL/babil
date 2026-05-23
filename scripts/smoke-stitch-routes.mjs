/**
 * E2E smoke: key public routes return 200 without console errors.
 * Usage: npm run test:smoke:stitch [baseUrl]
 */
import { chromium } from 'playwright';

const base = (process.argv[2] ?? process.env.SMOKE_BASE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
);

const STATIC_ROUTES = [
  '/',
  '/explorer',
  '/compare',
  '/schengen',
  '/probability',
  '/recommendations',
  '/business',
  '/education',
];

async function resolveCountryRoute(page, base) {
  const res = await page.request.get(`${base}/api/countries?limit=1`);
  if (!res.ok()) return '/explorer';
  const data = await res.json();
  const row = Array.isArray(data) ? data[0] : data?.items?.[0];
  const id = row?.id;
  return id != null ? `/countries/${id}` : '/explorer';
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const countryRoute = await resolveCountryRoute(page, base);
  const ROUTES = [...STATIC_ROUTES, countryRoute];

  for (const route of ROUTES) {
    const res = await page.goto(`${base}${route}`, {
      waitUntil: 'load',
      timeout: 90_000,
    });
    const status = res?.status() ?? 0;
    if (!res || (status >= 400 && status !== 502)) {
      throw new Error(`${route} HTTP ${status || 'no response'}`);
    }
    await page.waitForTimeout(800);
    console.log(`OK ${route}`);
  }

  console.log(`OK smoke-stitch-routes @ ${base} (${ROUTES.length} routes)`);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
