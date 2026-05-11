# PAGE 37 — “RELAY”
## Micro-feedback contenu — `BlockFeedback` (transversal, non-route)

### File Name
`37-relay-block-feedback-micro-ui.md`

### Page Type
Public / Transversal (fragment UI réutilisable sur blocs de contenu)

### Related User Journeys
- Signal qualité perçue sur une section pays ou article
- Alimentation historique utilisateur (`CONTENT_FEEDBACK` côté API si connecté)

### Connected Pages
- **Emplacement typique :** **PAGE 16** (sections longues hub pays), futures pages éditoriales
- **Technique :** `components/feedback/BlockFeedback.tsx` ; persistance `localStorage` ; `POST /api/user/history` si Clerk `user` présent

---

## 1. Page Purpose
Définir le **micro-pattern “Utile ?”** (pouces oui/non) pour collecter un signal **léger, non intrusif**, sur la qualité d’un bloc (`blockId` + `countryId` optionnel). Sans spec commune, Stitch risque de **redessiner des boutons discordants** ou de les placer au mauvais endroit (milieu de paragraphe).

---

## 2. Primary User Actions
- **Primaires :** voter “Oui” / “Non” ; revoter change l’état (persist remplace).
- **Secondaires :** (implicite) lecture seule après vote — état visuel selected.

---

## 3. UX Goals
- **Frugalité** : ne pas compter comme “notation globale pays”, seulement **utilité du bloc**.
- **Confiance** : pas de dark pattern (pas de pop-up après “Non” sauf futur flow opt-in).

---

## 4. Layout Architecture
- **Conteneur :** `flex flex-wrap items-center justify-end gap-2` avec `border-t border-line pt-4 mt-4` — **toujours sous** le bloc concerné, jamais au-dessus du titre.
- **Gauche :** label uppercase micro `Utile ?` (`text-muted`).
- **Droite :** deux boutons pill `Oui` / `Non` avec icônes Lucide `ThumbsUp` / `ThumbsDown`.

---

## 5. Full Section Breakdown

### 5.1 États visuels boutons
- **Neutre :** `border-line bg-inset text-muted` + hover `hover:border-primary/30 hover:text-text`.
- **Oui sélectionné :** `border-success/50 bg-[#e9f9f1] text-success`.
- **Non sélectionné :** `border-danger/45 bg-[#fff0f0] text-danger`.
- **Stitch :** ne pas changer ces tokens sans revue design — ils portent la sémantique émotionnelle.

### 5.2 Accessibilité
- **Conteneur :** `role="group"` + `aria-label="Ce bloc vous est-il utile ?"` (FR).
- **Boutons :** `aria-pressed={true|false}` selon sélection ; icônes `aria-hidden`.

### 5.3 Persistance locale
- **Clé storage :** `babil:content-feedback:v1:{blockId}:{countryId|na}` — expliquer que le vote **revient** au reload.
- **Edge :** `localStorage` indisponible → boutons fonctionnent en session seule (pas d’erreur visible).

### 5.4 Utilisateur connecté
- **POST** `/api/user/history` avec `type: 'CONTENT_FEEDBACK'` et payload `{ blockId, countryId, helpful }` — **silencieux** (`.catch(() => {})` côté code) : pas de toast obligatoire ; option micro-toast “Merci” futur.

### 5.5 Utilisateur anonyme
- **Purpose :** vote stocké localement uniquement ; pas de frustration “connectez-vous”.

### 5.6 Placement sur hub pays
- **Recommandation :** après sections longues (insights DB, provenance) **une seule** instance par bloc majeur — éviter spam de 8 barres identiques.
- **blockId :** convention stable `country-insights`, `provenance-summary`, etc.

### 5.7 Densité mobile
- **Purpose :** wrap `flex-wrap` ; boutons restent tap targets ≥ 40px height (`py-1.5` + padding horizontal).

### 5.8 Cohérence avec PAGE 27
- **Purpose :** section dédiée dans le design system reproduit **exactement** ce fragment pour QA.

---

## 6. UI Design Direction
Discret **micro-contrôle** : typographie `10px` uppercase tracking — même ADN que kicksers ailleurs, mais **toujours** secondaire vis-à-vis du contenu principal.

---

## 7. Interaction Design
Clic : transition couleur 150ms ; pas d’animation bounce ; focus ring identique aux autres boutons.

---

## 8. Responsive UX
Alignement `justify-end` conservé ; sur très petit écran, label “Utile ?” peut passer au-dessus des boutons (colonne) si wrap naturel.

---

## 9. Accessibility
Annonce optionnelle `aria-live="polite"` sur remerciement futur ; pas de live region bruyante sur chaque clic actuel.

---

## 10. Edge Cases & States
Double vote rapide : last write wins ; cohérent avec `aria-pressed`.

---

## 11. User Journey Connections
Enrichit données qualité contenu interne ; lien narratif avec **PAGE 23** si l’historique affiche un libellé humain pour `CONTENT_FEEDBACK`.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Ne **pas** transformer en étoiles ou emoji. Garder **pills fines** alignées à droite sous un séparateur `border-t` léger. Icônes **3.5px** petites pour rester modestes.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 37]
