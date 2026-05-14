# PAGE 40 — “FLARE”
## Toasts globaux — `AppToaster` + `lib/toast-store` (`appToast`)

### File Name
`40-flare-global-app-toaster.md`

### Page Type
System / Transversal (une pile de notifications pour **toutes** les routes sous `RootLayout`)

### Related User Journeys
- Confirmation action courte (favoris, filtre enregistré, profil sauvé)
- Erreur réseau ou payload sans quitter la page

### Connected Pages
- **Montage :** **`SiteChrome`** (**PAGE 34**) — `<AppToaster />` juste après `SiteHeader` (même instance pour public **et** routes `(dashboard)` car `app/layout.tsx` enveloppe tout le site).
- **Dock :** offset vertical basé sur **`VF_OBJECTIVE_DOCK_HEIGHT_VAR`** — mesure dynamique **PAGE 41** (`SiteObjectiveDock`).
- **Consommateurs typiques :** **PAGE 02** (explorer filtres), **PAGE 03** (compare copie/partage), **PAGE 05–06** (erreurs chargement), **PAGE 16** (favoris + commentaire), **PAGE 21** (erreurs formulaire), **PAGE 24** (profil + export)

---

## 1. Page Purpose
Unifier la **forme**, la **position** et le **cycle de vie** des notifications non bloquantes : éviter que Stitch dessine des snackbars différentes par écran alors que le produit utilise **un seul** renderer client + store module.

---

## 2. Primary User Actions
- **Lire** le message (1 ligne, `text-sm font-bold`).
- **Fermer** avec le bouton ✕ (`aria-label="Fermer la notification"`).
- **Attendre** la disparition auto (~**4,8 s** par défaut après push).

---

## 3. UX Goals
- **Non bloquant** : `pointer-events-none` sur le conteneur fixe, `pointer-events-auto` sur chaque carte.
- **Au-dessus du contenu** : `z-[100]` — coordonner avec modales Clerk (**PAGE 33**) pour que les overlays auth restent au-dessus si z-index maison diverge.
- **Au-dessus du dock objectif** : `bottom` calculé avec `var(--vf-objective-dock-height, 5.5rem) + 0.35rem` pour ne pas masquer les toasts derrière **`SiteObjectiveDock`**.
- **Safe area** : `env(safe-area-inset-*)` sur marges bas / gauche.

---

## 4. Layout Architecture
**Renderer :** `components/AppToaster.tsx` — `useSyncExternalStore(subscribeToasts, getToastSnapshot, getServerToastSnapshot)` ; snapshot serveur **toujours vide** (`[]`) pour hydratation stable.

**Position :** `fixed right-0` (desktop `sm:right-4`), pile **`flex-col-reverse`** + `gap-2`, `max-h` ~ moitié viewport avec scroll interne si beaucoup de toasts.

**Store :** `lib/toast-store.ts` — tableau module `toasts`, `pushToast(variant, message, durationMs?)`, `dismissToast(id)`, API **`appToast.success|error|info(message)`**. `pushToast` no-op côté serveur (`typeof window === 'undefined'`).

---

## 5. Full Section Breakdown

### 5.1 Variants visuels
| Variant | Icône | Rôle |
|--------|--------|------|
| `success` | `CheckCircle2` | confirmation |
| `error` | `XCircle` | échec / refus |
| `info` | `Info` | neutre / rappel |

Cartes : `rounded-2xl`, `border`, `backdrop-blur-sm`, `shadow-card` — couleurs distinctes par variant (voir classes dans le composant).

### 5.2 Accessibilité
- Conteneur : **`aria-live="polite"`**, **`aria-relevant="additions"`** (annonces lecteur d’écran à l’ajout).
- Icônes décoratives : `aria-hidden` sur les Lucide.

### 5.3 Durée & concurrence
- Défaut **4800 ms** puis `dismissToast` ; plusieurs toasts = pile simultanée (pas de file FIFO global au-delà du filtre visuel max-height).

### 5.4 Règles produit pour nouveaux écrans
- Préférer **`appToast`** pour erreurs réseau plutôt que `alert()` (**PAGE 25** note opportunité).
- **PAGE 37** (`BlockFeedback`) : rester **silencieux** sauf décision produit contraire — ne pas saturer la pile.

---

## 6. UI Design Direction
Ton **court et affirmatif** (une phrase) ; pas de titre secondaire dans la carte ; fermeture discrète mais zone tactile ≥ 44px si possible sur mobile.

