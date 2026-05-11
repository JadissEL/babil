# PAGE 04 — “SHIELD”
## Vue Schengen — espace mobilité zone Schengen

### File Name
`04-shield-schengen-atlas.md`

### Page Type
Public

### Related User Journeys
- Préparation voyage court séjour
- Compréhension membres / règles dedupe (données techniques)
- Navigation depuis explorer

### Connected Pages
- **Précédent :** `/explorer`, navbar
- **Suivant :** pays Schengen individuels `/countries/[id]`, `/compare`

---

## 1. Page Purpose
Centraliser la **lecture zone Schengen** : membres, signaux, éventuelles ambiguïtés de données (clefs lookup). Répond à *“Comment la zone s’articule pour mon besoin ?”* Business : SEO thématique forte + rétention utilisateurs Europe.

---

## 2. Primary User Actions
- **Primaires :** parcourir liste / cartes membres ; accéder fiche pays.
- **Secondaires :** filtrer (si présent) ; lire encadrés légaux disclaimers.
- **Conversion :** vers probabilité / reco pour “chances visa court séjour”.

---

## 3. UX Goals
- **Clarté géopolitique** sans ton juridique effrayant.
- **Confiance** via distinction claire “information indicative”.

---

## 4. Layout Architecture
Hero Schengen → bloc explicatif → grille / table membres → bloc sources / mise à jour.

---

## 5. Full Section Breakdown
### 5.1 Hero
Kicker + titre fort + sous-texte pédagogique.

### 5.2 Members grid
Carte uniforme : drapeau + nom + statut (membre / associé si applicable).

### 5.3 Data integrity note (si dédup)
Encart `muted` expliquant harmonisation clés — évite méfiance utilisateur.

### 5.4 Footer links
Vers compare Schengen subset (futur) ou explorer filtré.

---

## 6. UI Design Direction
Palette légèrement plus **froide / slate** pour différencier zone EU sans rompre DS global — accents bleus désaturés + même `primary` pour CTA.

---

## 7. Interaction Design
Hover carte : border `primary` ; click : navigation instantanée.

---

## 8. Responsive UX
Table desktop → cartes mobile ; recherche inline pour 30+ entrées.

---

## 9. Accessibility
Liste navigable clavier ; drapeaux avec `alt` pays.

---

## 10. Edge Cases & States
Données incomplètes pour un membre : badge “en cours d’enrichissement”.

---

## 11. User Journey Connections
Boucle avec compare multi Schengen ; renvoi home.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Carte stylisée **Europe outline** ultra-light en filigrane. Grille **badges pays** style passeport holographique subtil (micro irisation). Section “Sources officielles” comme **pliage de document officiel** (bordure perforée illustrative).

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 04]
