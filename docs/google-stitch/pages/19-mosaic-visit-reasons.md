# PAGE 19 — “MOSAIC”
## Raisons de visite — motivations & scénarios (`/countries/[id]/reasons`)

### File Name
`19-mosaic-visit-reasons.md`

### Page Type
Public (template dynamique)

### Related User Journeys
- Tourisme / visites / séjours courts
- Alignement objectifs explorer

### Connected Pages
- **Précédent :** hub pays
- **Suivant :** quotes, probability tourisme

---

## 1. Page Purpose
Exposer **motifs de voyage** structurés (`VisitReasonsSection`) pour relier intention utilisateur à signaux pays. Résout *“Ce pays est-il bon pour MON type de visite ?”*

---

## 2. Primary User Actions
- **Primaires :** parcourir raisons ; marquer intérêt (futur).
- **Secondaires :** basculer vers compare incluant objectif visite.

---

## 3. UX Goals
- **Segmentation mentale** claire (famille, aventure, remote, etc. selon data).

---

## 4. Layout Architecture
**Implémentation (`app/(public)/countries/[id]/reasons/page.tsx`) :** même chargeur que **PAGE 17** (`/api/countries/${id}` + `materializeCountryApiRow`) → `buildCountryExperienceContent` + **`VisitReasonsSection`** ; retour hub.

---

## 5. Full Section Breakdown

### 5.1 `VisitReasonsSection`
- **Purpose :** motifs de visite / scénarios alignés scoring tourisme & intention utilisateur.
- **Structure :** tuiles ou listes selon composant — prévoir hiérarchie mobile (1 colonne).

### 5.2 Données sparse
- **Purpose :** raisons génériques + disclaimer si `full_data` incomplet (éviter sur-promesse).

### 5.3 Parcours sortants
- **Vers PAGE 17 :** preuves humaines ; **vers PAGE 05** : probabilités objectif tourisme si CTA existants côté hub.

### 5.4 Micro-feedback (**PAGE 37**)
- **Purpose :** pouces sur blocs “raisons” une fois le contenu stabilisé — pas sur le header seul.

### 5.5 Cohérence avec **PAGE 16**
- **Purpose :** mêmes tokens, même densité ; sous-page = **chapitre** du hub, pas mini-site isolé.

---

## 6. UI Design Direction
**Mosaic grid** irrégulier contrôlé (bento) pour variété visuelle maîtrisée.

---

## 7. Interaction Design
Click tuile : expansion fluide Masonry-like (perf mindful).

---

## 8. Responsive UX
Bento → stack ordonné par priorité score.

---

## 9. Accessibility
Ordre DOM = ordre lecture logique même si visuel bento.

---

## 10. Edge Cases & States
Données sparse : afficher raisons génériques + disclaimer.

---

## 11. User Journey Connections
Vers tourism scoring ; vers services tourisme (futur).

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Tuiles **verre dépoli** avec léger gradient différent par type de visite. Détail sélectionné comme **carte postale** minimaliste avec mini-carte pays.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 19]
