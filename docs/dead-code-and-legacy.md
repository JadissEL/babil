# Inventaire legacy / hors App Router (F.85)

Ce document répond au backlog **F.85** : ce qui existe encore **à côté** de Next.js App Router et du rôle attendu en prod.

## `server.js` (Express)

- **Emplacement :** racine du repo, `server.js`.
- **Rôle :** API Express minimale (Pays, commentaires, moteur de reco simulé) avec Prisma direct.
- **Statut :** **héritage** — le produit exposé en production repose sur **`app/api/**`** (Next Route Handlers), pas sur ce serveur.
- **Risque :** confusion pour les nouveaux contributeurs (deux stacks API). Aucun script `npm` standard ne lance `server.js` dans [`package.json`](../package.json) ; vérifier les docs internes / Render avant suppression.

## Dépendances associées

- **`express`**, **`cors`** : utilisées par `server.js` ; Next.js ne les utilise pas pour les routes App Router.

## Recommandations (hors périmètre immédiat)

1. Confirmer qu’aucun environnement (staging, scripts ops) ne démarre `node server.js`.
2. Si inutilisé : archiver dans un dossier `legacy/` ou supprimer + retirer deps, avec PR dédiée.
3. Garder une trace dans ce fichier lors de toute décision (supprimé / conservé pour X).

## App Router (référence)

- Liste pays / détail : [`app/api/countries/`](../app/api/countries/), [`app/api/countries/[id]/`](../app/api/countries/[id]/).
- Commentaires : [`app/api/comments/`](../app/api/comments/).
- Recommandation / probabilité : [`app/api/recommendation/`](../app/api/recommendation/), [`app/api/probability/`](../app/api/probability/).
