import { describe, expect, it, beforeEach } from 'vitest';
import { isHostCircuitOpen, recordFetchFailure, recordFetchSuccess } from './fetch-circuit-breaker';

describe('fetch-circuit-breaker', () => {
  const host = `test-host-${Date.now()}.example.com`;

  beforeEach(() => {
    recordFetchSuccess(host);
  });

  it('opens after repeated failures', () => {
    for (let i = 0; i < 5; i++) recordFetchFailure(host);
    expect(isHostCircuitOpen(host)).toBe(true);
  });

  it('closes after success', () => {
    for (let i = 0; i < 5; i++) recordFetchFailure(host);
    recordFetchSuccess(host);
    expect(isHostCircuitOpen(host)).toBe(false);
  });
});
