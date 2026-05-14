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

### 5.1 Implémentation (`app/(dashboard)/error.tsx`)
- **Même structure que PAGE 29** : `reset`, `Sentry.captureException`, `console.error`.
- **Copy contextualisée :** `h1` “Erreur dans l’espace connecté” ; sous-texte orienté tableau de bord.

### 5.2 Actions
- **Réessayer :** bouton primaire identique PAGE 29.
- **Tableau de bord :** `Link` vers **`/overview`** (sortie “sûre” espace connecté).
- **Tertiaire :** lien texte “Accueil” vers `/` pour sortie marketing.

### 5.3 Session expirée (produit)
- **Note Stitch :** si détection session possible, CTA Clerk sign-in — non codé explicitement dans ce fichier ; rester aligné **PAGE 33**.

### 5.4 Largeur & shell
- **Purpose :** carte erreur `max-w-lg` centrée — cohabite avec **PAGE 35** (sidebar) sans casser la grille.

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
Fichier repo : `docs/google-stitch/assets/page-30-fault-dash-stitch-reference.png`

**Architecture livrée (Stitch v1 — Fault·Dash workspace error)** : `app/(dashboard)/error.tsx` réécrit en composition pleine page avec **sidebar fantôme** désaturée (Stitch §12) en arrière-plan + carte erreur centrée.

- **Cream shell** `#FAF7EE`, layout 2 colonnes `lg:grid-cols-[220px_1fr]`.
- **Ghost sidebar** (lg+ only, `aria-hidden`) : faux nav désaturé avec wordmark `Intelligence` serif + mono `Mobility Terminal` + 4 entrées icônées (`BarChart3`, `Map`, `ShieldCheck`, `Archive`) à 40 % d'opacité + faux bouton `Export Report` outline en bas. Pure décor — pas de liens fonctionnels (Stitch §12 « aperçu sidebar fantôme »).
- **Carte erreur centrée** (`max-w-md`) : white card border `#0D1B3E/10`, padding généreux.
  - **Icône warning** `FileWarning` à 36 px, gris doux.
  - **Eyebrow `SYSTEM INTERRUPT`** mono uppercase tracking-`0.26em`.
  - **`h1`** serif navy `Erreur dans l'espace connecté` (clamp).
  - **Paragraphe** : « Nous n'avons pas pu charger vos données personnelles. Vous pouvez réessayer ou retourner à votre tableau de bord. »
  - **3 CTAs stacked** :
    - navy filled full-width `Réessayer` (`onClick={() => reset()}`),
    - white outlined full-width `Mon Tableau de bord` (lien `/overview`),
    - lien texte underline `Retour à l'accueil` vers `/`.
- **Observabilité préservée** : `useEffect` continue `console.error` + `Sentry.captureException`.
- Sortie marketing (`/`) conservée comme tertiaire (Stitch §5.2).
