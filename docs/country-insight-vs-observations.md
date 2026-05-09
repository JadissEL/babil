# CountryInsight vs CountryObservation (B.33)

## Rôles

| Source | Nature | Versionnement | Usage produit |
|--------|--------|---------------|---------------|
| **`CountryInsight`** | Texte libre (OSINT, friction, sentiment), plusieurs lignes possibles par pays | Pas d’historique structuré par champ | Encart repliable « Notes terrain (base de données) » — contexte qualitatif |
| **`CountryObservation`** | Faits atomiques (`fieldPath`, valeur, source, date, `confidence`) | Append-only, traçable | Pipeline intelligence → matérialisation vers `full_data` + provenance API (`intelligence=1`) |
| **`full_data` (JSON)** | Cache lecture fusionné (statique + DB + matérialisations) | Journal interne `_data_changelog` (non public) | Fiche pays, moteurs reco / proba |

## Décision produit (v1)

- **Pas de fusion automatique** du texte `CountryInsight` dans `full_data` : évite les collisions avec les blocs structurés et le contrat d’affichage.
- **Complémentarité** : l’utilisateur voit les chiffres / blocs structurés **et**, si présent, les notes rédactionnelles séparément.
- **Évolution possible** : migrer vers des observations de type « narrative » taxonomisées **ou** déprécier `CountryInsight` après décision explicite (export + archivage), pas en silence.

## Fichiers de référence

- UI : [`components/country/CountryDbInsightsCollapsible.tsx`](../components/country/CountryDbInsightsCollapsible.tsx)
- Taxonomie chiffrée : [`lib/intelligence-pipeline/taxonomy-v1.ts`](../lib/intelligence-pipeline/taxonomy-v1.ts)
- Audit historique : [`docs/db-frontend-ux-audit.md`](db-frontend-ux-audit.md) §6
