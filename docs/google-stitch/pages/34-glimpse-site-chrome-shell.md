# PAGE 34 — “GLIMPSE”
## Chrome global du site — `RootLayout` + `SiteChrome` (non-route)

### File Name
`34-glimpse-site-chrome-shell.md`

### Page Type
System / Transversal (enveloppe toutes les routes)

### Related User Journeys
- Première impression cohérence marque sur **chaque** page
- Objectif de mobilité persistant (`AppObjectiveRoot`)

### Connected Pages
- **Enveloppe :** toutes les PAGE 01–33
- **Technique :** `app/layout.tsx` → `ClerkProvider` → `SiteChrome` → children

---

## 1. Page Purpose
Documenter ce que l’utilisateur perçoit **autour** du contenu page : police Inter, fond `bg-bg`, structure colonne `min-h-screen`, intégration **toasts** (`AppToaster`), **sync Sentry/Clerk**, et tout **dock / footer** issu de `SiteChrome`. Sans ce brief, Stitch produit des pages isolées incohérentes.

---

## 2. Primary User Actions
- **Primaires :** navigation via zones globales (navbar selon contexte public vs perso — géré par `SiteChrome`).
- **Secondaires :** changement objectif global (provider) impactant liens Explorer/Compare.

---

## 3. UX Goals
- **Une seule identité** VisaFlow sur marketing et produit.
- **Hauteur viewport remplie** sans double scroll parasite.
- **Toasts** lisibles mais non intrusifs (coin cohérent, z-index au-dessus du contenu mais sous modales).

---

## 4. Layout Architecture
- **Couche 0 :** `html lang="fr"` + `body` flex column.
- **Couche 1 :** `AppObjectiveRoot` (état objectif).
- **Couche 2 :** `SiteChrome` — injecte header/footer / dock selon implémentation actuelle.
- **Couche 3 :** contenu route (`children`).

---

## 5. Full Section Breakdown

### 5.1 Fond & typographie globaux
- **Purpose :** `Inter` + `antialiased` + tokens `text-text` / `bg-bg`.
- **Stitch :** ne jamais proposer une autre police display sur une seule page marketing sans valider impact global.

### 5.2 SiteChrome — header / dock
- **Purpose :** zone sticky ou dock inférieur (si `SiteChrome` inclut bottom chrome) pour actions persistantes.
- **Responsive :** safe-area iOS sur dock ; padding bottom pages (`pb-12` patterns) pour éviter masquage contenu.

### 5.3 Toasts & feedback global
- **Purpose :** confirmations API, erreurs réseau, copie lien.
- **A11y :** `aria-live` politeness appropriate ; durée lecture suffisante.

### 5.4 Clerk provider wrap
- **Purpose :** session disponible pour composants client ; pas d’UI directe ici sauf `SignedIn`/`SignedOut` descendants.
- **Edge :** Clerk indisponible → message global minimal (coordination avec PAGE 31 si crash total).

### 5.5 Sentry / observabilité
- **Purpose :** pas d’UI ; mais pas d’élément Stitch qui casse `SentryClerkSync` (hydration).

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
