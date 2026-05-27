/**
 * Quick user-journey audit — captures page structure and copy for review.
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const base = (process.argv[2] ?? 'https://babil-amber.vercel.app').replace(/\/$/, '');
const outDir = resolve(process.cwd(), '.tmp-user-audit');
mkdirSync(outDir, { recursive: true });

const report = [];

async function snapshot(page, label) {
  const url = page.url();
  const title = await page.title();
  const h1 = await page.locator('h1').first().innerText().catch(() => '');
  const headings = await page.locator('h2, h3').allTextContents().catch(() => []);
  const navLabels = await page
    .locator('#site-primary-nav a, #dashboard-workspace-nav a')
    .allTextContents()
    .catch(() => []);
  const navSections = await page
    .locator('#site-primary-nav p')
    .allTextContents()
    .catch(() => []);
  const explorerCount = await page
    .getByText(/alignée.*Tourisme|correspondent à vos critères/i)
    .first()
    .innerText()
    .catch(() => '');
  const body = await page.locator('body').innerText();
  const snippet = body.replace(/\s+/g, ' ').slice(0, 2500);

  report.push({
    label,
    url,
    title,
    h1,
    headings: headings.slice(0, 12),
    navLabels: navLabels.slice(0, 20),
    navSections: navSections.filter((s) => /décider|outils|services|communauté/i.test(s)).slice(0, 8),
    explorerCount,
    snippet,
  });

  await page.screenshot({ path: resolve(outDir, `${label.replace(/\W+/g, '-')}.png`), fullPage: false });
}

async function pickTourisme(page) {
  const wizard = page.getByRole('dialog', { name: /Qu'est-ce que vous cherchez/i });
  if (await wizard.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: 'Tourisme' }).first().click();
    const confirm = page.getByRole('dialog', { name: /Confirmer votre objectif/i });
    if (await confirm.isVisible({ timeout: 8000 }).catch(() => false)) {
      await page.getByLabel(/J'ai lu/i).check();
      await page.getByRole('button', { name: /Confirmer et continuer/i }).click();
      await page.waitForFunction(
        () => !document.querySelector('[role="status"][aria-busy="true"]'),
        null,
        { timeout: 25000 },
      );
    }
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.evaluate(() => localStorage.removeItem('babil_objective_pref_v1'));
  await page.goto(base, { waitUntil: 'networkidle', timeout: 90_000 });
  await snapshot(page, '01-home-before-objective');

  await pickTourisme(page);
  await page.waitForTimeout(1500);
  await snapshot(page, '02-home-after-tourisme');

  await page.goto(`${base}/explorer`, { waitUntil: 'networkidle', timeout: 60_000 });
  await snapshot(page, '03-explorer');

  await page.goto(`${base}/compare`, { waitUntil: 'networkidle', timeout: 60_000 });
  await snapshot(page, '04-compare');

  await page.goto(`${base}/schengen`, { waitUntil: 'networkidle', timeout: 60_000 });
  await snapshot(page, '05-schengen');

  await page.goto(`${base}/education`, { waitUntil: 'networkidle', timeout: 60_000 });
  await snapshot(page, '06-education');

  // Try first country from API
  const res = await page.request.get(`${base}/api/countries?limit=3`);
  let countryPath = '/countries/1';
  if (res.ok()) {
    const data = await res.json();
    const row = Array.isArray(data) ? data[0] : data?.items?.[0];
    if (row?.id) countryPath = `/countries/${row.id}`;
  }
  await page.goto(`${base}${countryPath}`, { waitUntil: 'networkidle', timeout: 60_000 });
  await snapshot(page, '07-country');

  writeFileSync(resolve(outDir, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
