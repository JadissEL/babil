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
- **Top :** titre page + résumé filtres actifs (chips).
- **Corps :** `FilterBar` sticky (budget, goal, region, risk) + zone résultats.
- **Bas :** pagination ou CTA “Comparer la sélection” si multi-sélection active.

---

## 5. Full Section Breakdown

### 5.1 Filter bar
- **Purpose :** paramétrage moteur scoring.
- **Interactions :** sliders / selects ; debounce sur recherche textuelle si présente.
- **Empty :** aucun pays → empty state pédagogique.

### 5.2 Results grid
- **Purpose :** consommation rapide pays (`CountryCard`).
- **Animations :** layout shift minimisé lors refresh filtres (morph IDs).
- **Loading :** skeleton cards = nombre de colonnes responsive.

### 5.3 Region score strip (si `ExplorerRegionScoreStrip`)
- **Purpose :** vue macro régionale pour orientation géographique.
- **Responsive :** horizontal scroll snap sur mobile.

---

## 6. UI Design Direction
Instrument **cartographique financier** : lignes fines, ticks discrets, couleur risk en gradient contrôlé (jamais arc-en-ciel confus). Cartes pays : photo/illustration secondaire, **chiffre score** primaire.

---

## 7. Interaction Design
Drag slider avec snap points ; hover carte : élévation + affichage 2e ligne insight ; focus clavier visible sur chaque filtre.

---

## 8. Responsive UX
Filtres : drawer plein écran sur mobile avec bouton “Appliquer”. Grille : 1 colonne mobile, 2 tablette, 3 desktop.

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
