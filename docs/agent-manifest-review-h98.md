# H.98 — Revue humaine du manifeste agents (URL map)

Ce document décrit le **processus de validation** avant qu’un fichier `data/agent-manifest-url-map.json` (ou équivalent via `AGENT_MANIFEST_MAP_PATH`) soit considéré **prêt production** pour les appels HTTP agents (`lib/agent-manifest-source-fetch.ts`).

## Périmètre

- Fichier généré / complété à partir du scaffold : [`data/agent-manifest-url-map.scaffold.json`](../data/agent-manifest-url-map.scaffold.json).
- Le fichier effectif utilisé en runtime est en principe **hors dépôt** (gitignored) ; seul le scaffold et la doc restent versionnés.

## Checklist avant merge / déploiement worker

1. **Couverture** : chaque entrée utile a un `urlTemplate` non vide, en **https**, avec placeholders autorisés (`{country}`, `{region}`, `{slug}`, `{encodedCountry}`) documentés dans [`scripts/scaffold-agent-manifest-url-map.ts`](../scripts/scaffold-agent-manifest-url-map.ts).
2. **Stabilité** : URL d’API ou page **stable** (éviter pages de session, redirects chaînés, ou endpoints non documentés).
3. **Légalité / ToS** : usage conforme aux conditions du fournisseur (scraping, rate limits, robots).
4. **Hôtes** : après chargement, seuls les hôtes dérivés des templates valides sont autorisés — vérifier qu’aucun domaine inattendu n’apparaît dans les templates complétés.
5. **Version** : incrémenter `version` dans le JSON lors d’un changement substantiel pour tracer les déploiements.
6. **Staging** : faire tourner un cycle agent sur un **jeu restreint** de pays avec budget / concurrence bas — inspecter les extraits et erreurs HTTP avant production complète.
7. **Revue** : au moins **une revue humaine** (PR) par personne autorisée sur le dépôt ; pas de promotion directe scaffold → prod sans revue.

## Après déploiement

- Surveiller les logs `manifest` / erreurs réseau et ajuster templates ou TTL (`AGENT_MANIFEST_REFETCH_TTL_MS`, etc.) selon [`docs/agent-safeguards-h97.md`](agent-safeguards-h97.md).

## Référence scaffold

Le scaffold peut inclure une clé **`_humanReview`** (métadonnée documentaire) : elle n’est **pas** lue par le chargeur runtime et sert de rappel process.
