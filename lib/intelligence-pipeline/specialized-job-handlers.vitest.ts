import { describe, expect, it } from 'vitest';
import {
  SPECIALIZED_JOB_CATEGORY_IDS,
  categoryIdsForSpecializedKind,
} from './specialized-job-handlers';
import { INTELLIGENCE_JOB_KINDS } from './job-kinds';

describe('specialized-job-handlers', () => {
  it('maps visa_friction to visa-related categories', () => {
    const ids = categoryIdsForSpecializedKind(INTELLIGENCE_JOB_KINDS.visa_friction);
    expect(ids).toContain('visa_immigration');
    expect(ids).toContain('ma_visa_corridor_services');
  });

  it('maps education to study categories', () => {
    const ids = categoryIdsForSpecializedKind(INTELLIGENCE_JOB_KINDS.education);
    expect(ids).toEqual(SPECIALIZED_JOB_CATEGORY_IDS.education);
  });
});
