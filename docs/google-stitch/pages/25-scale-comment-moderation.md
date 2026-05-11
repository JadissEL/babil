# PAGE 25 — “SCALE”
## Modération commentaires — `/moderation`

### File Name
`25-scale-comment-moderation.md`

### Page Type
Logged-In (rôle modérateur / policy interne)

### Related User Journeys
- Revue file commentaires signalés
- Actions approve / reject / hide

### Connected Pages
- **Précédent :** sidebar explorer
- **Suivant :** pays source du commentaire (deep link)

---

## 1. Page Purpose
Fournir une **console de gouvernance sociale** (`CommentModerationPanel` patterns) pour protéger la confiance communauté. Résout *“Comment je traite les contenus risqués rapidement ?”*

---

## 2. Primary User Actions
- **Primaires :** lire commentaire + contexte ; approuver / rejeter / masquer.
- **Secondaires :** bannir utilisateur (si policy) ; ajouter note interne.

---

## 3. UX Goals
- **Neutralité** procédurale (éviter biais visuel accusateur).
- **Rapidité** décision (split view).

---

## 4. Layout Architecture
Liste file gauche → détail + actions droite ; barre stats haut.

---

## 5. Full Section Breakdown
Chaque item : extrait, auteur, pays, timestamp, gravité.

---

## 6. UI Design Direction
**Console** sobre : fond `inset`, texte dense autorisé ici seulement.

---

## 7. Interaction Design
Shortcuts clavier (j/k navigation) option premium modérateur.

---

## 8. Responsive UX
Mobile : un item plein écran ; swipe actions (prudent) ou menu overflow.

---

## 9. Accessibility
Actions avec confirmation modale focus trap.

---

## 10. Edge Cases & States
File vide : “Rien en attente” ; erreur API : retry ; double modération : optimistic lock message.

---

## 11. User Journey Connections
Retour community ; audit admin.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Split view **tribunal minimaliste** : gauche liste stricte monospace IDs légers ; droite carte commentaire sur fond neutre avec **bordure signal couleur** selon gravité (amber/red).

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 25]
