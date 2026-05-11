# PAGE 31 — “FAULT·GLOBAL”
## Erreur critique racine — `app/global-error.tsx`

### File Name
`31-fault-global-error-shell.md`

### Page Type
System (fatal — hors layout principal)

### Related User Journeys
- Défaillance layout racine / provider global
- Dernière chance recovery

### Connected Pages
- **Précédent :** toute app
- **Suivant :** hard reload `/`

---

## 1. Page Purpose
Gérer **catastrophe** où même le layout racine échoue. Résout *“Écran blanc total.”* avec dignité.

---

## 2. Primary User Actions
- **Primaires :** recharger application.
- **Secondaires :** contacter support (lien mail).

---

## 3. UX Goals
- **Ultra clarté** ; aucune dépendance style externe fragile (inline critical CSS mental model).

---

## 4. Layout Architecture
HTML minimal centré ; message bref ; bouton reload.

---

## 5. Full Section Breakdown
Pas de dépendance `AppNavbar` ; police système fallback.

---

## 6. UI Design Direction
**Brutalisme doux** : noir & blanc + une seule couleur accent.

---

## 7. Interaction Design
Gros bouton reload ; hit area large.

---

## 8. Responsive UX
Identique.

---

## 9. Accessibility
Contraste maximal ; bouton natif `button`.

---

## 10. Edge Cases & States
Sentry id display (si intégré) pour support.

---

## 11. User Journey Connections
Reset complet session utilisateur.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Éviter tout asset distant. Utiliser **typo géante** “Une erreur critique est survenue” avec **sous-texte court** + bouton plein width mobile.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 31]
