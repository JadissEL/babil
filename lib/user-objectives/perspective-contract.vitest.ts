import { describe, expect, it } from 'vitest';
import { USER_OBJECTIVE_SLUGS } from '@/lib/user-objectives/registry';
import {
  hubGateForPath,
  isNavHrefActionable,
  perspectiveContractFromSlug,
} from '@/lib/user-objectives/perspective-contract';

describe('perspectiveContractFromSlug', () => {
  it('maps every registry slug to a contract', () => {
    for (const slug of USER_OBJECTIVE_SLUGS) {
      const c = perspectiveContractFromSlug(slug);
      expect(c).not.toBeNull();
      expect(c?.slug).toBe(slug);
      expect(c?.compareObjectiveId).toBeTruthy();
      expect(c?.explorerGoal).not.toBe('all');
    }
  });

  it('tourism locks explorer to tourism and gates education hub', () => {
    const c = perspectiveContractFromSlug('tourism')!;
    expect(c.explorerGoal).toBe('tourism');
    expect(c.primaryScoreFocus).toBe('tourism');
    expect(isNavHrefActionable('/education', c)).toBe(false);
    expect(hubGateForPath('/education', c)?.hubLabel).toBe('Études');
    expect(isNavHrefActionable('/schengen', c)).toBe(true);
  });

  it('studies_master allows education hub', () => {
    const c = perspectiveContractFromSlug('studies_master')!;
    expect(c.explorerGoal).toBe('study');
    expect(isNavHrefActionable('/education', c)).toBe(true);
    expect(hubGateForPath('/education', c)).toBeNull();
  });
});
