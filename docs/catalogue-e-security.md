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

## E.68 — CSRF / contrôle d’`Origin` (mutations en production)

- Module : [`lib/mutation-origin-guard.ts`](../lib/mutation-origin-guard.ts) — pour **`POST` / `PUT` / `PATCH` / `DELETE`**, en **`NODE_ENV === 'production'`** uniquement, exige que l’en-tête **`Origin`** (ou à défaut l’origine du **`Referer`**) soit dans une liste dérivée de l’environnement.
- **Sources d’origines autorisées** : `NEXT_PUBLIC_APP_URL`, `BABIL_APP_URL`, `BABIL_ALLOWED_ORIGINS` (liste séparée par virgules), `VERCEL_URL` → `https://…`, `RENDER_EXTERNAL_URL`.
- **Hors production** : garde désactivée (dev local). **Tests / scripts** : `BABIL_MUTATION_ORIGIN_GUARD_DISABLED=1`.
- **Handlers couverts** : mutations sous `app/api/user/*`, `POST /api/comments`, `PATCH`/`DELETE /api/comments/[id]`, `POST /api/delegated-application-requests`, `PATCH` admin pays / demandes déléguées, **`POST /api/recommendation`** et **`POST /api/probability`**.
- **Non couvert** : `GET` (y compris cron `CRON_SECRET`) — pas de garde `Origin` sur les lectures planifiées.
- Garde câblage : [`lib/mutation-origin-wiring.test.ts`](../lib/mutation-origin-wiring.test.ts).

> **Domaine personnalisé (Vercel / Render)** : si le navigateur envoie `Origin: https://votredomaine.com`, ajoutez cette URL (ou utilisez `BABIL_ALLOWED_ORIGINS` avec plusieurs origines) en plus de `VERCEL_URL` si besoin.

## E.69 — En-têtes de sécurité (Next)

- Config : [`next.config.js`](../next.config.js) — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-DNS-Prefetch-Control` ; **HSTS** uniquement quand `NODE_ENV === 'production'`.
- **CSP** stricte non appliquée ici (souvent couplée à nonces / intégrations Clerk) — à traiter dans une itération dédiée si besoin.

## E.70 — Secrets et GitHub Actions

- Les workflows utilisent des **GitHub Encrypted Secrets** (`secrets.*`) pour `DATABASE_URL`, etc. — ne pas logger le corps des réponses ni les URLs complètes avec mot de passe.
- **`CRON_SECRET`** (si utilisé par des routes protégées) : rotation manuelle côté hébergeur + mise à jour des secrets ; ne pas committer de valeurs.

## E.71 — Messages d’erreur API sans PII ni stack (client)

- Module : [`lib/api-public-error.ts`](../lib/api-public-error.ts).
- **`publicApiErrorMessage(error, fallback)`** — utilisé dans les réponses **5xx** des route handlers (`{ error: … }`) pour éviter emails, URL de connexion DB (`postgresql://…`), jetons `Bearer`, JWT, clés type Stripe, et **lignes de stack** (`at …`).
- **`scrubSensitiveClientText`** — appliqué aux champs d’erreur **admin agents** (`failedTasks[].error`) et au **`detail`** de l’API intelligence summary en dégradation.
- Tests : [`lib/api-public-error.test.ts`](../lib/api-public-error.test.ts).

## E.72 — Rate limit soumission commentaires + UI modération

- Module : [`lib/comment-post-rate-limit.ts`](../lib/comment-post-rate-limit.ts) — appliqué à **`POST /api/comments`** après auth.
- **Clé utilisateur** : limite par minute (défaut **12**, `BABIL_COMMENT_POST_RATE_LIMIT_PER_MINUTE`).
- **Clé IP** (optionnelle) : `BABIL_COMMENT_POST_RATE_LIMIT_PER_IP_PER_MINUTE` (défaut **40** ; mettre **0** pour désactiver le bucket IP).
- Réponse **429** + `Retry-After` + `{ error, retryAfterSec, limit }` ; désactivation tests : `BABIL_COMMENT_POST_RATE_LIMIT_DISABLED=1`.
- **UI** : page [`/moderation`](../app/(dashboard)/moderation/page.tsx) — file `PENDING`, actions Approuver / Refuser / Supprimer, bouton **Actualiser** (recharge liste).

## E.73 — Chiffrement at rest / sauvegardes

À valider avec l’hébergeur PostgreSQL et l’équipe conformité (hors code). **Checklist repo :**

| Sujet | Vérification typique |
|--------|------------------------|
| Chiffrement au repos | Console **Neon** / **Render PostgreSQL** : doc « encryption at rest » / disques managés. |
| Région des données | Région du cluster DB vs exigences RGPD / transferts. |
| Sauvegardes (PITR / snapshots) | Rétention, restauration testée, accès restreint. |
| Secrets | `DATABASE_URL` uniquement en variables d’environnement / secrets CI — jamais dans les réponses API (voir **E.71**). |

## E.74 — Sous-traitants / DPA (registre produit)

Les contrats (DPA) se signent **hors dépôt**. **Processors typiques** à suivre dans le registre interne :

| Service | Rôle |
|---------|------|
| **Clerk** | Authentification / sessions |
| **Hébergeur app** (ex. Vercel, Render) | Exécution Next.js, logs runtime |
| **PostgreSQL managé** (ex. Neon sur Render) | Données applicatives |
| **GitHub** | CI, secrets Actions, code |

## E.75 — Tests de portée API utilisateur

- Garde : [`lib/user-private-api-scope.test.ts`](../lib/user-private-api-scope.test.ts) — vérifie que favoris, historique, export RGPD et **demandes déléguées** (liste + détail) ne lisent pas un `userId` fourni par le client (query/body) et que le détail délégué impose `row.userId === auth`.

## E.77 — Audit dépendances & Dependabot

- **CI** : après `npm ci`, `npm run audit:ci` = `npm audit --omit=dev --audit-level=critical` — bloque les vulnérabilités **critiques** en dépendances de production ; les findings **high** (ex. avis Next.js tant que la majeure reste 14.x) restent visibles via `npm audit` local et les PR Dependabot.
- **Dependabot** : [`.github/dependabot.yml`](../.github/dependabot.yml) (npm + GitHub Actions, hebdomadaire).

## Non couverts ici (backlog code / produit)

- **E.76** — webhooks signés.
