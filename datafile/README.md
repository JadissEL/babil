# Master list des sources (datafile)

## Fichier canonique

- **`sources.master.json`** — liste des ~300 sources de confiance (format v1 ci-dessous).

## Schéma `sources.master.json`

```json
{
  "version": 1,
  "generatedAt": "ISO-8601",
  "sources": [
    {
      "id": "world_bank",
      "name": "World Bank",
      "baseUrl": "https://www.worldbank.org",
      "tier": "official",
      "topics": ["statistics", "economy"],
      "countryScope": "global",
      "language": "en",
      "trustScore": 95,
      "authorityScore": 98,
      "reliabilityLevel": "high",
      "updateFrequencyHint": "quarterly",
      "notes": "optional",
      "requiresDiscoveryGate": true
    }
  ]
}
```

## Commandes

```bash
# Générer sources.master.json depuis lib/agent-research-sources.ts (si vide)
npm run datafile:build-master

# Valider + dédupliquer vs manifest Prisma
npm run datafile:ingest
```

## Piste parallèle

Les sources avec `requiresDiscoveryGate: true` ne sont **pas collectées** tant que `SourceSiteInventory.status !== complete` (sauf `procedural_no_fetch` documenté en admin).
