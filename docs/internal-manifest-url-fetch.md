# Manifest URL fetch (300 resources → HTTP)

The research manifest in [`lib/agent-research-sources.ts`](../lib/agent-research-sources.ts) lists **labels** only. To run real requests, add a sidecar map file and optional env overrides.

## Workflow: scaffold → edit → run

1. **Generate a skeleton** (one row per manifest label, empty `urlTemplate`):

   ```bash
   npm run agent:manifest-scaffold
   ```

   Writes committed [`data/agent-manifest-url-map.scaffold.json`](../data/agent-manifest-url-map.scaffold.json) (regenerate after manifest changes in TS).

2. **Fill URLs** in a copy: merge rows into **`data/agent-manifest-url-map.json`** (gitignored). Only entries with a non-empty `https` `urlTemplate` that parses after placeholder substitution are loaded by the runner; empty rows are ignored.

3. **Run** `npm run agents:start` (or your worker). Inspect `full_data._agent.manifestFetch` and `.agent-state/orchestration/{slug}.json` (`manifestFetchCursor`, per-source `etag` / `lastFetchedAt`).

## World Bank and other APIs using country codes

- Placeholders **`{country}`** and **`{encodedCountry}`** use the **display name** stored in tasks / Prisma (`Country.name`), e.g. `France`, `United States`.
- The [World Bank country API](https://api.worldbank.org/v2/country/) typically expects **ISO-2 or ISO-3** codes in the path (e.g. `FR`, `USA`), not arbitrary display strings. A template like `.../country/{encodedCountry}/...` may **404** if `{country}` is not a valid Bank code.
- **Mitigations:** (a) use templates that accept names only where the upstream API documents it; (b) add a dedicated placeholder later (e.g. `{wbCode}`) backed by a small `countryName → code` table; (c) keep one working template per provider and expand the map gradually.

## Map file

- **Path (default):** `data/agent-manifest-url-map.json` (gitignored; copy from [`data/agent-manifest-url-map.example.json`](../data/agent-manifest-url-map.example.json)).
- **Override:** `AGENT_MANIFEST_MAP_PATH` = absolute or cwd-relative path.

### JSON shape

```json
{
  "version": "1",
  "entries": [
    {
      "categoryId": "official_global",
      "sourceLabel": "World Bank",
      "method": "GET",
      "urlTemplate": "https://api.worldbank.org/v2/country/{encodedCountry}/indicator/NY.GDP.MKTP.CD?format=json&per_page=2",
      "responseKind": "json"
    }
  ]
}
```

- **`categoryId`** and **`sourceLabel`** must match the manifest **exactly** (same strings as in `AGENT_RESEARCH_SOURCE_CATEGORIES` / `AGENT_MOROCCO_SOURCE_CATEGORIES`).
- **`method`:** only `GET` is supported today.
- **`urlTemplate`:** must be `https://`. Placeholders:
  - `{country}` — display name (e.g. `France`)
  - `{region}` — task region
  - `{slug}` — same slug as run-memory files ([`orchestrationSlugForCountry`](../lib/agent-run-memory.ts))
  - `{encodedCountry}` — `encodeURIComponent(country)`
- **`responseKind`:** optional `json` | `text` (informational; responses are stored as truncated text excerpts).

Invalid templates or non-https dummy URLs are **dropped** when loading the map; if nothing valid remains, the map is treated as missing.

## Security

- Only **https** URLs are fetched.
- Response host must appear in the **allowlist** built from all map templates (after substituting dummy values for placeholders). Any other host is rejected.

## Runner behaviour

Implemented in [`lib/agent-manifest-source-fetch.ts`](../lib/agent-manifest-source-fetch.ts), invoked from [`agents/runner.ts`](../agents/runner.ts) after orchestration persistence.

- **Join list:** global manifest rows first, then Morocco rows; only rows with a matching map entry are fetchable.
- **Cursor:** stored in [run memory](../lib/agent-run-memory.ts) as `manifestFetchCursor` (round-robin over the join list).
- **Per country cycle:** fetches at most **`AGENT_MANIFEST_FETCH_PER_CYCLE`** (default `25`) URLs, within **`AGENT_MANIFEST_FETCH_BUDGET_MS`** (default `25000` ms), with **`AGENT_MANIFEST_FETCH_CONCURRENCY`** (default `3`) parallel workers.
- **TTL:** `AGENT_MANIFEST_REFETCH_TTL_MS` (default `86400000` = 24h). Set to **`0`** to refetch every cycle (heavy; may hit rate limits).
- **Timeouts / size:** `AGENT_MANIFEST_FETCH_TIMEOUT_MS` (default `15000`), `AGENT_MANIFEST_MAX_BODY_BYTES` (default `2000000`), `AGENT_MANIFEST_EXCERPT_CHARS` (default `12000`; excerpts in `full_data._agent.manifestFetch.results` are capped at 2000 chars in the runner).
- **ETag / 304:** If a prior response stored an `etag` in run memory for a source, the next request sends **`If-None-Match`**. On **304 Not Modified**, the result is marked `notModified` and the body is not re-downloaded. Uses **`AbortSignal.timeout`** when available (Node 18+), otherwise a timer-backed `AbortSignal`.

## Enable / disable

- **`AGENT_MANIFEST_FETCH_ENABLED=0`** — skip the whole batch (default is on).

## Results in `full_data`

When a map is present and the batch runs, `_agent.manifestFetch` contains `mapVersion`, `runAt`, `totalFetchable`, `cursor`, optional `skippedReason`, and `results` (per-URL summary + excerpt).

## Progressive rollout

You do **not** need 300 URLs on day one: unmapped manifest rows stay metadata-only. Add map entries over time; the cursor advances over the growing join list.

## Legal / operational notes

Respect each site’s **Terms of Use** and **robots.txt**; prefer official APIs and exports. The runner does not parse robots.txt automatically. Handle **429** / errors in logs and `sourcesIndex` entries under keys `manifestFetch:{categoryId}:{sourceLabel}`.
