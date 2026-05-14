# PAGE 29 — “FAULT”
## Erreur segment — `app/error.tsx` (racine segment)

### File Name
`29-fault-app-error-boundary.md`

### Page Type
System

### Related User Journeys
- Récupération après erreur runtime partielle
- Retry navigation

### Connected Pages
- **Précédent :** route ayant crashé
- **Suivant :** même route après retry, ou `/`

---

## 1. Page Purpose
Isoler **panne non fatale** et permettre **recovery** sans reload brutal seul. Résout *“L’app a cassé mais je ne veux pas tout perdre.”*

---

## 2. Primary User Actions
- **Primaires :** “Réessayer” (reset boundary).
- **Secondaires :** retour accueil.

---

## 3. UX Goals
- **Rassurer** ; éviter jargon stack trace utilisateur final (sauf mode dev).

---

## 4. Layout Architecture
Card centrale message + actions + optional error id (support).

---

## 5. Full Section Breakdown

### 5.1 Implémentation (`app/error.tsx`)
- **Client boundary :** `'use client'` ; `reset()` sur bouton “Réessayer”.
- **Observabilité :** `console.error(error)` + **`Sentry.captureException(error)`** dans `useEffect`.

### 5.2 Hiérarchie contenu
- **`h1` :** “Une erreur est survenue”.
- **Sous-texte :** “Vous pouvez réessayer ou retourner à l’accueil.”

### 5.3 Actions
- **Primaire :** `button` natif “Réessayer” (`bg-primary`).
- **Secondaire :** `Link` “Accueil” vers `/` (`border-line bg-surface`).

### 5.4 Digest / support (futur)
- **Option :** afficher `error.digest` en monospace petit pour le support — aujourd’hui non exposé dans l’UI.

### 5.5 Stack trace
- **Règle produit :** ne jamais afficher stack utilisateur final en prod ; logs réservés console/Sentry.

---

## 6. UI Design Direction
Palette légèrement **desaturée** pour signaler anomalie sans panique rouge sang.

---

## 7. Interaction Design
Retry : micro spin bouton.

---

## 8. Responsive UX
Card pleine largeur mobile avec padding confortable.

---

## 9. Accessibility
Focus sur premier bouton ; message lu par SR.

---

## 10. Edge Cases & States
Erreur persistante après retry : proposer accueil + contact.

---

## 11. User Journey Connections
Préserve contexte mental utilisateur.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Illustration **glitch géométrique contrôlé** (3 lignes décalées) — pas d’illustration effrayante. Typo calme.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
Fichier repo : `docs/google-stitch/assets/page-29-fault-stitch-reference.png`

**Architecture livrée (Stitch v1 — Fault System card)** : `app/error.tsx` (client boundary) réécrit en composition centrée carrée sur shell cream `#FAF7EE`.

- **Cream shell pleine page** + smudge décoratif (large radial gradient gris pâle haut-gauche, `pointer-events-none`).
- **Card centrale** : white card carrée (`max-w-md`, padding généreux), border subtile `#0D1B3E/10`, ombre douce.
  - **Eyebrow `SYSTEM FAULT`** mono uppercase tracking-`0.28em` + pastille rose `bg-rose-500` 6×6px.
  - **Glitch geometric mark** SVG : 3 traits horizontaux courts décalés (Stitch §12 « glitch géométrique contrôlé »).
  - **`h1`** serif navy `Une erreur est survenue` (clamp).
  - **Paragraphe** étendu : « Nous n'avons pas pu charger ce composant. Vous pouvez réessayer ou retourner à l'accueil pour reprendre votre session. »
  - **2 boutons** centrés : navy filled `Réessayer` (icône `RefreshCcw`, `onClick={() => reset()}`), white outlined `Accueil` (lien `/`).
  - **Code de référence** mono tracking-`0.26em` : `CODE DE RÉFÉRENCE : ERR-XXXX` — calculé à partir de `error.digest` (premiers 4 caractères uppercase) ou hash stable du message d'erreur en fallback. Permet au support de tracer.
- **Observabilité préservée** : `useEffect` continue d'appeler `console.error(error)` + `Sentry.captureException(error)`.
