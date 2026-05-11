# PAGE 34 — “GLIMPSE”
## Chrome global du site — `RootLayout` + `SiteChrome` (non-route)

### File Name
`34-glimpse-site-chrome-shell.md`

### Page Type
System / Transversal (enveloppe toutes les routes)

### Related User Journeys
- Première impression cohérence marque sur **chaque** page
- Objectif de mobilité persistant (`AppObjectiveRoot` — **PAGE 41**)

### Connected Pages
- **Enveloppe :** toutes les PAGE 01–35 ; **PAGE 36** (footer légal futur) ; **PAGE 37** (fragments `BlockFeedback` dans `main`) ; **PAGE 38** (SEO segment pays, sous le layout racine) ; **PAGE 40** (toasts `AppToaster`) ; **PAGE 41** (objectif global + dock + wizard) ; **PAGE 42** (`SentryClerkSync` — pas d’UI) ; **PAGE 43** (header + footer marketing) ; **PAGE 44** (nav primaire rail + drawer) ; **PAGE 45** (recherche pays dans le header).
- **Technique :** `app/layout.tsx` → `ClerkProvider` → `SiteChrome` → children

---

## 1. Page Purpose
Documenter ce que l’utilisateur perçoit **autour** du contenu page : police Inter, fond `bg-bg`, structure colonne `min-h-screen`, intégration **toasts** (`AppToaster` — détail **PAGE 40**), **sync Sentry/Clerk** (**PAGE 42** — sans UI), et tout **dock / footer** issu de `SiteChrome`. Sans ce brief, Stitch produit des pages isolées incohérentes.

---

## 2. Primary User Actions
- **Primaires :** navigation via zones globales (navbar selon contexte public vs perso — géré par `SiteChrome`).
- **Secondaires :** changement objectif global (provider) impactant liens Explorer/Compare.

---

## 3. UX Goals
- **Une seule identité** VisaFlow sur marketing et produit.
- **Hauteur viewport remplie** sans double scroll parasite.
- **Toasts** lisibles mais non intrusifs — règles pile / dock / z-index : **PAGE 40**.

---

## 4. Layout Architecture
- **Couche 0 :** `html lang="fr"` + `body` flex column.
- **Couche 1 :** `AppObjectiveRoot` (état objectif — détail **PAGE 41**).
- **Couche 2 :** `SiteChrome` — injecte header/footer / dock selon implémentation actuelle.
- **Couche 3 :** contenu route (`children`).

---

## 5. Full Section Breakdown

### 5.1 Fond & typographie globaux
- **Purpose :** `Inter` + `antialiased` + tokens `text-text` / `bg-bg`.
- **Stitch :** ne jamais proposer une autre police display sur une seule page marketing sans valider impact global.

### 5.2 `SiteHeader` (public)
- **Spec détaillée :** **PAGE 43** — marque, `GlobalCountrySearch`, auth Clerk, `SiteHeaderMenuButton` → **§5.3**.

### 5.3 `SitePrimaryNavColumn`
- **Spec détaillée :** **PAGE 44** — liste liens, objectif-aware Explorer/Comparer, drawer, `useSitePrimaryNavState`.
- **Note :** cohabite avec `main` en flex `min-w-0 flex-1` pour éviter overflow horizontal.

### 5.4 Zone `main` (slot contenu public)
- **Purpose :** padding `px-4 py-5 sm:px-6 lg:px-8 lg:py-6` et **padding bas dynamique** `pb-[calc(var(--vf-objective-dock-height,5.5rem)+1rem)]` pour ne pas masquer le contenu derrière le **dock objectif**.
- **Stitch :** toujours laisser cette marge basse visible dans les captures “full page”.

### 5.5 `SiteObjectiveDock`
- **Spec détaillée :** **PAGE 41** (`SiteObjectiveDock`, `DockObjectivePicker`, wizard, variable `--vf-objective-dock-height`, z-index).
- **Rappel :** dock fixe bas — affecte deep links Explorer/Compare ; padding `main` §5.4.

### 5.6 `SiteFooter`
- **Spec détaillée :** **PAGE 43** — copyright, PayPal don, padding dock ; futurs liens **PAGE 36**.

### 5.7 Toasts & feedback global
- **Spec détaillée :** **PAGE 40** (`AppToaster`, variants, durée, `aria-live`).

### 5.8 Clerk provider wrap
- **Purpose :** session disponible pour composants client ; pas d’UI directe ici sauf `SignedIn`/`SignedOut` descendants.
- **Edge :** Clerk indisponible → message global minimal (coordination avec PAGE 31 si crash total).

### 5.9 Sentry / observabilité
- **Purpose :** pas d’UI ; **`SentryClerkSync`** aligne contexte Sentry avec Clerk (pseudonyme) — **PAGE 42**.
- **Stitch :** aucun pixel ; éviter overlays qui supposent un ordre de mount fragile avant Clerk.

---

## 6. UI Design Direction
Continuité **papier chaud** globale ; aucun saut brutal de background entre routes sœurs.

---

## 7. Interaction Design
Transitions de page Next subtiles ; pas de layout shift au load toasts.

---

## 8. Responsive UX
Mobile : vérifier que `SiteChrome` ne double pas la hauteur avec `min-h-screen` + dock.

---

## 9. Accessibility
Skip link “Aller au contenu” si non présent — **à ajouter** si audit l’exige ; `lang="fr"` obligatoire.

---

## 10. Edge Cases & States
Viewport très petit : dock collapse ; toast stack vertical max 3 visible.

---

## 11. User Journey Connections
Cadre toutes les entrées/sorties utilisateur ; doit rester stable lors des navigations client Next.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Pour **chaque mockup de page**, inclure **les 16px de marge du chrome global** et le **fond `bg-bg`** — ne pas isoler la carte centrale sur fond gris aléatoire. Si dock existe, montrer **ombre portée légère** séparant dock et contenu.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 34]
