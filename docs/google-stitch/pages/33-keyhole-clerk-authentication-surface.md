# PAGE 33 — “KEYHOLE”
## Authentification Clerk — modales & parcours hébergés (non-route dédiée dans repo)

### File Name
`33-keyhole-clerk-authentication-surface.md`

### Page Type
Onboarding / System overlay (Clerk)

### Related User Journeys
- Sign-in / sign-up depuis CTA `SignInButton` modal
- Accès `/overview` protégé layout dashboard

### Connected Pages
- **Précédent :** `/probability`, `/recommendations`, CTA navbar
- **Suivant :** `/overview`, retour page d’origine (post-auth redirect)
- **Politique serveur / Edge :** **PAGE 39** (`proxy.ts` — quelles routes exigent `auth.protect()`)
- **Observabilité navigateur :** **PAGE 42** (`SentryClerkSync` — pas d’email / nom dans Sentry)

---

## 1. Page Purpose
Couvrir **toutes surfaces d’identité** même sans routes `/sign-in` locales : modales Clerk, pages hébergées Clerk (URLs dashboard configurables), **UserButton** / **Organization** futurs. Résout *“Je me connecte sans quitter mon contexte.”*

---

## 2. Primary User Actions
- **Primaires :** email/password ou OAuth providers ; fermer modal.
- **Secondaires :** reset password (flux Clerk).

---

## 3. UX Goals
- **Continuité narrative** : arrière-plan page reste visible floutée.
- **Confiance** (logo Clerk + copy VisaFlow co-branding).

---

## 4. Layout Architecture
Overlay full viewport blur → card auth centrée → footer légal.

---

## 5. Full Section Breakdown

### 5.1 Surfaces dans le repo
- **`SignInButton mode="modal"`** (ex. **PAGE 05**, **PAGE 06**) : ouverture Clerk sans route `/sign-in` locale.
- **`useUser` / `useAuth` :** gates côté client pour charger profil API.
- **Dashboard :** layouts `(dashboard)` protégés — redirection / garde Clerk côté Edge via **`proxy.ts`** (détail liste routes → **PAGE 39**).

### 5.2 États modale
- **Loading OAuth :** spinner provider Clerk natif.
- **MFA / e-mail non vérifié :** flows Clerk standard — copy FR dans dashboard Clerk si configurable.
- **Erreurs credential :** messages Clerk ; harmoniser ton **chaleureux** VisaFlow sur wrappers custom si ajoutés.

### 5.3 Post-auth redirect
- **Purpose :** retour page d’origine ou `/overview` selon politique produit ; documenter le comportement réel une fois figé.

### 5.4 UserButton / compte hébergé
- **Purpose :** gestion compte Clerk (avatar menu) — hors Stitch page unique si non custom ; mentionner dans maquettes **PAGE 24** (export RGPD vs Clerk).

### 5.5 Sécurité UX
- **Blur overlay :** réglage Clerk + fond page visible pour continuité (cf. §12).
- **Focus trap / ESC :** comportements Clerk par défaut — ne pas les casser avec z-index maison.

---

## 6. UI Design Direction
Aligner tokens : bouton primaire auth = `primary` VisaFlow si theming Clerk custom disponible.

---

## 7. Interaction Design
Focus trap ; ESC ferme si non bloquant ; transitions entrée 150ms.

---

## 8. Responsive UX
Card pleine largeur ≤400px avec marges ; champs 48px hauteur.

---

## 9. Accessibility
Ordre tab circulaire ; messages erreur liés champs.

---

## 10. Edge Cases & States
OAuth annulé ; email non vérifié ; rate limit — messages humains.

---

## 11. User Journey Connections
Débloque historique, favoris, apply services persistants.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Arrière-plan **depth blur** fort avec **silhouette carte monde** très fade. Carte auth **glassmorphism premium** (pas plastique). Microcopy FR **chaleureuse** au-dessus formulaire : “Sauvegardez vos scénarios en un compte.”

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
Fichier repo : `docs/google-stitch/assets/page-33-keyhole-stitch-reference.png`

**Architecture livrée (Stitch v1 — Keyhole co-branding VisaFlow ⨯ Clerk)** :

- **Theming Clerk centralisé** : `ClerkProvider` dans `app/layout.tsx` reçoit un objet `appearance` (variables `colorPrimary`, `colorText`, `colorBackground`, `colorInputBackground`, `colorTextSecondary`, `borderRadius` `0.5rem`, `fontFamily` Inter) + element overrides (`card` transparent border-less puisque wrappé, `formButtonPrimary` navy uppercase tracking, `formFieldInput` cream, `footerActionLink` navy underline). **Tous** les surfaces Clerk (modal `SignInButton mode="modal"`, modal `SignUpButton`, pages `<SignIn />`/`<SignUp />`, `UserButton`) héritent automatiquement de cette identité.
- **Routes locales dédiées** créées (Stitch §1 « toutes surfaces d'identité ») :
  - `app/sign-in/[[...sign-in]]/page.tsx` — wrapping centré cream `#FAF7EE` autour de `<SignIn />` Clerk avec wordmark serif `VisaFlow` + caption mono `POWERED BY CLERK` + microcopy chaleureuse `Sauvegardez vos scénarios en un compte.` (Stitch §12).
  - `app/sign-up/[[...sign-up]]/page.tsx` — symétrique avec microcopy `Créez votre compte VisaFlow.` autour de `<SignUp />`.
  - Routes catch-all `[[...sign-in]]` requises par Clerk pour gérer les sous-étapes (verification email, MFA, reset password).
  - `metadata` SEO et `noindex` (`robots: { index: false, follow: false }`) sur ces routes (auth surfaces ne doivent pas être indexées).
- **`SiteChrome` mis à jour** (`usePathname`) : si la route commence par `/sign-in` ou `/sign-up`, **bypass complet** du header, footer, sidebar et dock objectif — la page d'auth occupe l'écran entier en standalone (Stitch §4 « overlay full viewport »). Toaster conservé.
- **Background** : radial gradient subtil (« silhouette carte monde très fade » Stitch §12) + glassmorphism léger sur la carte Clerk wrapper via `bg-white/85 backdrop-blur` autour du composant Clerk lui-même.
- **`.env.example`** mis à jour pour activer les URLs Clerk : `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/overview`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/overview` (décommentés, valeurs par défaut). Le modal Clerk `SignInButton mode="modal"` reste **inchangé** comme chemin par défaut depuis le header — les routes hébergées servent en fallback (SSO callback, reset password, deep link).
- **Sécurité UX** : focus trap / ESC Clerk natifs préservés (pas d'`z-index` custom qui les casse). Microcopy autour reste hors carte Clerk pour éviter shift de layout.
