import { describe, expect, it, vi } from 'vitest';
import {
  logPipelineExternalBudgetWarnings,
  parsePositiveIntEnv,
  shouldWarnWorldBankHttpCalls,
} from '@/lib/pipeline-external-budget';

describe('parsePositiveIntEnv', () => {
  it('returns null for empty or invalid', () => {
    expect(parsePositiveIntEnv(undefined)).toBeNull();
    expect(parsePositiveIntEnv('')).toBeNull();
    expect(parsePositiveIntEnv('0')).toBeNull();
    expect(parsePositiveIntEnv('x')).toBeNull();
  });

  it('parses positive integers', () => {
    expect(parsePositiveIntEnv('500')).toBe(500);
    expect(parsePositiveIntEnv('1')).toBe(1);
  });
});

describe('shouldWarnWorldBankHttpCalls', () => {
  it('is false when limit or calls missing', () => {
    expect(shouldWarnWorldBankHttpCalls(undefined, 100)).toBe(false);
    expect(shouldWarnWorldBankHttpCalls(50, null)).toBe(false);
  });

  it('is true when calls exceed limit', () => {
    expect(shouldWarnWorldBankHttpCalls(101, 100)).toBe(true);
    expect(shouldWarnWorldBankHttpCalls(100, 100)).toBe(false);
  });
});

describe('logPipelineExternalBudgetWarnings', () => {
  it('emits warn JSON when over soft limit', () => {
    const prev = process.env.INTELLIGENCE_PIPELINE_WB_HTTP_SOFT_LIMIT;
    process.env.INTELLIGENCE_PIPELINE_WB_HTTP_SOFT_LIMIT = '10';
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logPipelineExternalBudgetWarnings({
      runId: 'run-1',
      status: 'SUCCEEDED',
      worldBank: { apiBatchCalls: 11 },
    });

    expect(errSpy).toHaveBeenCalledTimes(1);
    const line = JSON.parse(String(errSpy.mock.calls[0][0])) as Record<string, unknown>;
    expect(line.msg).toBe('pipeline_external_calls_budget_soft_exceeded');
    expect(line.worldBankApiBatchCalls).toBe(11);
    expect(line.softLimit).toBe(10);

    errSpy.mockRestore();
    if (prev === undefined) delete process.env.INTELLIGENCE_PIPELINE_WB_HTTP_SOFT_LIMIT;
    else process.env.INTELLIGENCE_PIPELINE_WB_HTTP_SOFT_LIMIT = prev;
  });
});
