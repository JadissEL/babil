# Catalogue E — sécurité, conformité, supply chain (notes repo)

Items **E.66–E.77** du [enhancements-backlog-100.md](enhancements-backlog-100.md). Ce fichier résume ce qui est **en place dans le dépôt** et ce qui reste produit / juridique.

## E.66 — RBAC `/api/admin/*`

- Toutes les routes sous `app/api/admin/**/route.ts` appellent `getAdminUser()` et renvoient **403** si non admin.
- Garde automatisée : [`lib/admin-api-routes.test.ts`](../lib/admin-api-routes.test.ts).

## E.67 — Journal d’audit admin (persistant)

- **Modèle** : `AdminAuditLog` dans [`prisma/schema.prisma`](../prisma/schema.prisma) (`adminUserId`, `action`, `resource`, `detail`, `metadata` JSON optionnel) ; migration `20260510130000_admin_audit_log`.
- **Écriture** : [`lib/admin-audit-log.ts`](../lib/admin-audit-log.ts) — `recordAdminAudit` (erreurs DB ignorées pour ne pas bloquer les mutations admin).
- **Call sites (exemples)** : après succès sur [`PATCH /api/admin/countries/[id]`](../app/api/admin/countries/[id]/route.ts) (`country.patch`) et changement de statut [`PATCH .../delegated-application-requests/[id]`](../app/api/admin/delegated-application-requests/[id]/route.ts) (`delegated_request.status_change`).
- **Lecture** : [`GET /api/admin/audit-log`](../app/api/admin/audit-log/route.ts) — admin uniquement, `?limit=1..100` (défaut 50), tri récent d’abord.
- **Garde tests** : [`lib/admin-audit-wiring.test.ts`](../lib/admin-audit-wiring.test.ts).

## E.69 — En-têtes de sécurité (Next)

- Config : [`next.config.js`](../next.config.js) — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-DNS-Prefetch-Control` ; **HSTS** uniquement quand `NODE_ENV === 'production'`.
- **CSP** stricte non appliquée ici (souvent couplée à nonces / intégrations Clerk) — à traiter dans une itération dédiée si besoin.

## E.70 — Secrets et GitHub Actions

- Les workflows utilisent des **GitHub Encrypted Secrets** (`secrets.*`) pour `DATABASE_URL`, etc. — ne pas logger le corps des réponses ni les URLs complètes avec mot de passe.
- **`CRON_SECRET`** (si utilisé par des routes protégées) : rotation manuelle côté hébergeur + mise à jour des secrets ; ne pas committer de valeurs.

## E.72 — Rate limit soumission commentaires

- Module : [`lib/comment-post-rate-limit.ts`](../lib/comment-post-rate-limit.ts) — appliqué à **`POST /api/comments`** après auth.
- **Clé utilisateur** : limite par minute (défaut **12**, `BABIL_COMMENT_POST_RATE_LIMIT_PER_MINUTE`).
- **Clé IP** (optionnelle) : `BABIL_COMMENT_POST_RATE_LIMIT_PER_IP_PER_MINUTE` (défaut **40** ; mettre **0** pour désactiver le bucket IP).
- Réponse **429** + `Retry-After` + `{ error, retryAfterSec, limit }` ; désactivation tests : `BABIL_COMMENT_POST_RATE_LIMIT_DISABLED=1`.

## E.73 — Chiffrement at rest / sauvegardes

- **À confirmer avec l’hébergeur DB** (ex. Neon, Render) : chiffrement au repos, rétention des backups, région des données. Ce dépôt ne remplace pas une politique d’hébergement signée.

## E.74 — Sous-traitants / DPA

- Point d’entrée produit typique : **Clerk** (auth), **hébergeur** (app + DB), éventuellement **Vercel/Render**. Les accords (DPA) sont **hors repo** ; tenir une liste à jour côté conformité interne.

## E.75 — Tests de portée API utilisateur

- Garde : [`lib/user-private-api-scope.test.ts`](../lib/user-private-api-scope.test.ts) — vérifie que favoris, historique et export RGPD ne lisent pas un `userId` fourni par le client (query/body).

## E.77 — Audit dépendances & Dependabot

- **CI** : après `npm ci`, `npm run audit:ci` = `npm audit --omit=dev --audit-level=critical` — bloque les vulnérabilités **critiques** en dépendances de production ; les findings **high** (ex. avis Next.js tant que la majeure reste 14.x) restent visibles via `npm audit` local et les PR Dependabot.
- **Dependabot** : [`.github/dependabot.yml`](../.github/dependabot.yml) (npm + GitHub Actions, hebdomadaire).

## Non couverts ici (backlog code / produit)

- **E.68** — contrôles CSRF / Origin ciblés.
- **E.71** — masquage PII dans erreurs client.
- **E.76** — webhooks signés.
