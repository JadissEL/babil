# Stratégie i18n — chaînes métier (B.38)

## Objectif

Éviter les **concaténations ad hoc** (`"Bonjour " + name`) et les textes utilisateur éparpillés : tout libellé produit doit passer par des **clés** dans un catalogue typé, avec **paramètres nommés** pour l’interpolation.

## Locales supportées

| Code | Usage |
|------|--------|
| `fr` | Défaut produit (UI, emails futurs, API si non précisé) |
| `en` | Deuxième locale ; les clés existent pour le cœur scoring (pilote) |

Résolution côté serveur / scripts : variable d’environnement **`BABIL_LOCALE`** (`fr` \| `en`).  
Côté client Next : pour l’instant l’UI reste majoritairement en français ; l’extension `NEXT_PUBLIC_BABIL_LOCALE` pourra aligner le navigateur plus tard.

## Fichiers

- **Catalogue scoring (pilote)** : [`lib/i18n/catalog-scoring.ts`](../lib/i18n/catalog-scoring.ts)
- **Interpolation sûre** : [`lib/i18n/interpolate.ts`](../lib/i18n/interpolate.ts)
- **Locale** : [`lib/i18n/locale.ts`](../lib/i18n/locale.ts)

## Règles

1. **Clés hiérarchiques** : `scoring.reco.visa`, `scoring.driverLine`, etc. — pas de phrases en dur dans les composants pour les nouveaux écrans.
2. **Interpolation** : uniquement via `interpolate(template, { key: value })` ; les paramètres sont documentés à côté de la chaîne dans le catalogue.
3. **Pluriels / genre** : pour le français, préférer des clés séparées (`items.zero`, `items.one`, `items.many`) ou des messages qui évitent l’accord ambigu ; pas de logique grammaticale complexe dans les composants.
4. **API JSON** : les routes peuvent continuer à renvoyer des structures stables (`key` sur `topDrivers`) ; les **labels** affichables peuvent suivre la locale si on expose un paramètre `locale` ou l’en-tête `Accept-Language` (évolution progressive).
5. **Migration progressive** : déplacer les modules les plus visibles (scoring, probabilité, erreurs API) avant le long tail des pages marketing.

## Hors périmètre immédiat

- Pas de dépendance `next-intl` tant que le routage par locale (`/en/...`) n’est pas une priorité produit.
- Contenu éditorial long (articles) peut rester en Markdown par langue plus tard.
