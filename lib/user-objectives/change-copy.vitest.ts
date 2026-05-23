import { describe, expect, it } from 'vitest';
import { objectiveChangeCopy, objectiveTransitionPhaseLabel } from '@/lib/user-objectives/change-copy';

describe('objectiveChangeCopy', () => {
  it('uses first-pick wording when fromSlug is null', () => {
    const copy = objectiveChangeCopy(null, 'tourism');
    expect(copy.fromLabel).toBeNull();
    expect(copy.toLabel).toBe('Tourisme');
    expect(copy.headline).toContain('définir votre objectif principal');
    expect(copy.headline).toContain('Tourisme');
  });

  it('uses switch wording when from and to differ', () => {
    const copy = objectiveChangeCopy('tourism', 'studies_phd');
    expect(copy.fromLabel).toBe('Tourisme');
    expect(copy.toLabel).toBe('Doctorat (PhD)');
    expect(copy.headline).toContain('Tourisme');
    expect(copy.headline).toContain('Doctorat (PhD)');
  });
});

describe('objectiveTransitionPhaseLabel', () => {
  it('returns phase labels by progress', () => {
    expect(objectiveTransitionPhaseLabel(0)).toBe('Préparation du parcours…');
    expect(objectiveTransitionPhaseLabel(0.5)).toBe('Alignement de l’accueil…');
    expect(objectiveTransitionPhaseLabel(0.9)).toBe('Finalisation…');
  });
});
