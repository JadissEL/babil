# PAGE 39 — “RAMPART”
## Frontière auth Clerk sur l’Edge (`proxy.ts` — `clerkMiddleware`)

### File Name
`39-rampart-clerk-edge-middleware.md`

### Page Type
System / Edge middleware (pas une URL — s’exécute **avant** layouts & pages)

### Related User Journeys
- Accès à une route protégée sans session → écran / redirect Clerk
- Corrélation logs API (`x-babil-request-id`) en support / observabilité

### Connected Pages
- **Couplé :** **PAGE 33** (surfaces UI Clerk — modale, hosted) ; **PAGE 35** (routes dashboard souvent protégées ici)
- **Routes concernées :** matcher `isProtectedRoute` ci-dessous (aligné code)

---

## 1. Page Purpose
Documenter **où** la session est imposée côté serveur Edge : liste des préfixes protégés, propagation **request id**, et journalisation JSON optionnelle des hits **`/api/*`**. Complète **PAGE 33** (expérience utilisateur auth) par la **politique d’accès réseau**.

---

## 2. Primary User Actions
- **Utilisateur :** aucune UI dans ce fichier — effet visible = accès autorisé ou flux Clerk si route protégée.
- **Ops / dev :** activer `BABIL_API_ACCESS_LOG=1` (ou défaut sur Vercel) pour logs structurés ; couper avec `BABIL_API_ACCESS_LOG=0`.

---

## 3. UX Goals
- **Latence Edge** : middleware **léger** — pas de Prisma, pas de gros JSON, pas de géoloc (commentaire code).
- **Prévisibilité** : même liste de routes pour produit / support / Stitch (table §5.2).

---

## 4. Layout Architecture
**Fichier :** `proxy.ts` (export default `clerkMiddleware`).

**Flux :** `resolveRequestId(req)` → copie headers + `BABIL_REQUEST_ID_HEADER` sur la requête mutée → si `isProtectedRoute(req)` alors `await auth.protect()` → `NextResponse.next({ request: { headers }})` → header réponse request id → éventuellement **log JSON** une ligne par requête API.

---

## 5. Full Section Breakdown

### 5.1 `resolveRequestId`
- **Ordre :** header projet `BABIL_REQUEST_ID_HEADER` → `x-request-id` → `x-vercel-id` → `crypto.randomUUID()`.

### 5.2 `isProtectedRoute` — préfixes protégés
La source de vérité est **`lib/auth-protected-routes.ts`** → `PROTECTED_ROUTE_PATTERNS` consommé par `createRouteMatcher([...])` dans `proxy.ts`. Ne pas dupliquer une liste exhaustive ici : elle dérive des routes produit Nexus + API user/admin (voir module + tests `lib/auth-protected-routes.test.ts`).

Points clés produit :

- **`/` (accueil)** : **non protégé** au Edge — anonymes chargent l’accueil marketing ; après session Clerk, le shell Mobility Intel sur `/` est choisi **côté client** (`SiteChrome` — **PAGE 35** §11).
- **Outils workspace / explorer** (`/overview`, `/probability`, `/explorer`, `/recommendations`, etc.) : **protégés** — `auth.protect()` → flux Clerk avec retour sur l’URL demandée.

**Publics (exemples, hors matcher produit)** : notamment `/`, `/countries/*`, `/legal`, `/sign-in`, `/sign-up` (et tout chemin volontairement absent de `PROTECTED_ROUTE_RULES`).

### 5.3 `auth.protect()`
- **Purpose :** session Clerk requise pour les chemins §5.2 ; comportement redirect / modal selon config Clerk + Next.

### 5.4 `shouldJsonAccessLog()`
- **Désactivé :** `BABIL_API_ACCESS_LOG=0`
- **Activé :** `BABIL_API_ACCESS_LOG=1` **ou** (par défaut) `VERCEL=1` et variable non `0`
- **Payload log :** `level`, `msg: api_request`, `service: babil-edge`, `requestId`, `method`, `path`, `ts` — uniquement si pathname commence par `/api`.

### 5.5 `config.matcher`
- **But :** exclure assets statiques (`_next`, extensions image/font/css/js hors `json`, etc.) et inclure **`/(api|trpc)(.*)`**.
- **Note Stitch :** toute nouvelle route “auth required” doit soit entrer dans §5.2, soit rester publique **volontairement**.

---

## 6. UI Design Direction
Aucun pixel — en cas de maquette “session expirée” ou “redirect login”, réutiliser tokens **PAGE 33** / **PAGE 34**.

---

## 7. Interaction Design
Redirect Clerk = transition full-page ou interstitiel selon Clerk ; ne pas surcharger Edge avec animations custom.

---

## 8. Responsive UX
N/A (Edge).

---

## 9. Accessibility
Les pages d’erreur / auth héritées de Clerk doivent respecter **PAGE 33** §9.

---

## 10. Edge Cases & States
- **Route oubliée du matcher :** possible fuite d’accès — revue sécurité à chaque nouvelle API user-scoped.
- **Trpc / API hors log :** vérifier matcher si nouveaux préfixes.

