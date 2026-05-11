# PAGE 02 — “ATLAS”
## Explorer global — découverte pays par objectifs et filtres

### File Name
`02-atlas-global-explorer.md`

### Page Type
Public (accessible aussi depuis shell dashboard via navigation explorateur)

### Related User Journeys
- Exploration large puis affinage
- Préparation comparaison multi-pays
- Découverte Schengen adjacente (lien nav)

### Connected Pages
- **Précédent :** `/`, objectif préféré cross-pages
- **Suivant :** `/countries/[id]`, `/compare`, `/schengen`

---

## 1. Page Purpose
L’explorer est le **cœur de découverte transactionnelle** : l’utilisateur transforme intention (objectif, budget, région, risque) en **liste pays qualifiée**. Il résout *“Quelles destinations matchent mes contraintes ?”* Objectif business : augmenter profondeur de session et clics vers fiches pays.

---

## 2. Primary User Actions
- **Primaires :** modifier filtres ; ouvrir fiche pays ; réinitialiser filtres.
- **Secondaires :** trier / réordonner si UI le permet ; basculer vue grille.
- **Engagement :** sauvegarder filtres (si implémenté côté client / futur compte).
- **Conversion :** auth pour favoris / historique (patterns futurs alignés reco).

---

## 3. UX Goals
- **Contrôle perçu :** chaque filtre a un feedback immédiat sur le nombre de résultats.
- **Progressive disclosure :** filtres avancés repliables.
- **Confiance :** afficher hint “sources & scores” liant vers provenance pays.

---

## 4. Layout Architecture
**Fichier :** `app/(public)/explorer/page.tsx` — **`Suspense`** (spinner) → **`ExplorerPageInner`** (`useSearchParams`, `useRouter` ; **URL = source de vérité** après navigation).

**Bandeau sticky** (`top-16`, blur) : **`FilterBar`** (objectif + région) + toggle **Liste / Recommandation** (`mode` → `?mode=recommendation`) + lien **`Comparer`** (`compareHrefForExplorerPageState` → **PAGE 03**) + champ **recherche** (sync query `q` / `search`) + selects **difficulté** + **budget** + case **Schengen uniquement** + **Mémoriser / Restaurer / Oublier** la vue (`lib/explorer-saved-filters`, toasts).

**Corps :** `ExplorerRegionScoreStrip` (buckets région) → **`GoogleAd`** `explorer_top` → **`CountryGrid`** → `explorer_bottom`.

---

## 5. Full Section Breakdown

### 5.1 Hydratation query → état
- **Params :** `q`/`search`, `region` (`parseExplorerRegionFilter`), `goal`, `budget`, `difficulty`, `schengen`, `mode`.
- **Goal par défaut :** si absent en URL, `explorerFilterGoalFromObjectiveSlug` + **`ObjectivePreferenceProvider`**.

### 5.2 `commitExplorerUrl` / `router.replace`
- **Purpose :** persister filtres dans l’URL (`scroll: false`) ; `markExplorerOnboardingEngaged` sur engagement.

### 5.3 `FilterBar` (partiel)
- **Branché :** objectif + région uniquement ; budget / difficulté / Schengen = **contrôles séparés** dans le même sticky.

### 5.4 Modes & tri
- **Liste :** tri alphabétique ; **Recommandation :** tri `_finalScore` décroissant (`enrichCountryApiRecord`).

### 5.5 Filtrage client
- **Règles :** nom, `matchesExplorerRegionFilter`, `_difficultyLabel`, goal (visa scores + `short_courses` si objectif `short_course`), `_budgetLevel`, `matchesExplorerSchengenOnlyToggle`.

### 5.6 `CountryGrid`
- **Props :** `gridCountries` (score, friction, study, business, highlights…) ; `onCountryNavigate` onboarding.

### 5.7 Mémoire locale
- **`writeExplorerSavedFilters` / `readExplorerSavedFilters` / `clearExplorerSavedFilters`** ; listener `storage` pour multi-onglets.

### 5.8 Recherche inline
- **Implémentation :** input texte (pas `GlobalCountrySearch` typeahead dans ce fichier) ; Enter / blur → `commitExplorerUrl`.

### 5.9 Empty & résilience
- **0 résultats :** message carte ; **API KO :** liste vide. Réf **PAGE 32** optionnelle hors UI.

---

## 6. UI Design Direction
Instrument **cartographique financier** : lignes fines, ticks discrets, couleur risk en gradient contrôlé (jamais arc-en-ciel confus). Cartes pays : photo/illustration secondaire, **chiffre score** primaire.

---

## 7. Interaction Design
Drag slider avec snap points ; hover carte : élévation + affichage 2e ligne insight ; focus clavier visible sur chaque filtre.

---

## 8. Responsive UX
**Implémentation :** filtres dans le **sticky** (wrap + `border-t` mobile sur le groupe des boutons mémoire) — pas de drawer dédié. **`CountryGrid`** : colonnes gérées par le composant (voir code).

---

## 9. Accessibility
Annoncer nombre de résultats via `aria-live` après application filtres ; sliders avec `aria-valuetext` humain (ex. “budget moyen”).

---

## 10. Edge Cases & States
- **0 résultats :** illustration légère + suggestion assouplir risque.
- **Erreur API :** bannière retry + mode dégradé si fallback statique existe.
- **Offline :** message + cache derniers résultats (futur SW).

---

## 11. User Journey Connections
Depuis home filtres rapides ; sortie vers pays ; compare pré-rempli si sélection multi.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Créer une **console d’exploration** : rail filtres vertical glass sur desktop, chips horizontales sur mobile. Cartes pays avec **barre score intégrée bas de carte** (micro-chart). Ajouter **mini heatmap continent** optionnelle en arrière-plan très fade (2–3% opacité) pour spatialiser sans bruit.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 02]
