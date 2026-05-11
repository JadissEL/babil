# PAGE 07 — “PULSE”
## Moteur de recommandation (pro) — scoring avancé et breakdown

### File Name
`07-pulse-pro-recommendation-engine.md`

### Page Type
Public (positionné “pro” — densité plus élevée)

### Related User Journeys
- Power users / consultants internes
- Passage reco pro → reco sauvegardées

### Connected Pages
- **Précédent :** `/overview`, `/probability`
- **Suivant :** `/recommendations`, `/compare`

---

## 1. Page Purpose
Offrir une **couche pro** : axes radar, pondérations, signaux détaillés (`RecommendationEnginePage` pattern). Résout *“Pourquoi ce ranking ?”* Business : différenciation premium future.

---

## 2. Primary User Actions
- **Primaires :** ajuster pondérations ; relancer moteur ; inspecter breakdown.
- **Secondaires :** exporter capture (futur).
- **Conversion :** upgrade / compte (placeholder stratégique).

---

## 3. UX Goals
- **Transparence** maximale sur le scoring.
- **Zéro bullshit** : chaque axe relié à données réelles.

---

## 4. Layout Architecture
Header pro + toolbar → panneau contrôle pondérations → résultats split chart/table.

---

## 5. Full Section Breakdown
### 5.1 Radar axes
`recommendation-radar-axes` — labels concis.

### 5.2 Breakdown chart
Barres empilées / stacked explanation.

### 5.3 Recommendation panel
Liste triée avec confiance.

---

## 6. UI Design Direction
Look **terminal analytics** doux : grille de fond 4% opacité ; monospace léger pour valeurs.

---

## 7. Interaction Design
Drag pondération avec snap ; preview instantanée si perf OK sinon debounce.

---

## 8. Responsive UX
Pondérations : bottom sheet ; charts scroll horizontal.

---

## 9. Accessibility
Table breakdown navigable ; radar décrit textuellement.

---

## 10. Edge Cases & States
Pondération invalide : reset ; timeout : partial results banner.

---

## 11. User Journey Connections
Vers compare et pays ; retour overview.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Introduire **badge “Pro”** métallique discret. Radar **double couche** (profil utilisateur vs destination). Panel latéral **logs de décision** stylisés (non dev) listant top 3 facteurs en langage naturel.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 07]
