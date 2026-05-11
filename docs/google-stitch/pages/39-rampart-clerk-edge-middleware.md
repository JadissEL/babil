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
À maintenir **strictement alignés** sur `createRouteMatcher([...])` dans le repo :

- `/services/delegated-applications(.*)`
- `/overview(.*)`
- `/history(.*)`
- `/profile(.*)`
- `/design-system(.*)`
- `/moderation(.*)`
- `/admin(.*)`
- `/api/admin(.*)`
- `/api/comments(.*)`
- `/api/user/profile(.*)`
- `/api/user/favorites(.*)`
- `/api/user/history(.*)`
- `/api/user/data-export(.*)`
- `/api/delegated-application-requests(.*)`

**Publics (non listés ici) :** notamment `/probability`, `/recommendations`, `/recommendation-engine` — voir commentaire dans le fichier source.

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
Protège délégation services (**PAGE 20–21**), espace perso (**PAGE 22–24**), modération (**PAGE 25**), admin (**PAGE 26**), design system interne (**PAGE 27**), endpoints user & comments listés en §5.2.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Ne pas produire d’écran “middleware” — utiliser cette page comme **checklist produit** : “Ces URLs exigent compte” pour annotations sur **PAGE 35** wireframes.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 39]
