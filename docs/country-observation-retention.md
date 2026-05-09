# Rétention et purge — `CountryObservation`

## Contexte

Les lignes `CountryObservation` sont **append-only** par design (traçabilité intelligence). Sans politique, la table croît avec chaque run (World Bank, futures sources).

## Politique recommandée (à ajuster par environnement)

| Paramètre | Valeur suggérée prod | Notes |
|-----------|----------------------|--------|
| **Rétention brute** | 18–24 mois glissants | Au-delà, faible valeur opérationnelle pour la matérialisation courante ; la vérité affichée vit surtout dans `Country.full_data` matérialisé. |
| **Méthode** | Purge par `observedAt` | Simple, indexée (`@@index([observedAt])`). |
| **Avant purge** | Sauvegarde DB ou export JSON | Obligatoire si obligations légales / audit externe. |
| **Alternative** | Compaction future | Ne garder que la **dernière** observation par `(countryId, fieldPath, sourceId)` et archiver le reste hors DB — non implémenté ici. |

## Script

[`scripts/prune-country-observations.ts`](scripts/prune-country-observations.ts)

```bash
# Simulation (aucune écriture)
npx tsx scripts/prune-country-observations.ts --dry-run --older-than-days=730

# Exécution (nécessite DATABASE_URL)
npx tsx scripts/prune-country-observations.ts --older-than-days=730
```

## Automatisation

- Envisager un **workflow GitHub Actions** planifié (mensuel) avec secret `DATABASE_URL` production — **après** validation métier et sauvegardes.
- Ne pas lancer en CI sur une base de preview sans accord.

## Provenance / audit

Les runs `EnrichmentRun` restent ; seules les **observations** anciennes sont supprimées. Si vous avez besoin d’un historique long terme, exporter `valueJson` + `observedAt` vers un stockage objet avant purge.
