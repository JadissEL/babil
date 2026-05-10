# Edge middleware, compression, and engine POST limits (catalogue D.58–D.60)

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
