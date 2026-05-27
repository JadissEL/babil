/**
 * E2E smoke: primary Tourisme → home lens + (when signed in) locked explorer/compare + education gate.
 * Usage: npm run test:smoke:perspective [baseUrl]
 *
 * Optional auth for protected Nexus routes:
 *   SMOKE_CLERK_EMAIL, SMOKE_CLERK_PASSWORD
 */
import { chromium } from 'playwright';

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

async function tryClerkSignIn(page) {
  const email = process.env.SMOKE_CLERK_EMAIL?.trim();
  const password = process.env.SMOKE_CLERK_PASSWORD?.trim();
  if (!email || !password) return false;

  await page.goto(`${base}/sign-in`, { waitUntil: 'networkidle', timeout: 60_000 });

  const identifier = page.locator('input[name="identifier"], input[type="email"]').first();
  await identifier.waitFor({ state: 'visible', timeout: 20_000 });
  await identifier.fill(email);
  await page.getByRole('button', { name: /continue|continuer/i }).first().click();

  const pwd = page.locator('input[name="password"], input[type="password"]').first();
  await pwd.waitFor({ state: 'visible', timeout: 20_000 });
  await pwd.fill(password);
  await page.getByRole('button', { name: /continue|continuer|sign in|se connecter/i }).first().click();

  await page.waitForURL((url) => !url.pathname.startsWith('/sign-in'), { timeout: 45_000 });
  return true;
}

async function assertProtectedPerspectiveRoutes(page) {
  await page.goto(`${base}/explorer`, { waitUntil: 'networkidle', timeout: 60_000 });
  if ((await page.title()).toLowerCase().includes('account')) {
    throw new Error('Explorer still behind auth — set SMOKE_CLERK_EMAIL/PASSWORD for full smoke');
  }
  await page.getByRole('heading', { name: 'Explorer' }).waitFor({ state: 'visible', timeout: 20_000 });
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
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await context.addInitScript(() => {
    localStorage.removeItem('babil_objective_pref_v1');
  });
  const page = await context.newPage();

  await pickTourismeObjective(page);
  await assertHomeTestimonialsScopedToTourism(page);

  const signedIn = await tryClerkSignIn(page);
  if (signedIn) {
    await assertProtectedPerspectiveRoutes(page);
    console.log(`OK smoke-perspective-scope (public + signed-in) @ ${base}`);
  } else {
    console.warn(
      'SKIP protected routes (explorer/compare/education): set SMOKE_CLERK_EMAIL and SMOKE_CLERK_PASSWORD for full smoke',
    );
    console.log(`OK smoke-perspective-scope (public home lens only) @ ${base}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
