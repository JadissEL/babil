/**
 * Optional Clerk UI sign-in for Playwright smokes (Nexus routes require auth).
 * Set SMOKE_CLERK_EMAIL and SMOKE_CLERK_PASSWORD in the environment.
 *
 * @param {import('playwright').Page} page
 * @param {string} base — origin without trailing slash
 * @returns {Promise<boolean>} true when signed in
 */
export async function tryClerkSignIn(page, base) {
  const email = process.env.SMOKE_CLERK_EMAIL?.trim();
  const password = process.env.SMOKE_CLERK_PASSWORD?.trim();
  if (!email || !password) return false;

  const clerkPk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ?? '';
  if (clerkPk.includes('placeholder')) {
    console.warn('SKIP Clerk sign-in: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY looks like a CI placeholder');
    return false;
  }

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
