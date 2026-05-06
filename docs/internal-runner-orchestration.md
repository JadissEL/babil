# Agents runner orchestration (internal)

Operational reference for the advanced orchestration layer wired into [`agents/runner.ts`](../agents/runner.ts), [`lib/agent-orchestration.ts`](../lib/agent-orchestration.ts), and [`lib/agent-run-memory.ts`](../lib/agent-run-memory.ts).

## Goals

Per-country enrichment with:

- Planner lots derived from [`buildCompletenessReport`](../lib/country-completeness.ts) (`missingFields` / `criticalMissing`).
- Quality manifest (**heuristic**) for contract **critical** fields only.
- `AdvancementGate` summary stored under `full_data._agent.orchestration`.
- Run memory persisted under `.agent-state/orchestration/{country-slug}.json` (Cycles, bounded errors).

See also: [Manifest URL fetch](internal-manifest-url-fetch.md) (optional `data/agent-manifest-url-map.json` + `_agent.manifestFetch`).

## Environment

| Variable | Effect |
|---------|--------|
| `AGENT_STRICT_COUNTRY_GATE=1` | Task reaches `done` only when `advancementGate.passed` is true. Plateau shortcut is disabled. |
| `AGENT_STRICT_QUALITY_MANIFEST=1` | Gate additionally requires critical keys in the heuristic manifest to be `ok` or `single_official_ok` with `completenessScore >= 50`. |
| `AGENT_STRICT_QUALITY_MANIFEST=0` (default) | Gate still rejects explicit `conflict` flags only (none produced by current heuristic). |

## `full_data._agent.orchestration` (shape)

- `modelVersion`: e.g. `agent-orchestration-v1`
- `phase`: last persisted phase (`finalized` after each successful task write)
- `planEpoch`: monotonic counter incremented when a cycle row is appended to run memory
- `improvementCycle`: bumps when `criticalMissing.length > 0` at finalize
- `advancementGate`: `{ passed, strictCountryGate, strictQualityManifest, checks, reasonsPassed, reasonsFailed }`
- `qualityManifest`: map of critical `spec.key` → scores + `coherenceFlag`
- `planner.lots`: ordered chunks of `targetKeys` with `sourceTierHint`

## Planner priority

Lots are grouped by intelligence domain order: visa, friction, identity, provenance, education, business, driving, community, signals, morocco_decision.

## Quality heuristic (limitations)

Until fields use typed `SourcedValue` with real provenance:

- `acquisition` from the intelligence contract gates default `coherenceFlag` (`api`/`hybrid` → `single_official_ok`; `scraping`/`generated` → `insufficient_evidence`).
- Verified traveler quotes (`traveler_quotes_meta.status === 'verified'`) upgrades trust for that slice.

Treat strict quality mode as experimental: it may keep countries in retry loops until templates are replaced with sourced payloads.

## Run memory file

JSON per country slug; truncated `cycles` and `errors` to cap file growth. Failure to write memory does not abort the DB upsert; `orchestration.runMemory.persistedFile` may be null.
