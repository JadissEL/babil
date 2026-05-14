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

### 5.1 Implémentation (`app/global-error.tsx`)
- **Contrainte App Router :** composant doit rendre **`<html lang="fr">` + `<body>`** complets (layout racine indisponible).
- **Recovery :** `reset()` + lien Accueil — pas d’accès aux providers du layout principal.

### 5.2 Observabilité
- **`Sentry.captureException(error)`** dans `useEffect` (pas de `console.error` explicite dans le snippet actuel — acceptable si Sentry agrège).

### 5.3 Styles
- **`body` :** `flex min-h-screen flex-col items-center justify-center gap-6 bg-bg` — tokens globaux si CSS chargé ; sinon fallback navigateur.

### 5.4 Copy
- **`h1` :** “Une erreur critique est survenue” ; paragraphe court invitant réessayer ou accueil.

### 5.5 Boutons
- **Même pattern** primary/outline que PAGE 29 — hit area large mobile.

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
Fichier repo : `docs/google-stitch/assets/page-31-fault-global-stitch-reference.png`

**Architecture livrée (Stitch v1 — Fault·Global brutalisme doux)** : `app/global-error.tsx` réécrit avec composition centrée pleine page + typo géante watermark `FAULT`.

- **Shell** `<html lang="fr">` + `<body>` cream `#FAF7EE` avec **styles inline critiques** (background, font, color) pour résilience même si Tailwind/CSS racine échoue (Stitch §3 « aucune dépendance style externe fragile »).
- **Composition centrée** flex column `min-h-screen` :
  - **Carré rose bordered** (border-rose-200 + bg-rose-50 légère) avec `AlertTriangle` rouge centré — signal d'alerte mesuré.
  - **Watermark typo géante** `FAULT` en `font-black` ultra grand (clamp 4rem → 9rem) `text-[#0D1B3E]/8` absolument positionné derrière le titre — typo-as-decor (Stitch §12 « typo géante »).
  - **`h1` `Une erreur critique est survenue`** serif navy 2 lignes, clamp responsive, z-index au-dessus du watermark.
  - **Paragraphe** : « L'application a rencontré un problème majeur. Vous pouvez tenter de recharger la page ou retourner à l'accueil pour réinitialiser votre session. »
  - **CTA primaire** plein largeur mobile, navy filled : `Recharger l'application` (calls `reset()` + `window.location.reload()` fallback).
  - **2 liens secondaires** avec icônes : `Home` → `/`, `Headphones` → `mailto:support@visaflow.com?subject=Erreur%20critique%20VisaFlow`.
  - **Footer ID** mono uppercase tracking-`0.22em` : pastille rose + `ERR_BOUNDARY_FAULT_GLOBAL` + suffix court dérivé de `error.digest` (premiers 4 chars) si disponible. Stitch §5.5 / §10 (Sentry id pour support).
- **Observabilité** : `Sentry.captureException(error)` préservé dans `useEffect`. Ajout de `console.error(error)` (Stitch §5.2 « acceptable si Sentry agrège », mais on garde les deux pour parité avec PAGES 29-30).
- Contrainte App Router respectée : composant retourne `<html>` + `<body>` complets.
