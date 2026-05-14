# PAGE 15 — “FORUM”
## Communauté — récits, pairs, et contenus sociaux

### File Name
`15-forum-community.md`

### Page Type
Public

### Related User Journeys
- Preuve sociale
- Engagement commentaires (si intégrés page)

### Connected Pages
- **Précédent :** sidebar
- **Suivant :** `/countries/[id]/quotes`, modération (si rôle)

---

## 1. Page Purpose
**Implémentation actuelle (`app/(public)/community/page.tsx`) :** page **RSC** minimaliste dans `PageContainer` — explique que les **commentaires** vivent sur les **fiches pays** (utilisateur connecté) et que la **modération** admin passe par `/moderation`. Résout *“Où discuter ?”* en **routant** vers l’explorer et les pays, pas via un fil social global dans l’app.

---

## 2. Primary User Actions
- **Primaires :** ouvrir l’**Explorer** ou **Recommandations** ; lire les instructions ; aller sur une **fiche pays** pour commenter une fois connecté.
- **Secondaires :** ouvrir **`/moderation`** (admins).
- **Conversion :** connexion Clerk (**PAGE 33**) pour déposer un commentaire sur **PAGE 16**.

---

## 3. UX Goals
- **Inclusion** et **modération visible** (règles).

---

## 4. Layout Architecture
**Une section** `rounded-2xl` : pastille “Communauté” + **`h1`** + paragraphe (strong sur commentaires modérés) + **`ul`** deux items (Explorer objectif-aware via **`ObjectiveAwareExplorerLink`**, lien **`/moderation`**) + flex **CTA** “Parcourir les pays” + “Recommandations personnalisées” (`/recommendations`).

**Pas de** feed, composer, ni fil de témoignages sur cette route.

---

## 5. Full Section Breakdown

### 5.1 Métadonnées
- **`metadata`** : titre “Communauté | VisaFlow” + description SEO.

### 5.2 Hiérarchie & ton
- **Kicker** uppercase + icône `MessageSquare`.
- **Corps :** expliquer agrégation signaux officiels + complément vécu via commentaires **par pays**.

### 5.3 Liste instructions
- **Item 1 :** `ObjectiveAwareExplorerLink` “Explorer” — même pattern objectif que **PAGE 02**.
- **Item 2 :** `Link` `/moderation` — préciser accès admin après connexion (**PAGE 25**).

### 5.4 CTA primaires
- **Explorer pays** ; **Recommandations** (**PAGE 06**).

### 5.5 Évolution produit (Stitch / backlog)
- **Futur :** fil global, `CommentBox` inline, guidelines — **PAGE 15** reste le slot maquette pour cette vision ; documenter l’écart avec l’implémentation actuelle.

### 5.6 Citations pays (**PAGE 17**)
- **Purpose :** contenu “preuve humaine” structuré autrement que commentaires — lien depuis copy ou CTA secondaire futur.

---

## 6. UI Design Direction
Ton **chaleureux** plus conversationnel ; bulles arrondies.

---

## 7. Interaction Design
Like / upvote (futur) avec micro-animation.

---

## 8. Responsive UX
Feed 1 colonne ; composer fix bas (si connecté).

---

## 9. Accessibility
Posts time-relative avec `datetime` ISO.

---

## 10. Edge Cases & States
Pas de feed : pas d’empty state “liste vide” ; utilisateur non admin sur `/moderation` → **PAGE 25** message 403.

---

## 11. User Journey Connections
Vers **PAGE 02** / **PAGE 06** ; vers **PAGE 16** + **PAGE 33** ; **PAGE 17** (citations) ; **PAGE 25** (modération).

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Ambiance **café diaspora** : bois clair, typographie semi-serif pour citations. Cartes témoignage avec **guillemets géants** en filigrane.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
Fichier repo : `docs/google-stitch/assets/page-15-forum-stitch-reference.png`

**Architecture livrée (Stitch v1)** : shell **cream `#FDFBF4`** (cohérent pages 10–14). Composant reste **RSC** (pas de `'use client'`) — SEO friendly, statique. Hero centré : pill `💬 COMMUNAUTÉ`, titre serif **« Partagez l'expérience, maîtrisez le voyage. »** (deux lignes), long paragraphe sur la modération + agrégation contextuelle ; CTAs duaux **`Parcourir les pays`** (navy plein, `ObjectiveAwareExplorerLink`) + **`Recommandations personnalisées`** (outlined → `/recommendations`). Section **2 cartes side-by-side** : `NAVIGATION → Explorer par objectif` (icon `Compass`, ouvre explorer objectif-aware) ; `ADMINISTRATION → Portail de Modération` (icon `ShieldAlert`, lien `/moderation`). Section **`Échos de la communauté`** = heading centré + grille **3 cartes témoignages** statiques (eyebrow `DESTINATION : PAYS` mono, citation italique en serif, ligne auteur = avatar pastille + nom + métier/âge). Données témoignages hardcodées dans un const `COMMUNITY_ECHOES` (Espagne / Japon / Canada) — façade marketing ; à terme remplaçable par un endpoint `traveler_quotes` filtrant les meilleurs récits. Footer Stitch via layout global.
