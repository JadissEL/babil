# Intelligence ecosystem — completion checklist

Use this as the operator “definition of done” for the autonomous enrichment stack.

## Data layers

| Layer | Artifact | Done when |
|-------|-----------|-----------|
| Bronze | `CountryObservation` + manifest excerpts | Allowlisted fetch writes rows with `sourceUrl`, `rawExcerpt`, `dedupeKey` |
| Silver | `validateAndTagObservationsForCountry` | Consensus + expectations suite pass; disputes synced to `full_data._intelligence` |
| Gold | `materializeEconomyObservationsForCountry` | Only `canPromoteField()` paths; `field_lineage` stamped |

## Manifest

- [x] `npm run agent:manifest-validate` — OK (289 rows, 131 fetchable URLs; 2026-05-23 `intelligence:self-check`)
- [x] Fetchable ratio documented (target ≥ 120/289) — **131/289** in committed map
- [ ] Procedural guidance rows use `procedural_guidance_no_fetch`

## Operations

- [ ] `npm run intelligence:status` — SLO not critical (DB reachable post-`db push`; **critical** until jobs/observations populate — 2026-05-23)
- [ ] `GET /api/health?intelligence=1` — 200 when healthy (re-check after Render/Vercel deploy from `main` `2a06b3f`)
- [ ] `GET /api/metrics/intelligence` (CRON_SECRET) — scrapable metrics (set `CRON_SECRET` in Vercel; see `.env.example`)
- [ ] Render `babil-agents` drains queue continuously
- [ ] GHA orchestrator + validate/materialize green (dispatch manually; requires `DATABASE_URL` + `ALLOW_PROD_WRITES=1` secrets)

## Quality gates

- [x] `npm run intelligence:validate-taxonomy` — OK (2026-05-23)
- [ ] `npm run intelligence:check-data-quality`
- [ ] `npm run intelligence:check-queue-alerts`
- [ ] Expectations suite blocks out-of-range materialize values

## HITL

- [ ] Admin review queue empty or triaged weekly
- [ ] DLQ poison jobs fixed in code, not redriven

## Optional LLM

- [ ] `OPENAI_API_KEY` + `AGENT_LLM_TOKEN_BUDGET_PER_TASK` on worker for contradiction batch

---

## Verification log (2026-05-23)

| Step | Result |
|------|--------|
| `npm run ci:local` | Pass (check + manifest + taxonomy + build) |
| Git push `main` | `5b8e181..2a06b3f` (4 commits: pipeline, API, UI, devops) |
| Production DB | `prisma db push` synced schema; observation migrations marked applied; removed empty `20260208120000_*` migration dir locally |
| `npm run intelligence:self-check` | Pass |
| `npm run intelligence:status` | Runs; freshness SLO **critical** until pipeline enqueues work |
| Stitch smoke | Manual: `/`, `/explorer`, `/compare`, `/schengen`, `/probability`, `/recommendations`, `/recommendation-engine`, `/business`, `/investment`, `/education` after deploy |

**Operator follow-ups:** configure `CRON_SECRET` on Vercel; GitHub secrets for intelligence workflows; trigger **Intelligence validate and materialize** workflow once `gh` is authenticated.

### Continuation (2026-05-23)

| Step | Result |
|------|--------|
| `intelligence:seed-sources` | 149 sources upserted |
| `intelligence:enqueue-stale --limit 15` | 15 `manifest_fetch` jobs enqueued |
| `intelligence:worker-once` | 15/15 succeeded; **~200** pending observations |
| GitHub CI [#229](https://github.com/JadissEL/babil/actions/runs/26324865351) / [#230](https://github.com/JadissEL/babil/actions/runs/26325415449) | Failed: Node 20 does not expand `lib/**/*.test.ts` glob → fixed in `40e9783` (`scripts/run-lib-tests.ts`) |
| Vercel production | **https://babil-amber.vercel.app** — deploy `40e9783`; queue cron **daily** (`0 6 * * *`) for Hobby plan |
| `CRON_SECRET` | Set via CLI had trailing newline (blocks build). **Removed** — add in [Vercel → babil → Settings → Environment Variables](https://vercel.com/jadissels-projects/babil/settings/environment-variables) (Production), paste hex with no spaces/newlines, then redeploy |
| `gh auth login` | Still required to dispatch **Intelligence validate and materialize** |

**Note:** `GET /api/health?intelligence=1` may return **503** while `materialized_fresh_ratio` is below SLO threshold. Liveness: `GET /api/health` → **200**.

### Full ops run (2026-05-23 — do-everything)

| Step | Result |
|------|--------|
| Enqueue stale + low-completeness + freshness + visa_friction | 54 jobs created |
| Drain queue (3 rounds) | 54/54 succeeded; `pending=0` |
| `intelligence:world-bank` | 231 observations; 221 countries matched |
| `intelligence:validate` | 231 promotable fields |
| `intelligence:materialize-no-gate` | 40 countries materialized (`economy_materialized_at` stamped) |
| `intelligence:status` | Queue **ok**; freshness **critical** (`materialized_fresh_ratio=0.2`, target ≥0.7) |
| `GET /api/health` (prod) | **200** |
| `GET /api/health?intelligence=1` (prod) | **503** (freshness SLI; expected until more countries materialize) |
| `test:smoke:objectives` (prod) | Pass |
| `test:smoke:stitch` (prod) | Pass (9 routes) |
| `quotes:import --dry-run` | 0 verified quotes (skip apply) |
