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
**Implémentation (`app/(dashboard)/profile/page.tsx`) :** en-tête “Votre profil” + **bouton Sauvegarder** sticky en haut à droite (desktop) → carte **RGPD export JSON** → grille **personas démo** → section **Assist candidatures** (liens services) → **formulaire champs profil** (âge, revenus, objectif, etc.) — Clerk géré hors page (compte) avec mention dans copy export.

---

## 5. Full Section Breakdown

### 5.1 Chargement & skeleton
- **`DashboardPageSkeleton variant="profile"`** pendant `GET /api/user/profile`.

### 5.2 Sauvegarde `POST /api/user/profile`
- **Purpose :** persistance champs `profile` state ; toasts succès/erreur (`appToast`).
- **Feedback :** bannière verte temporaire sur message succès inline.

### 5.3 Export RGPD (`GET /api/user/data-export`)
- **Purpose :** blob JSON téléchargé ; nom fichier depuis `Content-Disposition` ou défaut `babil-donnees-personnelles.json`.
- **Copy :** rappeler que **Clerk** n’est pas inclus — gestion compte côté Clerk.

### 5.4 Personas démo (`PERSONA_PRESETS`)
- **Purpose :** trois cartes (étudiant·e, nomade digital, business) qui **patch** le state local ; toast “appliqué — enregistrez si besoin”.
- **UX :** accélère démo commerciale sans écraser silencieusement la base.

### 5.5 Assist candidatures
- **Liens :** `/services/delegated-applications`, ancre `/overview#assist-requests` (voir code pour libellés exacts).

### 5.6 Formulaire profil détaillé
- **Champs :** alignés scoring / probabilités (`goal_type`, épargne, famille en Europe, etc.) — documenter chaque groupe pour Stitch (labels FR, aides inline).
- **Edge :** erreur API profil initial → état vide géré par `loading` puis affichage défaut.

### 5.7 Lien journey moteurs
- **Post-save :** utilisateur retourne **PAGE 05** / **PAGE 06** pour recalcul (CTA secondaires possibles dans copy).

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
