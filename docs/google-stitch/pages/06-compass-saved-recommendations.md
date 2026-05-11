# PAGE 06 — “COMPASS”
## Mes recommandations — carte et liste des destinations suggérées

### File Name
`06-compass-saved-recommendations.md`

### Page Type
Public (gating auth via modal patterns)

### Related User Journeys
- Retour utilisateur après moteur reco
- Exploration géographique des suggestions

### Connected Pages
- **Précédent :** `/probability`, `/recommendation-engine`
- **Suivant :** `/countries/[id]`, auth

---

## 1. Page Purpose
Matérialiser les **résultats moteur** en **vue cartographique + liste** navigable. Résout *“Où est-ce que le système me pousse à regarder ?”* Business : rétention + reclics pays.

---

## 2. Primary User Actions
- **Primaires :** sélectionner point carte ; ouvrir pays.
- **Secondaires :** filtrer par score / région ; trier.
- **Conversion :** sign-in pour persistance API favorites/history.

---

## 3. UX Goals
- **Orientation spatiale** immédiate.
- **Clarté ranking** sans humiliation des destinations basses.

---

## 4. Layout Architecture
Split view desktop : carte | liste. Mobile : tabs Map/Liste.

---

## 5. Full Section Breakdown
### 5.1 Map canvas
Pins colorés par bucket score ; clustering zoom.

### 5.2 List panel
Cards alignées score + raison courte.

### 5.3 Auth promo strip
Si anonyme : bénéfices compte.

---

## 6. UI Design Direction
Carte **desaturated base** ; pins `primary` ; liste fond `surface`.

---

## 7. Interaction Design
Sync highlight liste ↔ pin ; smooth pan.

---

## 8. Responsive UX
Tabs bottom iOS style pour switch map/liste.

---

## 9. Accessibility
Liste navigable même si carte non utilisable — équivalent textuel ordre reco.

---

## 10. Edge Cases & States
Aucune reco : guide vers probability ; erreur géoloc : fallback liste seule.

---

## 11. User Journey Connections
Boucle vers compare multi picks.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Carte style **editorial travel print** (peu de labels UI sur la carte). Liste avec **rank chip** (#1, #2). Transition split slider entre carte et liste sur desktop.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 06]
