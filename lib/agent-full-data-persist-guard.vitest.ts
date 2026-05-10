import { describe, it, expect, afterEach } from 'vitest';
import {
  agentFullDataJsonMaxBytes,
  validateAgentFullDataForPersist,
} from '@/lib/agent-full-data-persist-guard';

const envSnapshot = { ...process.env };

afterEach(() => {
  process.env = { ...envSnapshot };
});

describe('agentFullDataJsonMaxBytes', () => {
  it('defaults when unset', () => {
    delete process.env.AGENT_FULL_DATA_JSON_MAX_BYTES;
    expect(agentFullDataJsonMaxBytes()).toBe(12_000_000);
  });
});

describe('validateAgentFullDataForPersist', () => {
  it('accepts minimal object', () => {
    expect(validateAgentFullDataForPersist({ friction_score: 40 })).toEqual({ ok: true });
  });

  it('rejects non-array travel_reasons', () => {
    const r = validateAgentFullDataForPersist({ travel_reasons: 'nope' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('travel_reasons_must_be_array');
  });

  it('rejects non-object _agent', () => {
    const r = validateAgentFullDataForPersist({ _agent: [] });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('_agent_must_be_object');
  });

  it('rejects oversized JSON', () => {
    process.env.AGENT_FULL_DATA_JSON_MAX_BYTES = '80';
    const r = validateAgentFullDataForPersist({ x: 'y'.repeat(200) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain('too_large');
  });
});
