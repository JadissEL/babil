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
Créer un **espace narratif** (témoignages, discussions) complétant la donnée froide. Résout *“Qu’est-ce que vivent les autres ?”*

---

## 2. Primary User Actions
- **Primaires :** lire threads / témoignages.
- **Secondaires :** poster commentaire (patterns `CommentBox` sur autres pages — ici agrégation).
- **Conversion :** inscription pour participer.

---

## 3. UX Goals
- **Inclusion** et **modération visible** (règles).

---

## 4. Layout Architecture
Hero communauté → feed cartes → CTA pays liés → règles.

---

## 5. Full Section Breakdown

### 5.1 Hero communauté
- **Purpose :** poser les règles de respect et la valeur du témoignage authentique.
- **Content :** titre + paragraphe “comment contribuer” + lien vers guidelines / modération.
- **Banner optionnel :** campagne mise en avant (ex. “Partagez votre retour Schengen 2026”).

### 5.2 Feed principal
- **Card structure :** avatar initiales ou photo ; nom affiché ; badge pays (`CountryBadge` pattern) ; extrait 2–3 lignes ; méta (relatif + pays).
- **Interactions :** clic carte → détail thread (futur) ou ancre vers pays ; hover élévation légère.
- **Pagination :** “Charger plus” préféré à l’infini aveugle pour performance perception.

### 5.3 Filtres & tri (futur)
- **Purpose :** réduire bruit (pays, thème, langue).
- **Responsive :** bottom sheet filtres.

### 5.4 CTA pays liés
- **Purpose :** renvoyer vers intelligence froide après émotion chaude.
- **Layout :** strip horizontal de `CountryCard` miniatures.

### 5.5 Règles & modération
- **Purpose :** transparence (“signalement”, “délais de revue”).
- **Lien :** `/moderation` visible seulement pour rôles autorisés ; sinon copy générique.

### 5.6 Composer (utilisateur connecté)
- **Purpose :** friction basse pour première contribution.
- **States :** disabled si non auth avec CTA sign-in ; compteur caractères ; preview markdown léger si supporté.

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
Feed vide : invite à quotes pays ; modération pending states.

---

## 11. User Journey Connections
Vers quotes pays ; vers sign-in.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Ambiance **café diaspora** : bois clair, typographie semi-serif pour citations. Cartes témoignage avec **guillemets géants** en filigrane.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 15]
