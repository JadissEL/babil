# PAGE 03 — “PRISM”
## Comparer les pays — table d’analyse multi-signaux

### File Name
`03-prism-country-compare.md`

### Page Type
Public

### Related User Journeys
- Arbitrage rationnel 2–4 destinations
- Préparation rendez-vous conseil / délégation service

### Connected Pages
- **Précédent :** `/explorer`, deep links depuis marketing
- **Suivant :** `/countries/[id]`, `/services/delegated-applications`

---

## 1. Page Purpose
La comparaison transforme la **complexité multidimensionnelle** en **tableau lisible** avec sticky context (objectif). Elle résout *“Que choisir objectivement ?”* sans masquer les nuances. Business : pousser vers pays final ou service humain quand la décision reste difficile.

---

## 2. Primary User Actions
- **Primaires :** ajouter / retirer pays ; changer objectif de comparaison ; lire lignes critères.
- **Secondaires :** expand cellules détail ; ouvrir sources officielles.
- **Conversion :** CTA “Obtenir de l’aide” / déléguer (contextuel).

---

## 3. UX Goals
- **Clarté comparative :** alignement vertical strict des métriques.
- **Réduction charge cognitive :** regroupement lignes par familles (visa, coût, risque, qualité de vie).
- **Confiance :** tooltips avec définition + lien provenance.

---

## 4. Layout Architecture
- **Header :** pickers pays (`CountryComparePicker`) + objectif.
- **Sticky bar :** résumé décision + CTA (`CompareStickyBar` mental model).
- **Corps :** table responsive (`CompareTable`) avec zebra subtile.
- **Footer actions :** export futur / partage lien (placeholder).

---

## 5. Full Section Breakdown

### 5.1 Country pickers
- Multi-select search global ; drapeaux + noms localisés.
- **Empty :** invite à choisir 2e pays.

### 5.2 Compare table
- Colonnes pays ; lignes signaux ; icônes différenciation (↑↓ neutre).
- **Loading :** skeleton colonnes dynamiques.
- **Groupes de lignes :** en-têtes intercalaires (Visa & séjour, Coût & vie, Risque & sûreté, Business / études selon objectif) pour scanner vertical sans perdre le fil.
- **Cellules partielles :** état “—” + tooltip “donnée en cours d’enrichissement” pour éviter faux sentiment de parité.

### 5.3 Objective context banner
- **Purpose :** rappeler l’objectif de comparaison actif (tourisme, études, etc.) aligné sur `compare-objectives` / deep links.
- **Interaction :** lien “Changer d’objectif” renvoie vers explorer ou ouvre sélecteur inline sans casser la sélection pays.

### 5.4 Pickers + table coherence
- **Purpose :** si un pays est retiré, la colonne disparaît avec transition width (éviter flash) ; réordonner colonnes optionnel (drag header futur).
- **Keyboard :** navigation Tab sort du picker vers la table dans l’ordre logique.

### 5.5 Partage & persistance
- **Purpose :** URL reflétant pays + objectif (deep links) ; bouton “Copier le lien de comparaison” (futur) avec toast succès.
- **Edge :** pays invalide dans query → message + reset pickers.

### 5.6 Sticky decision strip
- Résumé textuel “meilleur pour X si…” neutre.
- **Edge :** égalité → expliquer tie-break transparent.
- **CTA secondaire :** service délégué si indécision prolongée (micro-copy rassurante).

---

## 6. UI Design Direction
Esthétique **bloomberg-travel** : table dense mais aérée, typographie tabulaire, séparateurs `border-line` fins. Couleurs de delta **vert / ambre / rouge** sémantiques avec légende.

---

## 7. Interaction Design
Hover ligne : highlight transversal ; click cellule : drawer latéral détail signal ; keyboard navigation par ligne.

---

## 8. Responsive UX
Mobile : mode **cartes empilées** par pays avec sections repliées ; sticky CTA bottom safe-area.

---

## 9. Accessibility
Table : `scope="col"` ; résumé non-visuel en paragraphe avant table ; deltas annoncés textuellement.

---

## 10. Edge Cases & States
- **<2 pays :** placeholder comparatif.
- **Données partielles :** cellule “insuffisant” + tooltip.
- **Erreur :** retry par pays.

---

## 11. User Journey Connections
Entrée depuis explorer avec querystring objectif ; sortie vers pays ou services.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Designer une **table premium** avec header pays sticky + avatar drapeau circulaire. Introduire **ligne de score composite** visuellement plus forte (fond `primary-soft`). Sticky bottom **glass** avec décision textuelle courte + double CTA (pays gagnant / aide humaine).

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 03]
