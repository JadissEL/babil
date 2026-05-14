# PAGE 28 — “VOID”
## Page introuvable — `not-found.tsx`

### File Name
`28-void-not-found.md`

### Page Type
System

### Related User Journeys
- Erreur URL / lien rompu
- Sortie rapide

### Connected Pages
- **Précédent :** toute origine invalide
- **Suivant :** `/`

---

## 1. Page Purpose
Réorienter sans **honte utilisateur** ; conserver confiance marque. Résout *“Je suis perdu.”*

---

## 2. Primary User Actions
- **Primaires :** retour accueil.
- **Secondaires :** recherche globale pays (si ajoutée futur).

---

## 3. UX Goals
- **Calme** ; pas d’humour agressif.

---

## 4. Layout Architecture
**Implémentation (`app/not-found.tsx`) :** conteneur `min-h-[50vh]` centré `max-w-lg` — **kicker** `Erreur 404` (`text-xs font-black uppercase tracking-[0.2em] text-muted`) → **`h1` “Page introuvable”** → paragraphe aide → **lien primaire** “Retour à l’accueil” vers `/`.

---

## 5. Full Section Breakdown

### 5.1 Métadonnées SEO
- **`metadata.title` / `description` :** “Page introuvable” + phrase explicative (FR).

### 5.2 Hiérarchie typo
- **Kicker :** discret mais lisible (tracking large).
- **Titre :** `text-2xl font-black` — une seule `h1` par vue.

### 5.3 CTA unique
- **Style :** `rounded-xl bg-primary` + uppercase tracking (cohérent marketing).

### 5.4 Extensions futures (hors code)
- **Recherche pays** ou liens secondaires — ne pas surcharger la 404 ; garder une sortie claire.

---

## 6. UI Design Direction
Minimalisme **swiss** ; beaucoup de whitespace.

---

## 7. Interaction Design
CTA hover standard primary.

---

## 8. Responsive UX
Identique toutes tailles.

---

## 9. Accessibility
`h1` unique ; CTA focus visible.

---

## 10. Edge Cases & States
Locale FR fixe ; futur i18n.

---

## 11. User Journey Connections
Reset vers home funnel.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Ajouter **léger grain** sur fond pour chaleur. Illustration abstraite **trou de ver** géométrique (pas de mascotte cartoon).

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
Fichier repo : `docs/google-stitch/assets/page-28-void-stitch-reference.png`

**Architecture livrée (Stitch v1 — Void wormhole 404)** : page `app/not-found.tsx` réécrite en composition centrée pleine page sur cream `#FAF7EE`.

- **Logo `VisaFlow`** serif navy top-left (`max-w-6xl px-8 pt-10`).
- **Illustration `WormholeMark`** SVG pure (viewBox 600×600, `aria-hidden`) : disque sombre central rempli d'un `radialGradient` navy → cream chaud `#FAF7EE` au centre, **18 concentric ring strokes** avec opacités décroissantes simulant un tunnel optique, halo cream `#FFEFD9` au centre, et anneau extérieur pâle pour décoller du fond. Taille `max-w-[460px]` mobile / `max-w-[520px]` desktop, hauteur respiratoire généreuse.
- **Filet horizontal** + kicker mono `ERREUR 404` tracking-`0.3em` `text-[#0D1B3E]/60`.
- **Titre `h1`** serif navy `Page introuvable` (clamp 2.25rem→3rem) — unique sur la vue.
- **Paragraphe** copy étendu Stitch : « Le document ou la ressource que vous tentez de consulter n'est plus disponible à cette adresse. L'architecture de nos données a pu être mise à jour. Nous vous invitons à regagner l'espace principal. »
- **CTA pill navy** `Retour à l'accueil` (uppercase tracking-`0.2em`, icône `ArrowLeft`, hover plus sombre, focus ring) — lien `/`.
- Métadonnées SEO conservées (`metadata.title` / `description`).
