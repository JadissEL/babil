# PAGE 24 — “IDENTITY”
## Mon profil — `/profile`

### File Name
`24-identity-user-profile.md`

### Page Type
Logged-In

### Related User Journeys
- Paramètres compte Clerk / champs custom futurs
- Alimentation moteurs personnalisés

### Connected Pages
- **Précédent :** `/overview`
- **Suivant :** `/probability`, Clerk user management hosted

---

## 1. Page Purpose
Centraliser **identité** et **préférences** impactant recommandations / probabilités. Résout *“Comment le produit me connaît-il ?”*

---

## 2. Primary User Actions
- **Primaires :** éditer champs profil ; sauvegarder.
- **Secondaires :** ouvrir gestion compte Clerk (UserProfile component patterns).

---

## 3. UX Goals
- **Contrôle utilisateur** transparent sur données utilisées.

---

## 4. Layout Architecture
Sections : Identité, Préférences mobilité, Sécurité compte, Notifications (placeholders).

---

## 5. Full Section Breakdown
Formulaires avec validation inline ; liens externes Clerk clairement marqués.

---

## 6. UI Design Direction
Esthétique **settings Apple-like** chaude (tokens VisaFlow).

---

## 7. Interaction Design
Save bar sticky apparaît si dirty state.

---

## 8. Responsive UX
Sections accordion ; bouton save flottant mobile.

---

## 9. Accessibility
Focus order logique ; erreurs annoncées.

---

## 10. Edge Cases & States
Conflit sauvegarde : retry ; permissions Clerk refusées : message.

---

## 11. User Journey Connections
Vers probability pour recalcul post-update.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Cartes settings avec **icône gauche + titre + chevron** uniformes. Section sécurité avec **shield holographique** abstrait léger.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 24]
