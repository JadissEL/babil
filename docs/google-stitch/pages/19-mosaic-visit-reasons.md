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
Mosaïque tuiles raisons → détail sélectionné en panneau latéral / below fold.

---

## 5. Full Section Breakdown
Tuiles : icône + titre + score adéquation (si présent).

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
