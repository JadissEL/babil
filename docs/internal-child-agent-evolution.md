# Child agent evolution (supervisor + shadow / canary)

This document describes the **versioned child enrichment path** that reuses the same deterministic merge loop as the supervisor (`lib/agent-enrichment-loop.ts`), with a **smaller pass budget** driven by policy files. Learning is **metrics-backed only** (JSONL aggregates → `patterns.v{n}.json`); there is no opaque LLM “self-training”.

## Layout

| Path | Role |
|------|------|
| `.agent-state/supervisor-metrics/events.jsonl` | Append-only supervisor (and shadow comparison) events |
| `.agent-state/child-agent/current.json` | Points to active policy folder `v1`, `v2`, … |
| `.agent-state/child-agent/v{n}/policy.json` | Declarative knobs (`maxShadowPasses`, optional `prioritizedCriticalKeys`) |
| `.agent-state/child-agent/patterns.v{n}.json` | Offline extractor output (see script below) |
| `data/child-agent-bootstrap/` | Committed defaults if `.agent-state` has no child config yet |

## Environment variables

| Variable | Values | Meaning |
|----------|--------|---------|
| `AGENT_CHILD_MODE` | `off` (default), `shadow`, `canary` | `shadow` / `canary` run the child compare path after each successful supervisor cycle (extra network work for the child clone). |
| `AGENT_CHILD_CANARY_COUNTRIES` | Comma-separated country names | When in `canary` mode with write enabled, only these countries may receive a child payload. |
| `AGENT_CHILD_CANARY_WRITE` | `1` to enable | If set with `AGENT_CHILD_MODE=canary`, and the child beats the supervisor score by at least `AGENT_CHILD_PROMOTION_SCORE_DELTA`, the upsert uses the child’s `full_data` (with `_agent.childProvenance`). |
| `AGENT_CHILD_PROMOTION_SCORE_DELTA` | Number, default `0.5` | Minimum completeness score advantage for canary write. |
| `AGENT_SUPERVISOR_METRICS_MAX_BYTES` | Bytes, default 52_428_800 | Soft cap; older lines may be trimmed from `events.jsonl`. |

## Promotion criteria (operational)

1. Collect metrics over a **fixed window** (countries or calendar time).
2. Run `npm run agent:extract-patterns` and inspect `patterns.latest.json`.
3. Bump `activeVersion` under `.agent-state/child-agent/current.json` only when a new `policy.json` reflects **measurable** policy deltas justified by aggregates (for example raising `maxShadowPasses` when stagnation dominates).
4. **Rollback** by pointing `activeVersion` back to the previous folder if canary metrics regress versus the prior window.

The supervisor remains the **only** default writer to Prisma; canary child writes are opt-in and country-scoped.

## Scripts

- `npm run agent:extract-patterns` — reads JSONL, writes `patterns.v{n}.json` + `patterns.latest.json`.

## Governance

- **Supervisor** (`agents/runner.ts`): scheduling, strict gate, Prisma upsert, orchestration persistence.
- **Child**: same merge primitives, fewer passes, **no separate DB role** in shadow mode; optional canary merge only with explicit env + whitelist.
