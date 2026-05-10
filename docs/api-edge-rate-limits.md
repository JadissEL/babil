# Edge middleware, compression, engine POST limits, and validation (catalogue D.58–D.62)

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
