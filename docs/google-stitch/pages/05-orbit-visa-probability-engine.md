# PAGE 05 — “ORBIT”
## Moteur de probabilités visa — personnalisation du signal

### File Name
`05-orbit-visa-probability-engine.md`

### Page Type
Public (auth modal pour actions réservées)

### Related User Journeys
- Estimation “chances” subjective → signaux
- Incitation création compte après run
- Passage vers recommandations sauvegardées

### Connected Pages
- **Précédent :** navbar, overview
- **Suivant :** `/recommendations`, `/countries/[id]`, Clerk modal

---

## 1. Page Purpose
Le moteur de probabilités **traduit le profil utilisateur** en **lecture probabiliste** (niveaux, narration, radar axes). Il adresse *“Pour moi, ça veut dire quoi ?”* sans promesse légale. Business : activation compte + données profil pour personnalisation.

---

## 2. Primary User Actions
- **Primaires :** saisir / ajuster paramètres profil ; lancer calcul ; lire résultat.
- **Secondaires :** partager (futur) ; exporter PDF (teaser existant patterns).
- **Conversion :** `SignInButton` modal pour débloquer sauvegarde / historique.

---

## 3. UX Goals
- **Honnêteté cognitive :** disclaimers visibles, vocabulaire non juridique trompeur.
- **Empowerment :** montrer leviers d’amélioration du score.
- **Émotion :** apaisement — éviter alarmisme.

---

## 4. Layout Architecture
Intro pédagogique → formulaire profil (sections) → CTA calcul → résultat (graph + narrative) → recommandations liées.

---

## 5. Full Section Breakdown
### 5.1 Parameter form
Groupes : démographie, objectif, historique voyage, contraintes financières (adapter au code réel).

### 5.2 Results visualization
`ScoreBreakdownChart` / radar — légende claire.

### 5.3 Narrative panel
Texte `probability-profile-narrative` style — ton coach.

### 5.4 Auth gate
Modal Clerk — message valeur “sauvegarder ce scénario”.

---

## 6. UI Design Direction
Couleur **orbitale** : dégradés radiaux légers derrière graph ; fond carte neutre.

---

## 7. Interaction Design
Animation compteur score (respect reduced motion = instant).

---

## 8. Responsive UX
Graphiques : empilement vertical ; formulaire sections accordion mobile.

---

## 9. Accessibility
Résultats : texte alternatif aux graphiques ; formulaires `aria-describedby` vers disclaimers.

---

## 10. Edge Cases & States
Profil incomplet : CTA disabled + checklist ; erreur serveur : retry ; session expirée : réauth.

---

## 11. User Journey Connections
Vers reco engine pro ; vers pays ciblés.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Visualiser le score comme **anneau de précision orbital** (cercle fin + gap). Narratif dans **panneau “brief conseiller”** avec icône monoline. Modal auth : **fond flou fort** + carte centrée minimaliste.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 05]
