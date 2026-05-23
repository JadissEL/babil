import { describe, expect, it } from 'vitest';
import { getJobBudgetSnapshot, maxManifestUrlsPerJob } from './job-budget';

describe('job-budget', () => {
  it('exposes budget snapshot shape', () => {
    const snap = getJobBudgetSnapshot({ jobsCreatedToday: 10, manifestFetchCreatedToday: 2 });
    expect(snap.maxJobsPerDay).toBeGreaterThan(0);
    expect(snap.jobBudgetUtilization).toBeGreaterThanOrEqual(0);
    expect(snap.remainingJobsToday).toBe(snap.maxJobsPerDay - 10);
  });

  it('maxManifestUrlsPerJob is positive', () => {
    expect(maxManifestUrlsPerJob()).toBeGreaterThan(0);
  });
});
