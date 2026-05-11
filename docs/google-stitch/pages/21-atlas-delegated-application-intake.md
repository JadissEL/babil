# PAGE 21 — “ATLAS+”
## Délégation — formulaire de demande (`/services/delegated-applications/apply`)

### File Name
`21-atlas-delegated-application-intake.md`

### Page Type
Public (forte conversion — utilisateur souvent authentifié)

### Related User Journeys
- Soumission dossier / demande assistance
- Paiement (futur) post-form

### Connected Pages
- **Précédent :** catalogue services
- **Suivant :** confirmation (futur), `/overview`

---

## 1. Page Purpose
Collecter **informations structurées** pour traitement opérationnel (`DelegatedApplicationApplyClient`). Résout *“Comment je confie mon dossier sans friction ?”* Business : lead qualité + réduction allers-retours ops.

---

## 2. Primary User Actions
- **Primaires :** remplir champs dynamiques par type service ; soumettre.
- **Secondaires :** sauvegarder brouillon (futur) ; upload pièces (futur).

---

## 3. UX Goals
- **Confiance** maximale (progress, privacy, SLA répété).
- **Clarté** validation Zod-like (erreurs inline).

---

## 4. Layout Architecture
Stepper horizontal (si multi-étapes) → corps formulaire → récapitulatif → submit.

---

## 5. Full Section Breakdown

### 5.1 En-tête de parcours
- **Purpose :** rappeler le **SKU service** choisi (titre + sous-titre + durée indicative de traitement).
- **Interaction :** lien retour catalogue sans perdre les champs déjà saisis (confirm dialog si dirty).

### 5.2 Stepper / progression
- **Purpose :** si flux multi-étapes : “Informations → Détails voyage → Documents → Confirmation”.
- **States :** étape courante surlignée ; étapes futures désactivées jusqu’à validation Zod de l’étape N.

### 5.3 Bloc identité & contact
- **Purpose :** nom, email, téléphone, nationalité, résidence ; pré-remplissage depuis Clerk quand disponible.
- **Privacy :** micro-copy RGPD-friendly sous le bloc.

### 5.4 Détails mobilité
- **Purpose :** destination(s), dates prévues, type de demande, urgence, budget indicatif (champs dynamiques selon `delegated-application-catalog`).
- **Validation :** messages inline par champ ; focus premier erreur au submit.

### 5.5 Pièces & médias (futur upload)
- **Purpose :** liste check-list documents attendus ; drag-drop zone avec états virus-scan / taille max (copy).
- **Empty :** si pas d’upload : textarea “Décrivez les documents dont vous disposez”.

### 5.6 Récapitulatif avant envoi
- **Purpose :** liste récap claire + case à cocher “Je confirme l’exactitude des informations”.
- **Destructive guard :** bouton submit désactivé tant que case non cochée.

### 5.7 Confirmation & post-submit
- **Purpose :** page ou modal “Demande reçue” avec **numéro de dossier** + prochaines étapes email.
- **Error :** si 409 / duplicate : message + lien vers “Mes demandes” (`MyDelegatedRequests`).

### 5.8 Bloc légal & consentement
- **Purpose :** CGU services, limitation de responsabilité, durée de conservation des données.
- **Accessibility :** liens externes ouvrent nouvel onglet avec `rel` approprié.

---

## 6. UI Design Direction
Formulaire **clean banking** : champs hauts 48px, labels persistants.

---

## 7. Interaction Design
Validation live ; shake subtil erreur (si reduced motion = color flash only).

---

## 8. Responsive UX
Stepper devient vertical timeline ; bouton submit sticky bottom.

---

## 9. Accessibility
Erreurs liées `aria-describedby` ; stepper `aria-current="step"`.

---

## 10. Edge Cases & States
Session expirée : sauvegarde localStorage warning ; offline : queue message.

---

## 11. User Journey Connections
Retour catalogue ; après succès vers overview “Mes demandes”.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Stepper **glass pills** avec progression lumineuse. Résumé final comme **reçu thermal stylisé** (sans effet gimmick cheap — élégance).

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 21]
