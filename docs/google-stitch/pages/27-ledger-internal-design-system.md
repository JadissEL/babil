# PAGE 27 — “LEDGER”
## Design system interne — `/design-system`

### File Name
`27-ledger-internal-design-system.md`

### Page Type
Logged-In (interne produit / équipe)

### Related User Journeys
- QA visuelle
- Onboarding dev / design

### Connected Pages
- **Précédent :** `/overview`
- **Suivant :** toutes pages référencées pour test composants

---

## 1. Page Purpose
Servir de **sandbox vivant** des composants shadcn-like & custom (`button`, `card`, `badge`, etc.). Résout *“Est-ce que ce composant respecte le DS ?”*

---

## 2. Primary User Actions
- **Primaires :** inspecter variants ; copier tokens / class names (futur).
- **Secondaires :** tester dark/light (si Theme toggle présent `ThemeCursorToggle` patterns).

---

## 3. UX Goals
- **Cohérence** stricte ; éviter divergence “storybook zombie”.

---

## 4. Layout Architecture
Navigation interne par catégories → canvas démo → specs textuelles.

---

## 5. Full Section Breakdown

### 5.1 Navigation interne DS
- **Purpose :** liste latérale ou tabs : **Actions**, **Formulaires**, **Données**, **Navigation**, **Feedback**, **Surfaces pays** (regroupement logique aligné imports `components/ui` + patterns métier).
- **Interaction :** scroll spy sur desktop pour sauter aux ancres.

### 5.2 Boutons (`button.tsx`)
- **Variants :** default, outline, ghost, destructive ; tailles `sm` / default / `lg`.
- **États :** default, `disabled`, `aria-busy` + spinner, focus ring tokenisé.
- **Stitch :** montrer les 4 variants sur une même ligne avec labels.

### 5.3 Cartes & surfaces (`card`, `badge`, `progress`)
- **Purpose :** `Card` + `CardHeader` / `CardContent` ; `Badge` sémantique (succès, warning) ; `Progress` avec valeur textuelle à côté.
- **Edge :** progress indéterminée = animation subtile + `aria-valuetext="en cours"`.

### 5.4 Champs formulaire (`input`, `label`, `select`)
- **Purpose :** états erreur avec message sous champ ; `select` avec placeholder ; hauteur 44–48px.
- **A11y :** `htmlFor` / `id` ; `aria-invalid`.

### 5.5 Filtres explorer (extraits)
- **Purpose :** mini-section renvoyant à **PAGE 02** mais montrant **FilterBar** isolé pour QA visuelle.

### 5.6 Skeletons & loading
- **Purpose :** `Skeleton` lignes et cartes ; démonstration alignement avec **PAGE 22** skeleton dashboard.

### 5.7 `ThemeCursorToggle` (si présent)
- **Purpose :** capture comportement curseur / thème ; documenter **non** casser contraste WCAG en mode alternatif.

### 5.8 Checklist QA par release
- **Purpose :** section markdown “À valider avant ship” : focus visible, tailles touch, pas de texte <12px sauf kicksers.

---

## 6. UI Design Direction
Fond grille technique 8px ; cartouches composants isolées.

---

## 7. Interaction Design
Toggle theme instantané.

---

## 8. Responsive UX
Deux colonnes desktop ; stack mobile.

---

## 9. Accessibility
Chaque démo inclut notes a11y attendues.

---

## 10. Edge Cases & States
Composant cassé build : badge erreur.

---

## 11. User Journey Connections
Retour overview ; alignement avec PR UI.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Page **atelier de laboratoire** : fond blanc cassé avec grille ; chaque composant encadré **étiquette technique** (`<Button>`) style specimen typographique.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
Fichier repo : `docs/google-stitch/assets/page-27-ledger-stitch-reference.png`

**Architecture livrée (Stitch v1 — Ledger typography specimen + atelier laboratoire)** : page client `/design-system` réécrite en **2 colonnes** `lg:grid-cols-[240px_1fr]` sur shell cream `#FAF7EE`.

- **Rail gauche** (sticky, white) : header serif `VisaFlow` + mono `LEDGER SYSTEM`, puis 3 groupes typographiquement séparés par eyebrows mono `PRIMITIVES` / `LAYOUT` / `PATTERNS`. Chaque entrée = icône lucide + label ; l'entrée active prend pill gris pâle `bg-[#0D1B3E]/06` + texte navy + indicateur scroll-spy. Footer rail : mono `v2.4.1 — Stable`.
- **Top bar canvas** : breadcrumb mono `Citadel › Ledger` (lien `/admin`) à gauche, bouton outline `Theme` (moon icon) à droite — wired sur le composant `ThemeCursorToggle` existant côté layout (la page se contente d'un placeholder visuel ; toggle réel via header global).
- **Canvas** : fond gridé technique 8px (`background-image` lignes 1px `#0D1B3E/06`) + 6 sections ancrées :
  - `Actions` → `<BUTTON>` specimen : sous-blocs `Primary` (Small / Default / Large / Processing avec spinner), `Outline & Ghost`, `Destructive` (Delete Record rouge filled, Archive rouge outlined).
  - `Forms` → `<INPUT>` + `<SELECT>` specimens avec états (`default`, `aria-invalid`, `disabled`).
  - `Surfaces` → `<CARD>` + `<BADGE>` + `<PROGRESS>` (4 valeurs, avec valeur textuelle à côté).
  - `Navigation` → `<FILTERBAR>` specimen (FilterBar live rendering avec goal/region state).
  - `Feedback` → `<BLOCKFEEDBACK>` specimen (instance localStorage démo).
  - `Country Surfaces` → `<COUNTRYCARD>` + `<OFFICIALSOURCESCARD>` + `<EXPLORERREGIONSCORESTRIP>`.
- Chaque specimen card : **étiquette technique** chip gris `<TAG>` en mono uppercase tracking-`0.22em`, fond blanc, border `#0D1B3E/10`, titre section serif navy + courte description italique.
- **Scroll-spy** simple basé sur `IntersectionObserver` pour highlighter l'entrée du rail correspondante.

Comportement préservé : tous les composants instanciés sont des **vraies instances produit** (`Button`, `Badge`, `Card`, `Progress`, `Input`, `Select`, `FilterBar`, `CountryCard`, `OfficialSourcesCard`, `ExplorerRegionScoreStrip`, `BlockFeedback`) — la page reste un sandbox vivant non-stockée hors prod (`/design-system` route logged-in).
