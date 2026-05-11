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

### 5.1 Header “Pro” & contexte
- **Purpose :** titre page + badge **Pro** + rappel objectif actif (lien modifier → profile ou preset).
- **Toolbar :** boutons “Réinitialiser pondérations”, “Exporter” (futur), “Comparer le top 3” (deep link **PAGE 03** avec pays pré-remplis si dispo).

### 5.2 Panneau pondérations (`recommendation-radar-axes` + sliders)
- **Purpose :** chaque axe (mobilité travail, coût, risque, etc.) a un **slider 0–100** ou normalisé avec somme contrainte selon logique produit.
- **Interactions :** debounce 300–500ms sur recalcul lourd ; indicateur “calcul…” non bloquant.
- **Edge :** si somme ≠ 100% selon règle moteur : message + bouton “Normaliser”.

### 5.3 Radar bi-couche
- **Purpose :** couche A = profil utilisateur idéal (lecture seule ou éditable selon produit) ; couche B = pays sélectionné ou moyenne top-1.
- **A11y :** paragraphe équivalent listant scores numériques + ordre des axes.

### 5.4 Breakdown chart (`ScoreBreakdownChart` patterns)
- **Purpose :** barres empilées ou grouped par pays pour top-N ; légende interactive (toggle série).
- **Loading :** skeleton barres avec mêmes proportions approximatives.

### 5.5 `RecommendationPanel` — liste classée
- **Purpose :** rang, drapeau, nom pays, **score composite**, chip confiance (haute / moyenne / données partielles).
- **Interactions :** clic ligne → **PAGE 16** ; shift-clic futur pour ajout compare.
- **Empty :** ajuster filtres / pondérations.

### 5.6 Panneau “Pourquoi ce classement” (logs stylisés)
- **Purpose :** 3 facteurs max en langage naturel (“Fort sur coût du logement”, “Faible sur friction visa travail”) — pas de stack trace.
- **Source :** mapping depuis breakdown réel côté API.

### 5.7 Slot premium / upgrade (placeholder produit)
- **Purpose :** carte discrète “Rapport approfondi” ou “Historique illimité” sans bloquer l’outil gratuit.
- **Conversion :** CTA secondaire outline.

### 5.8 Erreurs & timeouts
- **Purpose :** bannière partielle si un pays échoue au fetch ; liste des pays concernés + retry unitaire.

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
