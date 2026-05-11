# PAGE 20 — “CONCIERGE”
## Délégation de demandes — catalogue services (`/services/delegated-applications`)

### File Name
`20-concierge-delegated-services.md`

### Page Type
Public

### Related User Journeys
- Passage de l’auto-service à l’humain
- Compréhension SKU / étapes

### Connected Pages
- **Précédent :** hub pays, investment, home
- **Suivant :** `/services/delegated-applications/apply`

---

## 1. Page Purpose
Présenter le **catalogue de services délégués** (`DelegatedServiceCatalog`) avec niveaux de confiance, délais indicatifs, pricing hints. Résout *“Qu’est-ce que vous pouvez faire pour moi ?”*

---

## 2. Primary User Actions
- **Primaires :** comparer offres ; démarrer demande.
- **Secondaires :** voir demandes existantes (`MyDelegatedRequests` si connecté).

---

## 3. UX Goals
- **Transparence process** (étapes, documents).
- **Réassurance** anti-arnaque (badges officiels, SLA).

---

## 4. Layout Architecture
Hero service premium → grille offres → tableau comparatif features → FAQ trust → CTA apply.

---

## 5. Full Section Breakdown

### 5.1 Hero “Sérénité & clarté”
- **Purpose :** rassurer avant catalogue : processus en 3 étapes (Choisir → Décrire → Suivre), délai de réponse humain, mention sécurité des données.
- **Trust row :** icônes monoline (cadenas, horloge, personne) + courte légende.

### 5.2 `DelegatedServiceCatalog` — grille SKUs
- **Carte service :** titre, **prix indicatif** ou “Sur devis”, durée estimée, **niveau d’effort utilisateur** (faible/moyen), CTA “Démarrer”.
- **Badge “Populaire”** : au plus une carte pour ne pas diluer l’effet.
- **Hover :** overlay “Inclus : …” (3 bullets max : revue documents, checklist, suivi email).
- **Empty catalogue :** message + email contact / lien overview si connecté.

### 5.3 Tableau comparatif features
- **Purpose :** lignes = livrables (sessions appel, relances, nombre de revisions incluses) ; colonnes = offres.
- **Responsive :** scroll horizontal + gradient masque droite pour indiquer suite.
- **A11y :** première colonne `scope="row"` textuelle.

### 5.4 Bloc “Mes demandes” (`MyDelegatedRequests`)
- **Purpose :** si **SignedIn** : tableau compact ou cards 3 dernières demandes avec **statut** (`delegated-application-status` patterns : brouillon, envoyé, en cours, clos).
- **SignedOut :** teaser “Créez un compte pour suivre vos dossiers” + pas de données vides bruyantes.

### 5.5 FAQ & objections
- **Purpose :** répondre à “Pourquoi payer ?”, “Délai”, “Remboursement”, “Données personnelles” en accordéons.
- **Ton :** factuel, non agressif commercial.

### 5.6 Promo contextuelle (optionnel)
- **Purpose :** `DelegatedApplicationsHomePromo` si réutilisé ici : lien depuis hub pays — cohérence visuelle avec **PAGE 16** bandeau.

### 5.7 CTA final & secondaire
- **Primary :** vers **PAGE 21** avec **serviceId** pré-sélectionné si clic depuis une carte.
- **Secondary :** contact humain (mailto ou chat futur).

---

## 6. UI Design Direction
Esthétique **concierge hôtel 5* numérique** : noir profond + filets or pâle (très subtil) sur CTA zones.

---

## 7. Interaction Design
Hover carte : révèle “3 prochaines étapes” overlay léger.

---

## 8. Responsive UX
Comparatif : scroll horizontal avec hint shadow.

---

## 9. Accessibility
Tableau comparatif avec header sticky + rôles ARIA.

---

## 10. Edge Cases & States
Aucun service disponible : contact support ; maintenance : bannière.

---

## 11. User Journey Connections
Vers apply ; retour pays.

---

## 12. AI DESIGN INSTRUCTIONS FOR STITCH
Créer **ribbon “Sérénité”** au-dessus hero. Offres comme **fiches menu gastronomique** — hiérarchie prix discrète mais lisible.

---

## 13. Screenshot Placeholder

### Stitch Screenshot Reference
[PASTE SCREENSHOT HERE — PAGE 20]