---

## 11. User Journey Connections
Protège les outils produit (même accueil **non forcé** : **`/`** reste public au Edge) et, entre autres, délégation services (**PAGE 20–21**), espace perso (**PAGE 22–24**), modération (**PAGE 25**), admin (**PAGE 26**), design system interne (**PAGE 27**), endpoints user & comments — détail dans `PROTECTED_ROUTE_RULES`.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Ne pas produire d’écran “middleware” — utiliser cette page comme **checklist produit** : “Ces URLs exigent compte” pour annotations sur **PAGE 35** wireframes.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
Fichier repo : `docs/google-stitch/assets/page-39-rampart-stitch-reference.png`

**Architecture livrée (Stitch v1 — Rampart firewall single source of truth + admin status dashboard)** :

- **`lib/auth-protected-routes.ts`** (nouveau, pur — pas d'imports Prisma/React/Next) : single source of truth pour la table §5.2.
  - `PROTECTED_ROUTE_RULES` typé `ProtectedRouteRule[]` avec `pattern` (Clerk parens-glob), `displayPath`, `requirement` (`'auth' | 'auth+rbac'`), `category` (`'app' | 'api'`), `note`.
  - `PROTECTED_ROUTE_PATTERNS` dérivé pour `createRouteMatcher`.
  - `getProtectedRouteDisplayRows()` aggregate les règles `/api/user/*` en une seule ligne d'affichage (mirror du screenshot Stitch) tout en gardant la précision matcher en interne.
  - `REQUEST_ID_RESOLUTION_PIPELINE` documente les 4 étapes (`x-babil-request-id` → `x-request-id` → `x-vercel-id` → `crypto.randomUUID()`) — Stitch §5.1.
- **`proxy.ts`** : `createRouteMatcher([...PROTECTED_ROUTE_PATTERNS])` consomme la liste centrale ; commentaire pointe explicitement vers `lib/auth-protected-routes.ts` (Stitch §10 — toute nouvelle route doit passer par ce module).
- **`lib/auth-protected-routes.test.ts`** : 6 assertions `node:test` (chaque règle a un pattern Clerk valide, pas de duplications, parité `PROTECTED_ROUTE_PATTERNS`/`PROTECTED_ROUTE_RULES`, `/admin`+`/moderation`+`/api/admin` taggés `auth+rbac`, aggregation `/api/user/*` correcte, pipeline request-id complet). Tests verts 227/227 (`npm run test:lib`).
- **`app/(dashboard)/admin/rampart/`** (nouvelle route interne admin-RBAC, `robots: noindex/nofollow`, `dynamic = 'force-dynamic'`) — Stitch §6/§12 disent **pas d'écran middleware utilisateur** ; ici c'est un **tableau de bord ops interne** rendu UNIQUEMENT pour comptes ADMIN (gardée par `getAdminUser()` server-side + redirect si pas admin). Layout Stitch fidèle :
  - Header cream : eyebrow mono `System Status Dashboard`, serif `Rampart: Edge Auth Firewall`, sous-titre, 2 `StatusPill` (Clerk Auth Active si `CLERK_SECRET_KEY` ou clé publishable détectée, Edge Runtime Healthy).
  - Grid `lg:grid-cols-[1.6fr_1fr]` :
    - Gauche : `Protected Route Matcher` (white card, ShieldCheck navy, badge `N active rules`, table Path Prefix / Requirement / Status). Pills navy ou ambre selon `auth` vs `auth+rbac`, check vert `CheckCircle2` en queue.
    - Droite haut : `resolveRequestId` (white card, Network icon, 4 étapes avec carrés mono numérotés, dernière étape carré navy + icône `Dices`).
    - Droite bas : `Environment Flags` (white card, Flag icon, lecture live `BABIL_API_ACCESS_LOG`, `VERCEL`, `NODE_ENV`, `EDGE_REGION` calculé via `VERCEL_REGION || RENDER_REGION || EDGE_REGION || 'iad1'`).
  - Bottom : `Live Access Log Stream` (dark card `#0F141F`, eyebrow rouge pulsant si log activé, mono JSON sample de 2 entrées `/api/user/profile` + `/api/user/data-export`). Si flag désactivé → message mono explicatif rappelant que la corrélation reste possible via `x-babil-request-id`.
  - Footer : compteur live `{PROTECTED_ROUTE_RULES.length} règles actives` + lien `← Citadel Admin Console`.
- **Lien d'accès** depuis `/admin` : nouveau bouton `Rampart · Edge Auth` à côté de `Vue modération` (cohérence avec Citadel Console).

**Pourquoi cette implémentation ne contredit pas Stitch §12** : la doc dit de ne pas produire d'écran de middleware **utilisateur final**. Ici, la route est **gated ADMIN** (RBAC + `redirect('/')` si non-admin) et indexée `noindex/nofollow` — c'est explicitement la **checklist produit** sous forme d'outil ops, conforme à l'intention "Ces URLs exigent compte". Le screenshot Stitch sert de wireframe pour ce tableau de bord interne.
