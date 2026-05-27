/**
 * E2E smoke: primary Tourisme → locked explorer/compare + education hub gate.
 * Usage: npm run test:smoke:perspective [baseUrl]
 */
import { chromium } from 'playwright';

const base = process.argv[2] ?? process.env.SMOKE_BASE_URL ?? 'http://localhost:3000';

async function pickTourismeObjective(page) {
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
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addInitScript(() => {
    localStorage.removeItem('babil_objective_pref_v1');
  });
  const page = await context.newPage();

  await pickTourismeObjective(page);

  await page.goto(`${base}/explorer`, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.getByLabel(/Parcours verrouillé/i).waitFor({ state: 'visible', timeout: 20_000 });
  const lockedText = await page.getByLabel(/Parcours verrouillé/i).innerText();
  if (!/tourisme/i.test(lockedText)) {
    throw new Error(`Explorer locked goal should mention Tourisme, got: ${lockedText}`);
  }

  await page.goto(`${base}/compare`, { waitUntil: 'networkidle', timeout: 60_000 });
  const categoryStep = page.getByRole('navigation', { name: 'Étapes' });
  if (await categoryStep.isVisible().catch(() => false)) {
    throw new Error('Compare should not show category/objective steps when primary is set');
  }
  await page.getByText(/Parcours verrouillé/i).waitFor({ state: 'visible', timeout: 15_000 });

  await page.goto(`${base}/education`, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.getByRole('heading', { name: /Contenu non aligné sur votre intérêt/i }).waitFor({
    state: 'visible',
    timeout: 20_000,
  });
  const hubCatalog = page.getByRole('heading', { name: /Hub éducation/i });
  if (await hubCatalog.isVisible().catch(() => false)) {
    throw new Error('Education hub catalog should be gated for tourism primary');
  }

  console.log(`OK smoke-perspective-scope @ ${base}`);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
