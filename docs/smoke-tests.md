# Playwright smoke tests

Headless Chromium checks against a running app (`npm run dev` or `npm run start`).

## Commands

| Script | What it checks |
|--------|----------------|
| `npm run test:smoke:objectives [baseUrl]` | Wizard → disclaimer → transition → dock shows new objective |
| `npm run test:smoke:perspective [baseUrl]` | Primary Tourisme → home testimonials filtered; optional signed-in explorer/compare/education |
| `npm run test:smoke:stitch [baseUrl]` | Key routes return HTTP &lt; 400 |
| `npm run test:smoke [baseUrl]` | Runs all three in sequence |

Default base URL: `http://localhost:3000`. Production example:

```bash
npm run test:smoke -- https://babil-amber.vercel.app
```

## Perspective smoke and Clerk

Nexus product routes (`/explorer`, `/compare`, `/education`, …) require a signed-in user (`lib/nexus-shell-routes.ts` + Clerk middleware).

**Without credentials** — `test:smoke:perspective` still validates:

- Objective pick + transition on `/`
- Dock shows Tourisme
- Home testimonials hide off-interest cards (e.g. no “Salma M.” when primary is Tourisme)

**Full coverage** — set in the shell or GitHub Actions secrets:

```bash
# In .env.local (auto-loaded by npm run test:smoke) or export in the shell:
SMOKE_CLERK_EMAIL=e2e@your-domain.test
SMOKE_CLERK_PASSWORD=...
npm run test:smoke:perspective -- http://127.0.0.1:3000
```

Sign-in UI flow: `scripts/smoke-clerk-sign-in.mjs` (shared helper).

### CI

The `smoke` job in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs objectives + perspective (public) + stitch.

For **signed-in** perspective checks in CI you need:

1. Real Clerk keys (not `pk_test_babil_ci_placeholder`) in workflow `env`, and  
2. Repository secrets `SMOKE_CLERK_EMAIL` and `SMOKE_CLERK_PASSWORD` for a dedicated test user.

Until then, CI intentionally runs the public perspective subset only.
