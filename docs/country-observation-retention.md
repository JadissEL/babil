# Rétention et purge — `CountryObservation`

## Contexte

Les lignes `CountryObservation` sont **append-only** par design (traçabilité intelligence). Sans politique, la table croît avec chaque run (World Bank, futures sources).

## Politique recommandée (à ajuster par environnement)

| Paramètre | Valeur suggérée prod | Notes |
|-----------|----------------------|--------|
| **Rétention brute** | 18–24 mois glissants | Au-delà, faible valeur opérationnelle pour la matérialisation courante ; la vérité affichée vit surtout dans `Country.full_data` matérialisé. |
| **Méthode** | Purge par `observedAt` | Simple, indexée (`@@index([observedAt])`). |
| **Avant purge** | Sauvegarde DB ou export JSON | Obligatoire si obligations légales / audit externe. |
| **Alternative** | Compaction (C.40) | Ne garder que la **dernière** observation par `(countryId, fieldPath, sourceId)` ; le reste peut être exporté JSON avant suppression — voir script ci-dessous. |

## Script — purge par âge (C.39)

[`scripts/prune-country-observations.ts`](scripts/prune-country-observations.ts)

```bash
# Simulation (aucune écriture)
npx tsx scripts/prune-country-observations.ts --dry-run --older-than-days=730

# Exécution (nécessite DATABASE_URL)
npx tsx scripts/prune-country-observations.ts --older-than-days=730
```

## Script — compaction doublons (C.40)

[`scripts/compact-country-observations.ts`](scripts/compact-country-observations.ts) — supprime les lignes redondantes (même pays, même `fieldPath`, même `sourceId`), en conservant la ligne la plus récente selon `observedAt` puis `id`.

```bash
# Simulation
npm run db:compact-observations:dry

# Export JSON des lignes supprimées puis compaction
npx tsx scripts/compact-country-observations.ts --export-json=./archive-observations.json
```

**Ordre recommandé en maintenance** : compaction (réduit l’historique redondant), puis purge par âge si la politique TTL s’applique toujours.

## Automatisation

- **Dry-run mensuel (lecture seule)** : [`.github/workflows/country-observation-maintenance.yml`](../.github/workflows/country-observation-maintenance.yml) — affiche dans les logs le volume éligible à la purge (730 jours) et à la compaction. Secret `DATABASE_URL` requis.
- Les commandes **destructives** (`db:prune-observations`, `db:compact-observations` sans `--dry-run`) restent manuelles ou sur runbook après sauvegarde.
- Ne pas lancer la purge réelle en CI sur une base de preview sans accord.

## Provenance / audit

Les runs `EnrichmentRun` restent ; seules les **observations** anciennes sont supprimées. Si vous avez besoin d’un historique long terme, exporter `valueJson` + `observedAt` vers un stockage objet avant purge.