---

## 7. Interaction Design
Apparition : rendu synchrone au prochain paint après `emit()` ; pas d’animation d’entrée codée aujourd’hui — Stitch peut proposer slide-in léger **sans** changer le store.

---

## 8. Responsive UX
- Mobile : `w-full` avec `px-4` ; `sm:max-w-md` sur large écrans.
- `max-h` + `overflow-y-auto` si rafales de messages (rare).

---

## 9. Accessibility
Polite live region évite de couper une lecture en cours ; bouton fermer toujours focusable.

---

## 10. Edge Cases & States
- **SSR / RSC :** aucun toast serveur — pas de flash liste non vide à l’hydratation.
- **Message long :** `min-w-0` + `leading-snug` ; éviter paroles > 2 lignes en copy produit.

---

## 11. User Journey Connections
Renforce confiance perçue sur actions **PAGE 16** (cœur, commentaire) et persistance **PAGE 02** / **PAGE 24** sans modale.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Planche **“FLARE — 3 états”** : success / error / info côte à côte sur fond `bg-bg` avec **dock factice** en bas pour valider le **clearance** vertical.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
Fichier repo : `docs/google-stitch/assets/page-40-flare-stitch-reference.png`

**Architecture livrée (Stitch v1 — Flare toaster hardening + specimen plate)** :

- **`tailwind.config.js`** : ajout keyframe `flare-in` (220 ms `cubic-bezier(0.16, 1, 0.3, 1)` slide-up + scale légère) et utility `animate-flare-in` (Stitch §7 — slide-in léger sans toucher au store).
- **`components/AppToaster.tsx`** hardening conservatif :
  - `animate-flare-in` appliqué à chaque carte → entrée fluide à l'apparition.
  - `data-variant={t.variant}` pour cibler QA / Playwright / Cypress facilement.
  - `role="alert"` ajouté **uniquement** sur la variante `error` (annonces immédiates pour lecteurs d'écran ; success/info gardent la zone `aria-live="polite"` parente sans doublon ARIA).
  - Bouton fermer : passe de `p-1` à `inline-flex h-9 w-9` avec offset négatif `-mr-1 -mt-1` → tap target conforme cible mobile ≥ 36 px (Stitch §6 / §9). Comportement & tokens visuels préservés à l'identique.
  - Tous les autres comportements (variants `success`/`error`/`info`, icônes Lucide, `pointer-events-none`/`auto`, dock offset `VF_OBJECTIVE_DOCK_HEIGHT_VAR`, safe area, `useSyncExternalStore` avec snapshot serveur stable) intacts.
- **`app/(dashboard)/admin/flare/`** (nouvelle route specimen) :
  - Layout server-side admin-RBAC gated (`getAdminUser()` + `redirect('/')`), `robots: noindex/nofollow`. Stitch §12 dit « planche FLARE » → on construit un outil interne, pas une route publique.
  - Page client cream `#FAF7EE` avec header serif `FLARE – 3 états`, décor minimal (Bell + CircleUser droite, pas de sidebar pour fidélité Stitch §12).
  - Grille `sm:grid-cols-3` : 3 specimens statiques côte à côte (success / error / info) utilisant **exactement les mêmes classes** que `AppToaster` pour parité visuelle, chacun avec bouton ✕ fonctionnel local (dismiss du specimen).
  - 4 boutons de déclenchement live (`Trigger live success / error / info` + `Reset specimens`) qui appellent l'API réelle `appToast.success | error | info` → permet de vérifier le **flux complet** (store + AppToaster monté dans `SiteChrome` parent) sur le même écran.
  - `FakeDock` décoratif fixé en bas avec 4 icônes (Insights / Flow / Objectives / Profile) — reproduit la position du `SiteObjectiveDock` (PAGE 41) pour **valider le clearance vertical** Stitch §3 / §12.
  - Note pédagogique en bas avec références fichiers (`components/AppToaster.tsx`, `lib/toast-store.ts`, API `appToast`).
- **`app/(dashboard)/admin/page.tsx`** : nouveau bouton `Flare · Toasts` ajouté à côté de `Rampart · Edge Auth` dans le header Citadel pour découvrabilité ops.

**Contrat verrouillé** : aucune autre surface (page, modale, formulaire) ne doit re-dessiner ses propres snackbars — tout passe par `appToast.*`. La planche FLARE est l'unique source visuelle de référence pour valider variant, ton et clearance.
