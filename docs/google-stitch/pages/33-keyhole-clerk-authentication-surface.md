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
États : loading provider ; MFA (si activé) ; erreur credential.

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
[PASTE SCREENSHOT HERE — PAGE 33]
