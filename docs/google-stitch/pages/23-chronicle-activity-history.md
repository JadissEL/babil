# PAGE 23 — “CHRONICLE”
## Historique d’activité — `/history`

### File Name
`23-chronicle-activity-history.md`

### Page Type
Logged-In

### Related User Journeys
- Rétention / reprise de contexte
- Audit personnel des actions

### Connected Pages
- **Précédent :** `/overview`
- **Suivant :** pages liées (pays, engines) via items

---

## 1. Page Purpose
Matérialiser la **mémoire produit** (vues pays, runs moteur, commentaires — selon API `history`). Résout *“Qu’est-ce que j’ai déjà fait ?”*

---

## 2. Primary User Actions
- **Primaires :** filtrer / paginer ; rouvrir item.
- **Secondaires :** supprimer entrée (si produit l’autorise).

---

## 3. UX Goals
- **Lisibilité narrative** (libellés humains via `history-event-labels` patterns).

---

## 4. Layout Architecture
Header + filtres → timeline verticale → pagination.

---

## 5. Full Section Breakdown
Chaque item : icône type, titre, timestamp relatif, lien action.

---

## 6. UI Design Direction
Timeline **fil continu** vertical avec nodes `primary`.

---

## 7. Interaction Design
Hover item : slide léger révélant CTA “Rouvrir”.

---

## 8. Responsive UX
Timeline : nodes alignés gauche ; texte droite full width.

---

## 9. Accessibility
Timeline `ol` ordonné si séquentiel ; dates ISO `time`.

---

## 10. Edge Cases & States
Historique vide : illustration + CTA explorer ; erreur API : retry.

---

## 11. User Journey Connections
Réactivation vers pays / engines.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Items comme **fiches archives** avec micro texture papier. Icônes événement monoline 20px dans cercle `surface` inset.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 23]
