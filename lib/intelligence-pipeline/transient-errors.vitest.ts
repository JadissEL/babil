import { describe, expect, it } from 'vitest';
import { classifyPipelineError, shouldRetryFailedJob } from './transient-errors';

describe('classifyPipelineError', () => {
  it('marks not found as permanent', () => {
    expect(classifyPipelineError('Country id=99 not found')).toBe('permanent');
    expect(shouldRetryFailedJob('Country id=99 not found')).toBe(false);
  });

  it('marks timeouts as transient', () => {
    expect(classifyPipelineError('fetch failed: timeout')).toBe('transient');
    expect(shouldRetryFailedJob('fetch failed: timeout')).toBe(true);
  });
});
