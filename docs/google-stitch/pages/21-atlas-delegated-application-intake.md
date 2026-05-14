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
**Implémentation :** `app/(public)/services/delegated-applications/apply/page.tsx` enveloppe **`DelegatedApplicationApplyClient`** dans **`Suspense`** avec fallback spinner (`ApplyFallback`). Le détail des champs / étapes vit dans le client (voir `DelegatedApplicationApplyClient.tsx`).

---

## 5. Full Section Breakdown

### 5.0 Entrée query depuis **PAGE 20**
- **Params typiques :** `category`, `package`, et optionnellement `countryId` / `countryName` (suffixe généré par `PackageCard`).
- **Purpose :** pré-sélection forfait + pays cibles dans le formulaire.

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
Fichier repo : `docs/google-stitch/assets/page-21-atlas-stitch-reference.png`

**Architecture livrée (Stitch v1 — VisaFlow Vault clean banking)** : shell **cream `#FAF7EE`**. Breadcrumb mono `← RETOUR AU CATALOGUE` (préserve `category`/`package`/`countryId`/`countryName` via lien retour). Hero **2-col** : à gauche titre serif `{pkg.name} — {country?}` + sous-ligne `Clock` `Délai de traitement estimé : {pkg.turnaroundNote}` ; à droite **stepper horizontal pill** `Informations → Détails → Documents → Confirmation` (heuristique d'étape déduite de l'avancement du formulaire : contact rempli → étape 2 ; champs projet remplis → étape 3 ; case garantie cochée → étape 4 ; succès → étape 4 active). **Layout 2-col `lg:grid-cols-[1fr_320px]`** : 
- Colonne form (gauche) : cartes blanches `border-[#0D1B3E]/10`, chaque section a une icône (`UserRound` Identité & Contact / `Plane` Détails de Mobilité / `FolderOpen` Documents Requis) + titre serif navy ; inputs cream height 48px, border thin, focus ring navy. Bloc Identité (nom/email/téléphone/langue) → bloc Projet (job ou university selon `category`) → bloc Documents (zone "Déposez vos documents ici" + textarea masquée pour décrire les pièces). Checkbox certification + bouton **navy filled `Soumettre le dossier`**. 
- Colonne summary (droite, sticky) : carte cream élevée. Eyebrow `Résumé de la demande` + référence mono `TX-XXXX-X` générée par hash stable de `pkg.id + sessionId`. Liste `Service / Traitement / Calendrier / Honoraires HT` + ligne **Total estimé** en serif navy.

Logique préservée intacte : `useSearchParams` (`category`, `package`, `countryId`, `countryName`), pré-fill Clerk `useUser`, états `job` / `university`, POST `/api/delegated-application-requests`, gestion `error` / `submitting` / `doneId` / `appToast`. État succès restylé en **reçu cream** : eyebrow `Demande enregistrée`, référence dossier `#{id}`, rappel garantie 50%, liens vers overview / catalogue / garantie. État fallback `Forfait introuvable` recolorisé cream.
