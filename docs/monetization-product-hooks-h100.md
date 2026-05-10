# H.100 — Accroches produit monétisation (surface légère)

Aligné avec [`business-commercial-analysis.md`](business-commercial-analysis.md) : monter dans le parcours **sans sur-collecte** de données sur la fiche pays.

## Ce qui est en place

- **`DeepReportTeaser`** (`components/monetization/DeepReportTeaser.tsx`) sur la fiche pays publique : renvoie vers le moteur **probabilités** (`/probability`) et le service **demandes déléguées** (`/services/delegated-applications`), en rappelant que les signaux sont déjà ceux de la plateforme.

## Principes

- Pas de formulaire ni de champs supplémentaires sur ce bloc : évite l’effet “collecte cachée”.
- Cohérence avec l’échelle commerciale suggérée dans l’analyse : découverte gratuite → approfondissement / services.

## Suite possible (hors périmètre immédiat)

- Pré-remplissage contextuel (pays) sur les parcours cibles **uniquement** si le produit expose déjà cette capacité côté serveur / state — pas via paramètres d’URL trompeurs.
