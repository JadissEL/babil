/**
 * E2E smoke: primary Tourisme → home lens + (when signed in) locked explorer/compare + education gate.
 * Usage: npm run test:smoke:perspective [baseUrl]
 *
 * Optional auth for protected Nexus routes:
 *   SMOKE_CLERK_EMAIL, SMOKE_CLERK_PASSWORD
 */
import { chromium } from 'playwright';
import { tryClerkSignIn } from './smoke-clerk-sign-in.mjs';

const base = (process.argv[2] ?? process.env.SMOKE_BASE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
);

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

async function assertHomeTestimonialsScopedToTourism(page) {
  await page.getByText('Karim B.').waitFor({ state: 'visible', timeout: 15_000 });
  const studyVisible = await page.getByText('Salma M.').isVisible().catch(() => false);
  if (studyVisible) {
    throw new Error('Home should hide off-interest testimonials when primary is Tourisme');
  }
}

async function assertGuestExplorerReadable(page) {
  await page.goto(`${base}/explorer`, { waitUntil: 'networkidle', timeout: 60_000 });
  const url = page.url();
  if (url.includes('/sign-in')) {
    throw new Error('Guest should reach /explorer without Clerk sign-in');
  }
  const title = (await page.title()).toLowerCase();
  if (title.includes('account') && !title.includes('introuvable')) {
    throw new Error('Guest should reach /explorer without Clerk sign-in');
  }
  if (title.includes('introuvable') || title.includes('not found')) {
    throw new Error('Guest /explorer returned 404 — deploy or route may be broken');
  }
  await page.getByRole('heading', { name: 'Explorer' }).waitFor({ state: 'visible', timeout: 20_000 });
  await page.getByRole('status').filter({ hasText: /lecture seule/i }).waitFor({
    state: 'visible',
    timeout: 15_000,
  });
  const locked = page.getByLabel(/Parcours verrouillé/i);
  await locked.waitFor({ state: 'visible', timeout: 20_000 });
  const lockedText = await locked.innerText();
  if (!/tourisme/i.test(lockedText)) {
    throw new Error(`Explorer locked goal should mention Tourisme, got: ${lockedText}`);
  }
}

async function assertProtectedPerspectiveRoutes(page) {
  await page.goto(`${base}/explorer`, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.getByRole('heading', { name: 'Explorer' }).waitFor({ state: 'visible', timeout: 20_000 });
  await page.getByLabel(/Parcours verrouillé/i).waitFor({ state: 'visible', timeout: 20_000 });
  const lockedText = await page.getByLabel(/Parcours verrouillé/i).innerText();
  if (!/tourisme/i.test(lockedText)) {
    throw new Error(`Explorer locked goal should mention Tourisme, got: ${lockedText}`);
  }
  const explorerUrl = page.url();
  if (!/[?&]objective=tourism/i.test(explorerUrl) && !/[?&]goal=tourism/i.test(explorerUrl)) {
    throw new Error(
      `Explorer URL should include objective=tourism or goal=tourism, got: ${explorerUrl}`,
    );
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
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  // Clear once before the wizard — avoid addInitScript (runs on every navigation and wipes the pick).
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.evaluate(() => localStorage.removeItem('babil_objective_pref_v1'));

  await pickTourismeObjective(page);
  await assertHomeTestimonialsScopedToTourism(page);
  await assertGuestExplorerReadable(page);

  const signedIn = await tryClerkSignIn(page, base);
  if (signedIn) {
    await assertProtectedPerspectiveRoutes(page);
    console.log(`OK smoke-perspective-scope (public + signed-in) @ ${base}`);
  } else {
    console.warn(
      'SKIP signed-in routes (compare/education): set SMOKE_CLERK_EMAIL and SMOKE_CLERK_PASSWORD for full smoke',
    );
    console.log(`OK smoke-perspective-scope (public home + guest explorer) @ ${base}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
