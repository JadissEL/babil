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
- **Amont checklist :** **PAGE 46** (étape “Compléter votre profil” → `/profile`)
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
Fichier repo : `docs/google-stitch/assets/page-24-identity-stitch-reference.png`

**Architecture livrée (Stitch v1 — Identity 2-col settings)** : shell **cream `#FAF7EE`**. Layout 2-col `lg:grid-cols-[1fr_320px]` :
- **Hero card** blanche : serif `Votre profil` + sous-titre `Gérez vos informations personnelles et vos préférences de mobilité.` ; bouton navy `Sauvegarder` ancré en haut à droite (avec `Save` icon). Bannière succès verte inline si `message` (RGPD-friendly `aria-live`).
- **Colonne form** (gauche) — carte blanche unique avec bordure gauche accent navy `border-l-4 border-l-[#0D1B3E]`, divisée en groupes par **pill eyebrow** mono :
  - `Identité & Situation` : Prénom (Clerk read-only) / Nom (Clerk read-only) ; Âge / Statut marital (select).
  - `Finances & Objectifs` : Revenu Mensuel Net (MAD) / Épargne Disponible (MAD) ; Profession (select) ; Objectif de Mobilité (select reprenant `goal_type` → 5 valeurs tourisme/études/travail/business/formation) ; toggle navy `CNSS déclaré`.
  - `Attaches` : ligne `Famille en Europe` titre + body + radio `Oui/Non` (remplace l'ancien toggle, plus lisible Stitch) ; textarea `Détails` conditionnelle.
- **Colonne sidebar** (droite, `lg:sticky lg:top-6`) — 3 cartes blanches au style Settings (icône en pastille cream + titre serif) :
  - `Profils Types` : 3 lignes cliquables (`Étudiant` `Nomade Digital` `Business`) avec icône glyph + chevron, qui `patch` le state via `PERSONA_PRESETS` (toast inchangé).
  - `Assistance & Candidatures` : 3 liens row navy (`Services Délégués` → catalogue, `Mes demandes` → `/overview#assist-requests`, `Historique des demandes` → `/history`).
  - `Confidentialité` : copy Clerk + bouton `Exporter mes données` (`Download` icon) qui appelle `handleGdprExport` inchangé.

Logique préservée intacte : `GET/POST /api/user/profile`, `GET /api/user/data-export`, Clerk `useUser` (firstName/lastName/email), `PERSONA_PRESETS`, `appToast`, `DashboardPageSkeleton variant="profile"`. Le formulaire continue d'écrire `age / profession / income / savings / CNSS_status / marital_status / family_in_europe / family_details / goal_type` exactement comme avant — seul le rendu est restylé en banking cream.
