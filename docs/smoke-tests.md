# Playwright smoke tests

Headless Chromium checks against a running app (`npm run dev` or `npm run start`).

## Commands

| Script | What it checks |
|--------|----------------|
| `npm run test:smoke:objectives [baseUrl]` | Wizard → disclaimer → transition → dock shows new objective |
| `npm run test:smoke:perspective [baseUrl]` | Primary Tourisme → home lens + **guest** `/explorer` (no sign-in); optional signed-in compare/education |
| `npm run test:smoke:stitch [baseUrl]` | Key routes return HTTP &lt; 400 |
| `npm run test:smoke [baseUrl]` | Runs all three in sequence |

Default base URL: `http://localhost:3000`. Production example:

```bash
npm run test:smoke -- https://babil-amber.vercel.app
```

## Perspective smoke and Clerk

**Hybrid access** (`lib/nexus-shell-routes.ts` + Clerk middleware):

- **`/explorer`** — guests may browse read-only (marketing shell, locked parcours when set).
- **`/compare`, `/schengen`, `/education`, …** — still require sign-in.

**Without credentials** — `test:smoke:perspective` still validates:

- Objective pick + transition on `/`
- Dock shows Tourisme
- Home testimonials hide off-interest cards (e.g. no “Salma M.” when primary is Tourisme)
- Guest can open `/explorer` (banner « lecture seule », parcours Tourisme verrouillé) without redirect to Clerk
- Explorer URL includes `objective=tourism` (or `goal=tourism`) when primary is Tourisme; filters use per-objective profiles (`lib/explorer-filter-engine.ts`)
- Tourism parcours **narrows** the catalog (count line mentions « alignées sur Tourisme » and **&lt; 200** destinations vs ~250 raw; optional « sur N au catalogue » suffix)

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

## User-journey audit (optional, manual)

Captures screenshots + `report.json` under `.tmp-user-audit/` (gitignored) for product review:

```bash
npm run test:audit:journey -- https://babil-amber.vercel.app
```

Related one-offs: `scripts/user-journey-country.mjs`, `scripts/user-journey-cta.mjs`.
