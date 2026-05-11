# PAGE 30 — “FAULT·DASH”
## Erreur espace connecté — `app/(dashboard)/error.tsx`

### File Name
`30-fault-dashboard-error-boundary.md`

### Page Type
System (segment dashboard)

### Related User Journeys
- Erreur données utilisateur / SSR dashboard
- Navigation vers overview sain

### Connected Pages
- **Précédent :** route dashboard fautive
- **Suivant :** `/overview`, retry même route

---

## 1. Page Purpose
Même rôle que erreur racine mais **ton contextualisé workspace** (copy différente possible). Résout *“Mon espace perso ne répond pas.”*

---

## 2. Primary User Actions
- **Primaires :** retry ; aller overview.
- **Secondaires :** sign-out / reauth (si session).

---

## 3. UX Goals
- **Ne pas casser** confiance sur données personnelles.

---

## 4. Layout Architecture
Respecter largeur dashboard (pas full bleed marketing).

---

## 5. Full Section Breakdown
Inclure mention “vos données sont sauvegardées” si applicable.

---

## 6. UI Design Direction
Alignée shell dashboard (fond surface, bordure line).

---

## 7. Interaction Design
Identique page 29 mais spacing sidebar-aware (Stitch).

---

## 8. Responsive UX
Drawer sidebar peut rester accessible ou se replier pour focus erreur.

---

## 9. Accessibility
Même standards page 29.

---

## 10. Edge Cases & States
Session expirée : CTA sign-in Clerk.

---

## 11. User Journey Connections
Stabilise rétention utilisateur.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Afficher **mini aperçu sidebar fantôme** atténuée derrière la carte erreur pour rappeler le contexte “espace perso”.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 30]
