# PAGE 22 — “HORIZON”
## Aperçu espace connecté — `/overview`

### File Name
`22-horizon-dashboard-overview.md`

### Page Type
Logged-In (Clerk)

### Related User Journeys
- Post-auth landing
- Retour utilisateur récurrent

### Connected Pages
- **Précédent :** sign-in Clerk, home CTA
- **Suivant :** `/history`, `/profile`, engines

---

## 1. Page Purpose
Donner **vision d’ensemble personnalisée** : onboarding post-signup (`PostSignupOnboarding`), bannière contextuelle profil (`ProfileContextBanner`), accès rapide moteurs & pays récents (`RecentlyViewedCountries`). Résout *“Où j’en suis dans mon projet mobilité ?”*

---

## 2. Primary User Actions
- **Primaires :** compléter onboarding checklist ; ouvrir historique ; relancer moteur.
- **Secondaires :** corriger profil ; accéder admin si rôle.

---

## 3. UX Goals
- **Orientation** immédiate (pas de dashboard vide froid).
- **Motivation** douce (progress visuelle).

---

## 4. Layout Architecture
Top : bannière contextuelle → grille widgets (raccourcis, pays récents, CTA reco) → second row analytics légers (futur).

---

## 5. Full Section Breakdown
Skeleton `DashboardPageSkeleton` pour loading.

---

## 6. UI Design Direction
Différencier **workspace** du marketing : sidebar sombre ou clair inversé (selon code) mais mêmes tokens boutons.

---

## 7. Interaction Design
Widgets : drag reorder (futur) ; hover quick actions.

---

## 8. Responsive UX
Widgets stack ; sidebar → drawer.

---

## 9. Accessibility
Landmarks `nav`, `main`, `aside` ; headings par widget.

---

## 10. Edge Cases & States
Nouveau compte : onboarding full ; erreur fetch : retry widget isolé.

---

## 11. User Journey Connections
Hub vers toutes routes dashboard & explorer.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Créer **bento dashboard** asymétrique premium : widget “Prochaine étape” large 2×1, pays récents en strip horizontal scroll. Onboarding comme **checklist passport stamps** animés subtilement.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 22]
