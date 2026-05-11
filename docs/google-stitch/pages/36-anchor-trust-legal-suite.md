# PAGE 36 — “ANCHOR”
## Suite confiance & légal — mentions, confidentialité, cookies (routes **futures** / contenu à brancher)

### File Name
`36-anchor-trust-legal-suite.md`

### Page Type
Public (spec **anticipée** — pas encore de routes dédiées dans `app/` au moment de la rédaction)

### Related User Journeys
- Transparence RGPD / ePrivacy
- Réduction friction “est-ce sérieux ?” avant conversion services

### Connected Pages
- **Liens depuis :** `SiteFooter` (**PAGE 43** / parent **PAGE 34**), formulaire délégué (PAGE 21), emails transactionnels futurs
- **Liées :** PAGE 32 (transparence données techniques)

---

## 1. Page Purpose
Préparer **l’architecture UX légale minimale viable** pour VisaFlow : pages statiques ou CMS pour **Mentions légales**, **Politique de confidentialité**, **Politique cookies** (+ bannière consentement). Aujourd’hui absentes du routeur — ce document permet à Stitch / produit de **livrer un bloc cohérent** sans refonte ultérieure des maquettes.

---

## 2. Primary User Actions
- **Primaires :** lire ; accepter / personnaliser cookies (bannière).
- **Secondaires :** télécharger politique PDF (futur) ; contact DPO (mailto).

---

## 3. UX Goals
- **Clarté juridique** sans intimidation (titres courts, sections numérotées, sommaire sticky).
- **Confiance** : dernière mise à jour visible en haut de chaque document.

---

## 4. Layout Architecture
- **Template unique “legal document”** : sommaire gauche (desktop) + corps scrollable ; mobile : sommaire collapsible top.
- **Bannière cookies** : fix bas au-dessus du `SiteObjectiveDock` (z-index coordonné avec PAGE 34) ou bandeau haut si dock trop chargé.

---

## 5. Full Section Breakdown

### 5.1 Mentions légales
- **Contenu :** éditeur / société, hébergeur, contact, numéro d’immatriculation si applicable.
- **Visuel :** typographie serif option pour longues lectures ; `max-w-prose` centré.

### 5.2 Politique de confidentialité
- **Sections :** données collectées (compte Clerk, formulaires délégués, analytics), finalités, durées, sous-traitants (Vercel, Render, Sentry… à lister factuellement), droits utilisateur.
- **Interlinking :** lien vers glossaire intelligence (PAGE 32) pour utilisateurs techniques.

### 5.3 Politique cookies
- **Matrice :** nom cookie, finalité, durée, opt-in/out.
- **Boutons :** “Tout accepter”, “Tout refuser”, “Personnaliser” (modale secondaire).

### 5.4 Bannière consentement (premier visit)
- **Purpose :** non bloquante pour lecture ; bloquante pour scripts non essentiels jusqu’à choix.
- **A11y :** focus trap dans modale “Personnaliser” ; bouton fermer explicite.

### 5.5 Liens footer (`SiteFooter`)
- **Ordre suggéré :** Mentions · Confidentialité · Cookies · (Contact) — alignés à gauche sur mobile, centrés desktop.

### 5.6 États localisés
- **FR uniquement** au départ ; structure prête pour `en` (toggle futur en footer).

### 5.7 Alignement exports & compte (**PAGE 24**)
- **Purpose :** la politique de confidentialité doit **référencer** l’export JSON RGPD (`/api/user/data-export`) et le **périmètre Clerk** (données hors export Babil) — même langage que la section “Vos données” du profil.

### 5.8 Assist & données dossiers (**PAGE 20–21**)
- **Purpose :** finalités traitement des champs formulaire délégué, durée conservation dossiers, destinataires internes — cohérent `delegated-application-*` libs.

### 5.9 Intelligence & provenance (**PAGE 32** / **PAGE 16**)
- **Purpose :** mentionner observations / sources agrégées ; lien vers glossaire ou doc technique pour utilisateurs avancés.

---

## 6. UI Design Direction
Même tokens que le marketing mais **fond `surface` ou blanc pur** pour lisibilité longue ; liens `primary` soulignés.

---

## 7. Interaction Design
Sommaire : clic scroll smooth vers ancre ; URL hash pour partage section (`#traitement-des-donnees`).

---

## 8. Responsive UX
Modale cookies pleine largeur mobile ; table cookie horizontale scroll avec header sticky.

---

## 9. Accessibility
Hiérarchie `h1` par page légale ; sous-sections `h2` ; listes de définitions pour termes juridiques fréquents.

---

## 10. Edge Cases & States
Utilisateur a déjà consenti : bannière absente ; ré-ouverture via lien “Gérer mes cookies” dans footer.

---

## 11. User Journey Connections
Renforce conversion **PAGE 20–21** ; complète narrative transparence **PAGE 16** (provenance pays).

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Créer un **“legal reader”** premium : colonne sommaire fine grisée, corps blanc avec **filet marge gauche** type document notarié. Bannière cookies en **glass dark** compacte, CTA primaire “Accepter” à droite (LTR).

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 36]
