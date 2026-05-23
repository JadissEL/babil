/**
 * E2E smoke: wizard → disclaimer → transition → dock shows new objective.
 * Usage: npm run test:smoke:objectives [baseUrl]
 */
import { chromium } from 'playwright';

const base = process.argv[2] ?? process.env.SMOKE_BASE_URL ?? 'http://localhost:3000';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addInitScript(() => {
    localStorage.removeItem('babil_objective_pref_v1');
  });
  const page = await context.newPage();

  await page.goto(base, { waitUntil: 'networkidle', timeout: 90_000 });

  await page.getByRole('dialog', { name: /Qu'est-ce que vous cherchez/i }).waitFor({
    state: 'visible',
    timeout: 45_000,
  });

  await page.getByRole('button', { name: 'Tourisme' }).first().click();

  await page.getByRole('dialog', { name: /Confirmer votre objectif/i }).waitFor({
    state: 'visible',
    timeout: 15_000,
  });

  await page.getByLabel(/J'ai lu et j'accepte cette transition/i).check();
  await page.getByRole('button', { name: /Confirmer et continuer/i }).click();

  await page.getByRole('status').waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForFunction(
    () => !document.querySelector('[role="status"][aria-busy="true"]'),
    null,
    { timeout: 25_000 },
  );

  const dock = page.getByRole('button', { name: /Objectif principal/i });
  await dock.waitFor({ state: 'visible', timeout: 20_000 });
  const text = await dock.innerText();
  if (!text.includes('Tourisme')) {
    throw new Error(`Expected Tourisme in dock, got: ${text}`);
  }

  console.log(`OK smoke-objective-change @ ${base}`);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
