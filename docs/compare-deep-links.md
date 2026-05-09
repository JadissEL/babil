# Liens profonds — page **Comparer** (`/compare`)

Les paramètres sont des **query string** standard. Ils peuvent être combinés.

| Paramètre | Description | Exemple |
|-----------|-------------|---------|
| `objective` | Identifiant d’objectif (voir `COMPARE_OBJECTIVES` dans `lib/compare-objectives.ts`) | `tourism`, `work`, `studies_master` |
| `countries` | Liste d’IDs pays numériques, séparés par des virgules (max **4** côté UI) | `12,45,78` |
| `region` | Filtre région (même vocabulaire que l’explorateur) | `schengen`, `europe`, `asia` |
| `budget` | Niveau budget | `low`, `medium`, `high` |
| `difficulty` | Difficulté RDV | `Low`, `Medium`, `High`, `Extreme` |
| `schengen` | Restreindre aux pays Schengen | `1`, `true`, `yes` |

## Exemples

- Comparer le tourisme avec trois pays pré-sélectionnés :  
  `/compare?objective=tourism&countries=1,2,3`

- Objectif master avec filtres issus de l’explorateur :  
  `/compare?objective=studies_master&region=europe&budget=medium&schengen=1`

## Partage

Sur l’écran « Pays & résultats », le bouton **Copier le lien** construit une URL absolue incluant `objective`, les IDs sélectionnés dans `countries`, et les filtres présents dans la barre d’adresse (`region`, `budget`, etc.).

## Notes techniques

- Si `objective` est absent ou inconnu, l’utilisateur commence au choix du domaine.
- `countries` est lu au chargement pour pré-remplir la sélection (plafonné à 4 pays).
- Les IDs doivent correspondre aux `id` numériques Prisma des pays dans l’API `GET /api/countries`.
