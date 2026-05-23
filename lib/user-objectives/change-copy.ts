import { getObjectiveBySlug, type UserObjectiveSlug } from '@/lib/user-objectives/registry';

export type ObjectiveChangeCopy = {
  headline: string;
  fromLabel: string | null;
  toLabel: string;
};

export function objectiveChangeCopy(
  fromSlug: UserObjectiveSlug | null,
  toSlug: UserObjectiveSlug,
): ObjectiveChangeCopy {
  const toDef = getObjectiveBySlug(toSlug);
  const toLabel = toDef?.labelFr ?? toSlug;

  if (!fromSlug) {
    return {
      headline: `Vous allez définir votre objectif principal : ${toLabel}.`,
      fromLabel: null,
      toLabel,
    };
  }

  const fromDef = getObjectiveBySlug(fromSlug);
  const fromLabel = fromDef?.labelFr ?? fromSlug;

  if (fromSlug === toSlug) {
    return {
      headline: `Votre objectif reste : ${toLabel}.`,
      fromLabel,
      toLabel,
    };
  }

  return {
    headline: `Vous allez passer de ${fromLabel} à ${toLabel}.`,
    fromLabel,
    toLabel,
  };
}

export function objectiveTransitionPhaseLabel(progress: number): string {
  if (progress < 0.35) return 'Préparation du parcours…';
  if (progress < 0.72) return 'Alignement de l’accueil…';
  return 'Finalisation…';
}
