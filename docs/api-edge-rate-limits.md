# Edge middleware, HTTP cache / ETag, OpenAPI, engine POST limits, and validation (catalogue D.58–D.65)

## D.58 — Middleware (Edge)

- Entry: [`proxy.ts`](../proxy.ts) (re-exported by [`middleware.ts`](../middleware.ts)).
- **Scope:** Clerk `auth().protect()` on configured routes only — no Prisma, no pays merge, no géolocalisation lourde.
- **Matcher:** static assets and `_next` are excluded to avoid useless Edge invocations.
- **Heavier work** (liste pays, moteurs) reste dans les **Route Handlers** Node (ou cache `unstable_cache` côté serveur).

## D.59 — Compression et taille des corps

- **Brotli / gzip:** en général gérés par la plateforme (ex. Vercel) et `next start` derrière un reverse proxy — pas de config obligatoire dans le repo.
- **Garde-fou corps JSON** moteurs: avant `req.json()`, les routes `POST /api/recommendation` et `POST /api/probability` vérifient `Content-Length` contre [`BABIL_ENGINE_POST_MAX_CONTENT_LENGTH`](../.env.example) (défaut **64 KiB**). Réponse **413** si dépassement.

## D.60 — Rate limiting moteurs

- Fichier: [`lib/engine-post-rate-limit.ts`](../lib/engine-post-rate-limit.ts).
- **Clé:** `user:<clerkUserId>` si connecté, sinon `anon:<ip>` (`x-forwarded-for` puis `x-real-ip`).
- **Fenêtre:** 1 minute, compteur fixe par clé (en mémoire **par instance** serverless — limite indicative sous forte horizontalité).
- Variables: [`BABIL_ENGINE_RATE_LIMIT_AUTH_PER_MINUTE`](../.env.example), `BABIL_ENGINE_RATE_LIMIT_ANON_PER_MINUTE`, `BABIL_ENGINE_RATE_LIMIT_DISABLED` (tests / debug).
- Réponse **429** + en-tête `Retry-After` (secondes) + corps `{ error, retryAfterSec, limit }`.

## D.61 — Timeouts HTTP pipeline (World Bank)

- Toutes les requêtes `fetch` vers `api.worldbank.org` passent par [`intelligencePipelineFetch`](../lib/intelligence-pipeline/http-fetch.ts) (défaut **45 s**, plafond **120 s**).
- Variable : **`INTELLIGENCE_HTTP_TIMEOUT_MS`** (voir [`.env.example`](../.env.example)). Voir aussi [intelligence-cron-and-environments.md](intelligence-cron-and-environments.md).

## D.62 — Validation Zod (corps POST moteurs)

- Schéma partagé : [`recoProbaPostBodySchema`](../lib/api-schemas/reco-proba-post-body.ts) — typage de `profile` (objet optionnel) et `playground` (booléen optionnel), **`.passthrough()`** pour clés inconnues.
- Appliqué à **`POST /api/recommendation`** et **`POST /api/probability`** : **400** + `issues` (Zod flatten) si JSON racine invalide ou types incohérents sur ces champs.
- **Admin / autres routes** : hors périmètre immédiat (backlog élargir).

## D.63 — OpenAPI (public extract)

- **File:** [`docs/openapi/babil-public-api.yaml`](openapi/babil-public-api.yaml) — OpenAPI 3.0.3, maintained in-repo (not codegen from code).
- **HTTP:** `GET /api/openapi` — returns the same YAML (`Content-Type: application/yaml`) with a 1h browser/CDN hint + SWR.
- **Scope:** `GET /api/countries`, `GET /api/countries/{id}`, `POST /api/recommendation`, `POST /api/probability`, plus self-reference for the spec route.

## D.64 — Weak ETag on country GET JSON

- Helpers: [`lib/http-weak-etag.ts`](../lib/http-weak-etag.ts) (SHA-256 prefix → `W/"..."`), [`lib/json-response-with-etag.ts`](../lib/json-response-with-etag.ts).
- **`GET /api/countries`** and **`GET /api/countries/[id]`** — success responses include **`ETag`**; **`If-None-Match`** (exact token, comma-separated list supported) → **304** with the same `Cache-Control` + `ETag` and empty body.
- ETag is over the **exact UTF-8 JSON bytes** returned for that request (including `?light=1`, pagination envelope, and optional `?intelligence=1` on detail).

## D.65 — Home LCP / hero images

- Audit: [`home-lcp-and-images.md`](home-lcp-and-images.md) — `HeroWorldCarousel` uses `next/image`, `priority` on the first slide, and `sizes`; notes crossfade vs. multi-fetch trade-off.
