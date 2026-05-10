# H.100 — Accroches produit monétisation (surface légère)

Aligné avec [`business-commercial-analysis.md`](business-commercial-analysis.md) : monter dans le parcours **sans sur-collecte** de données sur la fiche pays.

## Ce qui est en place

- **`DeepReportTeaser`** (`components/monetization/DeepReportTeaser.tsx`) sur la fiche pays publique : liens vers **`/probability?countryId=…&countryName=…`** et **`/services/delegated-applications?…`** (nom de pays = libellé public uniquement).
- **Probabilités** : `POST /api/probability` accepte **`focusCountryId`** (voir `RecoProbaPostBody` / OpenAPI) — le pays ciblé est listé en premier sans changer les scores ; la page probabilités relit les query params et affiche un bandeau + ouverture du détail du pays.
- **Assist candidatures** : la page catalogue et le flux **apply** propagent les mêmes paramètres ; **`targetCountries`** du formulaire est pré-rempli lorsque le champ est encore vide.

## Principes

- Pas de formulaire ni de champs supplémentaires sur le teaser : les paramètres d’URL ne font que **orienter** des parcours déjà prévus.
- Cohérence avec l’échelle commerciale suggérée dans l’analyse : découverte gratuite → approfondissement / services.

## Suite possible (hors périmètre immédiat)

- Affiner le pré-remplissage métier (ex. séparation pays / écoles) lorsque les formulaires le permettront.
