# PAGE 29 — “FAULT”
## Erreur segment — `app/error.tsx` (racine segment)

### File Name
`29-fault-app-error-boundary.md`

### Page Type
System

### Related User Journeys
- Récupération après erreur runtime partielle
- Retry navigation

### Connected Pages
- **Précédent :** route ayant crashé
- **Suivant :** même route après retry, ou `/`

---

## 1. Page Purpose
Isoler **panne non fatale** et permettre **recovery** sans reload brutal seul. Résout *“L’app a cassé mais je ne veux pas tout perdre.”*

---

## 2. Primary User Actions
- **Primaires :** “Réessayer” (reset boundary).
- **Secondaires :** retour accueil.

---

## 3. UX Goals
- **Rassurer** ; éviter jargon stack trace utilisateur final (sauf mode dev).

---

## 4. Layout Architecture
Card centrale message + actions + optional error id (support).

---

## 5. Full Section Breakdown
Boutons primaire/secondaire ; lien support (futur).

---

## 6. UI Design Direction
Palette légèrement **desaturée** pour signaler anomalie sans panique rouge sang.

---

## 7. Interaction Design
Retry : micro spin bouton.

---

## 8. Responsive UX
Card pleine largeur mobile avec padding confortable.

---

## 9. Accessibility
Focus sur premier bouton ; message lu par SR.

---

## 10. Edge Cases & States
Erreur persistante après retry : proposer accueil + contact.

---

## 11. User Journey Connections
Préserve contexte mental utilisateur.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Illustration **glitch géométrique contrôlé** (3 lignes décalées) — pas d’illustration effrayante. Typo calme.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 29]
